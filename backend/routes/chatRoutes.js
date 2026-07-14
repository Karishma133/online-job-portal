import express from 'express'
import { getMyChats, getOrCreateChat, sendMessage, markAsRead } from '../controllers/chatController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.get('/',                       protect, getMyChats)
router.post('/',                      protect, getOrCreateChat)
router.post('/:chatId/messages',      protect, sendMessage)
router.put('/:chatId/read',           protect, markAsRead)

export default router
