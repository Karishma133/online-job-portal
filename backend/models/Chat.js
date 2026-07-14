import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  readAt:  { type: Date, default: null },
}, { timestamps: true })

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  job:          { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  messages:     [messageSchema],
  lastMessage:  { type: Date, default: Date.now },
}, { timestamps: true })

chatSchema.index({ participants: 1 })

export default mongoose.model('Chat', chatSchema)
