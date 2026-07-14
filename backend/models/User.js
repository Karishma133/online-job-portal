import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree:      { type: String, required: true },
  field:       { type: String, default: '' },
  startYear:   { type: Number },
  endYear:     { type: Number },
  grade:       { type: String, default: '' },
})

const experienceSchema = new mongoose.Schema({
  company:     { type: String, required: true },
  role:        { type: String, required: true },
  startDate:   { type: String },
  endDate:     { type: String },
  current:     { type: Boolean, default: false },
  description: { type: String, default: '' },
})

const certificationSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  issuer:     { type: String, default: '' },
  issueDate:  { type: String, default: '' },
  url:        { type: String, default: '' },
})

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  techStack:   { type: [String], default: [] },
  url:         { type: String, default: '' },
  github:      { type: String, default: '' },
})

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true, maxlength: 80 },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, minlength: 6, select: false },
  googleId:     { type: String, default: '' },
  role:         { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },
  avatar:       { type: String, default: '' },
  bio:          { type: String, default: '', maxlength: 500 },
  location:     { type: String, default: '' },
  headline:     { type: String, default: '' },
  phone:        { type: String, default: '' },
  website:      { type: String, default: '' },
  github:       { type: String, default: '' },
  linkedin:     { type: String, default: '' },
  skills:       { type: [String], default: [] },
  resume:       { type: String, default: '' },
  savedJobs:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  // LinkedIn-style fields
  education:    { type: [educationSchema],     default: [] },
  experience:   { type: [experienceSchema],    default: [] },
  certifications:{ type: [certificationSchema], default: [] },
  projects:     { type: [projectSchema],       default: [] },
  // Recruiter fields
  companyName:  { type: String, default: '' },
  companyLogo:  { type: String, default: '' },
  companyWebsite:{ type: String, default: '' },
  // Settings
  emailAlerts:  { type: Boolean, default: true },
  twoFAEnabled: { type: Boolean, default: false },
  twoFACode:    { type: String, select: false },
  twoFAExpiry:  { type: Date },
  isActive:     { type: Boolean, default: true },
  lastSeen:     { type: Date, default: Date.now },
  points:       { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  // Password reset
  resetPasswordToken:  { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  // Generate referral code
  if (!this.referralCode) {
    this.referralCode = `SM-${this._id.toString().slice(-6).toUpperCase()}`
  }
  next()
})

userSchema.methods.matchPassword = async function (p) {
  if (!this.password) return false
  return bcrypt.compare(p, this.password)
}

// Generates a random reset token, stores only its SHA-256 hash on the user
// (so a leaked database never exposes usable tokens), and returns the raw
// token — the raw token is what actually goes in the emailed link.
userSchema.methods.getResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex')
  this.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000 // 30 minutes
  return rawToken
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  delete obj.twoFACode
  return obj
}

export default mongoose.model('User', userSchema)
