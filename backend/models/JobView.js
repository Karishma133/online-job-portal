import mongoose from 'mongoose'

// Tracks the last time a logged-in user viewed a given job. Used purely to
// decide whether a fresh page-load should count as a "new" view — not a
// full analytics log, so we only ever keep one row per (job, user) pair.
const jobViewSchema = new mongoose.Schema({
  job:      { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  viewedAt: { type: Date, default: Date.now },
})

jobViewSchema.index({ job: 1, user: 1 }, { unique: true })

export default mongoose.model('JobView', jobViewSchema)
