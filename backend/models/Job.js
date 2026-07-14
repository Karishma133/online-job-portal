import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  company:         { type: String, required: true, trim: true },
  companyLogo:     { type: String, default: '' },
  companyWebsite:  { type: String, default: '' },
  postedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location:        { type: String, required: true },
  jobType:         { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote', 'Hybrid'], default: 'Full-time' },
  category:        { type: String, default: 'Other' },
  experienceLevel: { type: String, enum: ['Fresher', '1-2 years', '2-5 years', '5+ years'], default: 'Fresher' },
  salaryMin:       { type: Number, default: 0 },
  salaryMax:       { type: Number, default: 0 },
  salaryNegotiable:{ type: Boolean, default: false },
  description:     { type: String, required: true },
  responsibilities:{ type: [String], default: [] },
  requiredSkills:  { type: [String], required: true },
  niceToHaveSkills:{ type: [String], default: [] },
  benefits:        { type: [String], default: [] },
  // ATS & Analytics
  minMatchPercent: { type: Number, default: 0 },
  views:           { type: Number, default: 0 },
  applicationCount:{ type: Number, default: 0 },
  // Status
  isActive:        { type: Boolean, default: true },
  isUrgent:        { type: Boolean, default: false },
  isFeatured:      { type: Boolean, default: false },
  expiresAt:       { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
}, { timestamps: true })

jobSchema.index({ title: 'text', company: 'text', description: 'text' })

jobSchema.virtual('applicantCount', {
  ref: 'Application', localField: '_id', foreignField: 'job', count: true,
})

jobSchema.set('toJSON', { virtuals: true })
jobSchema.set('toObject', { virtuals: true })

export default mongoose.model('Job', jobSchema)
