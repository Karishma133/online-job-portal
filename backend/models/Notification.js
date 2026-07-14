import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['NEW_MATCH', 'APPLICATION_STATUS', 'NEW_APPLICANT', 'GENERAL'],
      default: 'GENERAL',
    },
    title:   { type: String, required: true },
    message: { type: String, default: '' },
    link:    { type: String, default: '' }, // e.g. /jobs/:id
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.model('Notification', notificationSchema)
