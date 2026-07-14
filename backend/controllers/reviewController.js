import asyncHandler from 'express-async-handler'
import Review from '../models/Review.js'

export const getCompanyReviews = asyncHandler(async (req, res) => {
  const company = decodeURIComponent(req.params.company)
  const reviews = await Review.find({ company })
    .populate('reviewer', 'name avatar')
    .sort({ createdAt: -1 })
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0
  res.json({ success: true, reviews, avgRating, total: reviews.length })
})

export const createReview = asyncHandler(async (req, res) => {
  const { company, rating, comment, tags } = req.body
  if (!company || !rating || !comment) {
    res.status(400); throw new Error('Company, rating aur comment zaroori hain')
  }
  const existing = await Review.findOne({ company, reviewer: req.user._id })
  if (existing) {
    res.status(400); throw new Error('Aapne is company ka review pehle de diya hai')
  }
  const review = await Review.create({
    company, rating, comment, tags: tags || [], reviewer: req.user._id,
  })
  await review.populate('reviewer', 'name avatar')
  res.status(201).json({ success: true, review })
})

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) { res.status(404); throw new Error('Review nahi mila') }
  if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Sirf apna review delete kar sakte hain')
  }
  await review.deleteOne()
  res.json({ success: true, message: 'Review deleted' })
})
