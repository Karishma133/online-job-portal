import asyncHandler from 'express-async-handler'
import Notification from '../models/Notification.js'

// @desc    Get the logged-in user's notifications (most recent first)
// @route   GET /api/notifications
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)

  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false })

  res.json({ success: true, notifications, unreadCount })
})

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  )
  if (!notification) { res.status(404); throw new Error('Notification not found') }
  res.json({ success: true, notification })
})

// @desc    Mark all of the logged-in user's notifications as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
  res.json({ success: true })
})
