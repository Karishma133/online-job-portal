import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
)

reviewSchema.index({ company: 1, reviewer: 1 }, { unique: true })

export default mongoose.model('Review', reviewSchema)
