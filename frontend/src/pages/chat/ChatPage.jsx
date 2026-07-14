import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlinePaperAirplane, HiOutlineChatAlt2, HiOutlineSearch, HiOutlineBriefcase } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { getInitials, timeAgo } from '../../utils/helpers'
import { showToast } from '../../components/common/Toast'
import Loader from '../../components/common/Loader'

/** Deterministic gradient tint per person, so the same name always gets the
 *  same avatar color instead of everyone being identical flat primary-600. */
const AVATAR_GRADIENTS = [
  'from-primary-500 to-primary-700',
  'from-signal-400 to-signal-600',
  'from-accent-400 to-accent-600',
  'from-primary-400 to-signal-500',
]
function avatarGradient(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[idx] || AVATAR_GRADIENTS[0]
}

export default function ChatPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [chats,       setChats]       = useState([])
  const [activeChat,  setActiveChat]  = useState(null)
  const [messages,    setMessages]    = useState([])
  const [newMessage,  setNewMessage]  = useState('')
  const [search,      setSearch]      = useState('')
  const [loading,     setLoading]     = useState(true)
  const [sending,     setSending]     = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    api.get('/chat').then(d => {
      const list = d.chats || []
      setChats(list)
      // If we arrived here via "Message recruiter" on a job page, open that
      // conversation immediately instead of leaving the list empty-selected.
      const openId = location.state?.openChatId
      if (openId) {
        const match = list.find(c => c._id === openId)
        if (match) setActiveChat(match)
      }
    }).catch(() => {}).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeChat) setMessages(activeChat.messages || [])
  }, [activeChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return
    setSending(true)
    try {
      const data = await api.post(`/chat/${activeChat._id}/messages`, { content: newMessage })
      setMessages(prev => [...prev, data.message])
      setChats(prev => prev.map(c => c._id === activeChat._id ? { ...c, messages: [...(c.messages || []), data.message] } : c))
      setNewMessage('')
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  const otherParticipant = (chat) =>
    chat.participants?.find(p => p._id !== user?._id) || {}

  const filteredChats = chats.filter(c => {
    if (!search.trim()) return true
    const name = otherParticipant(c).name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  if (loading) return <Loader fullscreen label="Loading conversations..." />

  return (
    <div className="section pt-6">
      <div className="container-app max-w-5xl px-4">
        <h1 className="page-title mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-card bg-white dark:bg-surface-900" style={{ height: '70vh' }}>

          {/* Sidebar - chat list */}
          <div className="border-r border-surface-100 dark:border-surface-800 overflow-y-auto bg-surface-50/50 dark:bg-surface-950/50">
            <div className="p-3 border-b border-surface-100 dark:border-surface-800 sticky top-0 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-sm z-10">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
                <input className="input pl-8 py-2 text-xs" placeholder="Search conversations..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            {filteredChats.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-500 flex items-center justify-center mx-auto mb-3">
                  <HiOutlineChatAlt2 className="text-xl" />
                </div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-300">No conversations yet</p>
                <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                  {user?.role === 'student'
                    ? 'Tap "Message" on any job listing to start chatting with a recruiter.'
                    : 'Conversations with applicants will show up here.'}
                </p>
              </div>
            ) : (
              filteredChats.map(chat => {
                const other = otherParticipant(chat)
                const lastMsg = chat.messages?.[chat.messages.length - 1]
                const unread = chat.messages?.some(m => m.sender !== user?._id && m.sender?._id !== user?._id && !m.readAt)
                return (
                  <div
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`flex items-center gap-3 p-4 cursor-pointer border-b border-surface-100 dark:border-surface-800 hover:bg-white dark:hover:bg-surface-800 transition-colors ${
                      activeChat?._id === chat._id ? 'bg-white dark:bg-surface-800 border-l-2 border-l-primary-500' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(other.name)} text-white text-sm font-semibold flex items-center justify-center shrink-0 shadow-sm`}>
                      {other.avatar
                        ? <img src={other.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        : getInitials(other.name || 'U')
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${unread ? 'font-bold text-surface-900 dark:text-white' : 'font-semibold text-surface-800 dark:text-surface-200'}`}>{other.name || 'Unknown'}</p>
                        {lastMsg?.createdAt && <span className="text-[10px] text-surface-400 shrink-0">{timeAgo(lastMsg.createdAt)}</span>}
                      </div>
                      {chat.job && (
                        <p className="text-[11px] text-primary-500 dark:text-primary-400 truncate flex items-center gap-1">
                          <HiOutlineBriefcase className="text-[10px] shrink-0" /> {chat.job.title}
                        </p>
                      )}
                      {lastMsg && <p className="text-xs text-surface-400 truncate mt-0.5">{lastMsg.content}</p>}
                    </div>
                    {unread && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                  </div>
                )
              })
            )}
          </div>

          {/* Main chat area */}
          {activeChat ? (
            <div className="flex flex-col bg-white dark:bg-surface-900">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-100 dark:border-surface-800">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(otherParticipant(activeChat).name)} text-white text-sm font-semibold flex items-center justify-center shadow-sm`}>
                  {getInitials(otherParticipant(activeChat).name || 'U')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-display font-semibold text-surface-900 dark:text-white truncate">{otherParticipant(activeChat).name}</p>
                  {activeChat.job && <p className="text-xs text-primary-500 dark:text-primary-400 truncate">{activeChat.job.title}</p>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient(otherParticipant(activeChat).name)} text-white text-lg font-semibold flex items-center justify-center mb-3 shadow-sm`}>
                      {getInitials(otherParticipant(activeChat).name || 'U')}
                    </div>
                    <p className="text-sm font-medium text-surface-600 dark:text-surface-300">{otherParticipant(activeChat).name}</p>
                    <p className="text-xs text-surface-400 mt-1">No messages yet — say hello!</p>
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMe = msg.sender === user?._id || msg.sender?._id === user?._id
                    return (
                      <motion.div key={msg._id || i}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-b from-primary-500 to-primary-600 text-white rounded-br-sm'
                            : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-100' : 'text-surface-400'}`}>
                            {msg.createdAt ? timeAgo(msg.createdAt) : 'just now'}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-surface-100 dark:border-surface-800">
                <input
                  className="input flex-1"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={sending || !newMessage.trim()} className="btn btn-primary px-4">
                  <HiOutlinePaperAirplane className="rotate-90" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950/50">
              <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-400 flex items-center justify-center mb-3">
                <HiOutlineChatAlt2 className="text-2xl" />
              </div>
              <p className="text-surface-500 dark:text-surface-400 text-sm font-medium">Select a conversation</p>
              <p className="text-surface-400 text-xs mt-1">Pick someone from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
