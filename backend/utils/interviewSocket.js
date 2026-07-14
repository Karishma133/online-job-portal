import { Server } from 'socket.io'

/**
 * Live Interview real-time layer.
 * ---------------------------------------------------------------------------
 * Two things happen over this socket connection, scoped to a "room" (the
 * application's _id, since each application has exactly one interview):
 *
 *  1. WebRTC signaling — this server never sees or touches video/audio
 *     itself (that's peer-to-peer between the two browsers, free, no
 *     third-party video service). It only relays the small handshake
 *     messages (offer/answer/ICE candidates) each side needs to establish
 *     that direct connection.
 *
 *  2. Live code editor sync — plain "here's the new content" broadcasts to
 *     everyone else in the room. Good enough for a two-person interview;
 *     not attempting operational-transform/CRDT conflict resolution since
 *     that's overkill for this use case.
 *
 * Nothing here costs money or needs an API key — socket.io is open source,
 * and WebRTC's STUN server (used to discover each peer's public address) is
 * Google's free public one.
 */
export function attachInterviewSocket(httpServer, clientUrl) {
  const io = new Server(httpServer, {
    cors: { origin: clientUrl || 'http://localhost:3000', credentials: true },
  })

  io.on('connection', (socket) => {
    let currentRoom = null

    socket.on('join-room', ({ roomId, name }) => {
      currentRoom = roomId
      socket.join(roomId)
      socket.data.name = name
      // Let the other participant (if already in the room) know someone joined,
      // so they can kick off the WebRTC offer.
      socket.to(roomId).emit('peer-joined', { name })
    })

    // --- WebRTC signaling relay ---
    socket.on('webrtc-offer',     (payload) => socket.to(payload.roomId).emit('webrtc-offer', payload))
    socket.on('webrtc-answer',    (payload) => socket.to(payload.roomId).emit('webrtc-answer', payload))
    socket.on('webrtc-ice-candidate', (payload) => socket.to(payload.roomId).emit('webrtc-ice-candidate', payload))

    // --- Shared code editor ---
    socket.on('code-change', ({ roomId, content, language }) => {
      socket.to(roomId).emit('code-change', { content, language })
    })

    // --- Simple in-call chat (separate from the app's async messaging) ---
    socket.on('interview-message', ({ roomId, text, name }) => {
      io.to(roomId).emit('interview-message', { text, name, at: Date.now() })
    })

    socket.on('leave-room', () => {
      if (currentRoom) socket.to(currentRoom).emit('peer-left')
    })

    socket.on('disconnect', () => {
      if (currentRoom) socket.to(currentRoom).emit('peer-left')
    })
  })

  return io
}
