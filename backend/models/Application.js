import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED'],
      default: 'APPLIED',
    },
    matchPercent: { type: Number, default: 0 }, // snapshot of match % at time of applying
    resumeSnapshot: { type: String, default: '' },
    coverNote: { type: String, default: '', maxlength: 1000 },

    // --- 24-Hour Instant Response Guarantee ---
    // Every applicant is guaranteed SOME concrete response (interview slot or
    // an explicit review update) within 24h, even if the recruiter never
    // opens their inbox. See utils/autoResponseEngine.js.
    autoResponded:   { type: Boolean, default: false }, // true once the system (not a human) has sent the guaranteed response
    responseDeadline:{ type: Date }, // createdAt + 24h, checked by the scheduler
    interviewDate:   { type: Date, default: null },
    interviewMode:   { type: String, enum: ['Online', 'In-person', 'Phone'], default: 'Online' },
    interviewNote:   { type: String, default: '' },
    recruiterReminderSent: { type: Boolean, default: false }, // nudge email sent to recruiter
  },
  { timestamps: true }
)

// A student can only apply once to the same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true })

export default mongoose.model('Application', applicationSchema)
