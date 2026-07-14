import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import {
  HiOutlineMicrophone, HiOutlineVideoCamera, HiOutlinePhoneMissedCall,
  HiOutlineCode, HiOutlineChatAlt2, HiOutlineClipboardCopy, HiCheck,
  HiOutlineDownload,
} from 'react-icons/hi'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { showToast } from '../components/common/Toast'
import Loader from '../components/common/Loader'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Google's free public STUN server — enough to establish most peer-to-peer
// connections without needing a paid TURN/relay service.
const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

const LANGUAGES = ['javascript', 'python', 'java', 'c++', 'sql']

const STARTER_CODE = {
  javascript: '// Write your solution here\nfunction solve() {\n  \n}\n',
  python:     '# Write your solution here\ndef solve():\n    pass\n',
  java:       '// Write your solution here\nclass Solution {\n    void solve() {\n        \n    }\n}\n',
  'c++':      '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nvoid solve() {\n    \n}\n',
  sql:        '-- Write your query here\nSELECT *\nFROM table_name;\n',
}

export default function LiveInterview() {
  const { appId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room,        setRoom]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [connected,   setConnected]   = useState(false)
  const [peerJoined,  setPeerJoined]  = useState(false)
  const [micOn,       setMicOn]       = useState(true)
  const [camOn,       setCamOn]       = useState(true)
  const [showCode,    setShowCode]    = useState(true)
  const [showChat,    setShowChat]    = useState(false)
  const [language,    setLanguage]    = useState('javascript')
  const [code,        setCode]        = useState(STARTER_CODE.javascript)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput,   setChatInput]   = useState('')
  const [copied,      setCopied]      = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordSecs,  setRecordSecs]  = useState(0)

  const localVideoRef  = useRef(null)
  const remoteVideoRef = useRef(null)
  const socketRef       = useRef(null)
  const peerConnRef     = useRef(null)
  const localStreamRef  = useRef(null)
  const codeFromRemote   = useRef(false) // guards against echoing our own remote-applied edits back out

  // --- Recording (local, free — composites both video feeds onto a canvas
  // and mixes both audio tracks, so the downloaded file is one normal video
  // with both participants in it, not two separate recordings to sync up). ---
  const recordCanvasRef   = useRef(null)
  const recorderRef       = useRef(null)
  const recordedChunksRef = useRef([])
  const recordFrameRef    = useRef(null)
  const recordTimerRef    = useRef(null)

  // 1. Load room info (validates the current user actually belongs to this interview)
  useEffect(() => {
    api.get(`/applications/interview/${appId}`)
      .then(setRoom)
      .catch((err) => { showToast.error(err.message); navigate('/dashboard') })
      .finally(() => setLoading(false))
  }, [appId, navigate])

  // 2. Once we know the room is valid, set up media + socket + WebRTC
  useEffect(() => {
    if (!room) return
    let cancelled = false

    async function setup() {
      const socket = io(BACKEND, { transports: ['websocket'] })
      socketRef.current = socket

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
      } catch {
        showToast.error('Camera/mic access denied — you can still use the code editor and chat.')
      }

      const pc = new RTCPeerConnection(ICE_SERVERS)
      peerConnRef.current = pc

      localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current))

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]
        setConnected(true)
      }
      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit('webrtc-ice-candidate', { roomId: appId, candidate: e.candidate })
      }

      socket.emit('join-room', { roomId: appId, name: user?.name })

      socket.on('peer-joined', async () => {
        setPeerJoined(true)
        // Whoever was already in the room initiates the offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('webrtc-offer', { roomId: appId, offer })
      })

      socket.on('webrtc-offer', async ({ offer }) => {
        setPeerJoined(true)
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('webrtc-answer', { roomId: appId, answer })
      })

      socket.on('webrtc-answer', async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      })

      socket.on('webrtc-ice-candidate', async ({ candidate }) => {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch { /* ignore late candidates */ }
      })

      socket.on('code-change', ({ content, language: lang }) => {
        codeFromRemote.current = true
        setCode(content)
        if (lang) setLanguage(lang)
      })

      socket.on('interview-message', ({ text, name, at }) => {
        setChatMessages(prev => [...prev, { text, name, at }])
      })

      socket.on('peer-left', () => {
        setPeerJoined(false)
        setConnected(false)
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
      })
    }

    setup()

    return () => {
      cancelled = true
      socketRef.current?.emit('leave-room')
      socketRef.current?.disconnect()
      peerConnRef.current?.close()
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      cancelAnimationFrame(recordFrameRef.current)
      clearInterval(recordTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, appId])

  // Broadcast local code edits (skip the echo when the change came from the peer)
  useEffect(() => {
    if (codeFromRemote.current) { codeFromRemote.current = false; return }
    const t = setTimeout(() => {
      socketRef.current?.emit('code-change', { roomId: appId, content: code, language })
    }, 200) // small debounce so we don't flood the socket on every keystroke
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language])

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setMicOn(v => !v)
  }
  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setCamOn(v => !v)
  }

  const startRecording = () => {
    if (isRecording) return
    const canvas = recordCanvasRef.current
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext('2d')

    // Draw both video feeds side by side, every frame, for as long as we're recording
    const drawFrame = () => {
      ctx.fillStyle = '#0b0f19'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const halfW = canvas.width / 2
      if (remoteVideoRef.current?.readyState >= 2) {
        ctx.drawImage(remoteVideoRef.current, 0, 0, halfW, canvas.height)
      }
      if (localVideoRef.current?.readyState >= 2) {
        ctx.drawImage(localVideoRef.current, halfW, 0, halfW, canvas.height)
      }
      recordFrameRef.current = requestAnimationFrame(drawFrame)
    }
    drawFrame()

    // Mix local + remote audio into a single track (otherwise the recording
    // would only capture whichever stream the canvas happens to carry audio
    // for, which is none — canvas streams are video-only).
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const destination = audioCtx.createMediaStreamDestination()
    ;[localStreamRef.current, remoteVideoRef.current?.srcObject].forEach(stream => {
      if (stream && stream.getAudioTracks().length > 0) {
        audioCtx.createMediaStreamSource(stream).connect(destination)
      }
    })

    const canvasStream = canvas.captureStream(30)
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ])

    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9,opus' })
    recordedChunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `interview-${room?.jobTitle?.replace(/\s+/g, '-') || 'recording'}-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      audioCtx.close()
    }

    recorder.start(1000)
    recorderRef.current = recorder
    setIsRecording(true)
    setRecordSecs(0)
    recordTimerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000)
    showToast.success('Recording started — both video feeds will be saved to one file.')
  }

  const stopRecording = () => {
    if (!isRecording) return
    recorderRef.current?.stop()
    cancelAnimationFrame(recordFrameRef.current)
    clearInterval(recordTimerRef.current)
    setIsRecording(false)
    showToast.success('Recording saved to your downloads.')
  }

  const fmtSecs = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleLeave = () => {
    if (isRecording) stopRecording()
    navigate(room?.myRole === 'recruiter' ? '/recruiter/dashboard' : '/dashboard')
  }

  const sendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    socketRef.current?.emit('interview-message', { roomId: appId, text: chatInput, name: user?.name })
    setChatInput('')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (!code.trim() || Object.values(STARTER_CODE).includes(code)) setCode(STARTER_CODE[lang])
  }

  if (loading) return <Loader fullscreen label="Setting up interview room..." />
  if (!room) return null

  const otherName = room.myRole === 'recruiter' ? room.applicant?.name : room.recruiter?.name

  return (
    <div className="h-[calc(100vh-4rem)] bg-surface-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800 shrink-0">
        <div>
          <p className="text-sm font-display font-semibold">{room.jobTitle} <span className="text-surface-400 font-normal">· {room.company}</span></p>
          <p className="text-xs text-surface-400 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${peerJoined ? 'bg-accent-400' : 'bg-surface-600'}`} />
            {peerJoined ? `${otherName || 'Other participant'} is in the room` : 'Waiting for the other participant...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-danger-400 bg-danger-500/10 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-danger-500 animate-pulse" /> REC {fmtSecs(recordSecs)}
            </span>
          )}
          <button onClick={copyLink} className="btn btn-ghost btn-sm text-surface-300">
            {copied ? <><HiCheck /> Copied</> : <><HiOutlineClipboardCopy /> Copy invite link</>}
          </button>
        </div>
      </div>

      {/* Hidden canvas used to composite both video feeds when recording */}
      <canvas ref={recordCanvasRef} className="hidden" />

      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className={`relative flex-1 bg-black transition-all ${(showCode || showChat) ? 'hidden md:block md:w-1/2' : 'w-full'}`}>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {!connected && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-surface-900/60">
              <div className="w-16 h-16 rounded-full bg-primary-600/20 flex items-center justify-center text-2xl font-display">
                {(otherName || '?')[0]}
              </div>
              <p className="text-sm text-surface-300">
                {peerJoined ? 'Connecting video...' : 'Waiting for the other person to join'}
              </p>
            </div>
          )}
          <video ref={localVideoRef} autoPlay playsInline muted
            className="absolute bottom-4 right-4 w-32 md:w-44 rounded-xl border-2 border-surface-700 shadow-elevated object-cover aspect-video bg-surface-800" />
        </div>

        {/* Code editor */}
        {showCode && (
          <div className="w-full md:w-1/2 flex flex-col border-l border-surface-800 bg-surface-900">
            <div className="flex items-center justify-between px-3 py-2 border-b border-surface-800">
              <div className="flex items-center gap-1">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => handleLanguageChange(l)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                      language === l ? 'bg-primary-600 text-white' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                    }`}>{l}</button>
                ))}
              </div>
              <HiOutlineCode className="text-surface-500" />
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-surface-950 text-surface-100 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
              placeholder="Shared code editor — both participants see live changes here"
            />
          </div>
        )}

        {/* Chat panel */}
        {showChat && (
          <div className="w-full md:w-80 flex flex-col border-l border-surface-800 bg-surface-900">
            <div className="px-3 py-2 border-b border-surface-800 text-xs font-semibold text-surface-400 uppercase tracking-wide">In-call chat</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.length === 0 && <p className="text-xs text-surface-500 text-center mt-8">No messages yet</p>}
              {chatMessages.map((m, i) => (
                <div key={i} className={`text-sm ${m.name === user?.name ? 'text-right' : ''}`}>
                  <span className="text-[10px] text-surface-500 block">{m.name}</span>
                  <span className={`inline-block px-3 py-1.5 rounded-xl ${m.name === user?.name ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-200'}`}>{m.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} className="p-2 border-t border-surface-800 flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-surface-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Message..." />
              <button type="submit" className="btn btn-primary btn-sm">Send</button>
            </form>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 py-4 border-t border-surface-800 shrink-0">
        <button onClick={toggleMic}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-surface-800 hover:bg-surface-700' : 'bg-danger-500 hover:bg-danger-600'}`}>
          <HiOutlineMicrophone className="text-lg" />
        </button>
        <button onClick={toggleCam}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-surface-800 hover:bg-surface-700' : 'bg-danger-500 hover:bg-danger-600'}`}>
          <HiOutlineVideoCamera className="text-lg" />
        </button>
        <button onClick={() => setShowCode(v => !v)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${showCode ? 'bg-primary-600' : 'bg-surface-800 hover:bg-surface-700'}`}>
          <HiOutlineCode className="text-lg" />
        </button>
        <button onClick={() => setShowChat(v => !v)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${showChat ? 'bg-primary-600' : 'bg-surface-800 hover:bg-surface-700'}`}>
          <HiOutlineChatAlt2 className="text-lg" />
        </button>
        <button onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? 'Stop recording & download' : 'Record this interview (saved to your device)'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-danger-500 hover:bg-danger-600' : 'bg-surface-800 hover:bg-surface-700'}`}>
          {isRecording ? <HiOutlineDownload className="text-lg" /> : <span className="w-3.5 h-3.5 rounded-full bg-danger-500" />}
        </button>
        <button onClick={handleLeave}
          className="w-11 h-11 rounded-full bg-danger-500 hover:bg-danger-600 flex items-center justify-center ml-4">
          <HiOutlinePhoneMissedCall className="text-lg" />
        </button>
      </div>
      <p className="text-center text-[10px] text-surface-500 pb-3 -mt-2">
        Recording saves directly to your device — nothing is uploaded to a server.
      </p>
    </div>
  )
}
