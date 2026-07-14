import asyncHandler from 'express-async-handler'
import Chat from '../models/Chat.js'

export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'name avatar role')
    .populate('job', 'title company')
    .sort({ lastMessage: -1 })
  res.json({ success: true, chats })
})

export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { participantId, jobId } = req.body
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, participantId] },
    ...(jobId ? { job: jobId } : {}),
  }).populate('participants', 'name avatar role')

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, participantId],
      ...(jobId ? { job: jobId } : {}),
      messages: [],
    })
    await chat.populate('participants', 'name avatar role')
  }

  res.json({ success: true, chat })
})

export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body
  if (!content?.trim()) {
    res.status(400); throw new Error('Message content is required')
  }

  const chat = await Chat.findById(req.params.chatId)
  if (!chat) { res.status(404); throw new Error('Chat not found') }
  if (!chat.participants.includes(req.user._id)) {
    res.status(403); throw new Error('Not authorized')
  }

  chat.messages.push({ sender: req.user._id, content: content.trim() })
  chat.lastMessage = new Date()
  await chat.save()

  const newMessage = chat.messages[chat.messages.length - 1]
  res.json({ success: true, message: newMessage })
})

export const markAsRead = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
  if (!chat) { res.status(404); throw new Error('Chat not found') }

  chat.messages.forEach(msg => {
    if (msg.sender.toString() !== req.user._id.toString() && !msg.readAt) {
      msg.readAt = new Date()
    }
  })
  await chat.save()
  res.json({ success: true })
})
