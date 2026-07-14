import { useEffect, useState } from 'react'
import { HiOutlineStar, HiStar, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import { showToast } from '../common/Toast'
import { timeAgo, getInitials } from '../../utils/helpers'
import api from '../../services/api'

const TAGS = ['Good Culture', 'Work-Life Balance', 'Good Pay', 'Learning', 'Toxic', 'Slow Growth']

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="text-2xl transition-colors disabled:cursor-default">
          {star <= (hovered || value)
            ? <HiStar className="text-warn-400" />
            : <HiOutlineStar className="text-surface-300" />}
        </button>
      ))}
    </div>
  )
}

export default function CompanyReviews({ company }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ rating: 0, comment: '', tags: [] })

  useEffect(() => {
    let mounted = true
    api.get(`/reviews/${encodeURIComponent(company)}`)
      .then((data) => { if (mounted) { setReviews(data.reviews); setAvgRating(data.avgRating) } })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [company])

  const toggleTag = (tag) => setForm(f => ({
    ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.rating) { showToast.error('Rating select karo'); return }
    if (!form.comment.trim()) { showToast.error('Comment zaroori hai'); return }
    setSubmitting(true)
    try {
      const data = await api.post('/reviews', { company, ...form })
      setReviews(prev => [data.review, ...prev])
      setAvgRating(((avgRating * reviews.length + form.rating) / (reviews.length + 1)).toFixed(1))
      setShowForm(false)
      setForm({ rating: 0, comment: '', tags: [] })
      showToast.success('Review submit ho gaya!')
    } catch (err) { showToast.error(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reviews/${id}`)
      setReviews(prev => prev.filter(r => r._id !== id))
      showToast.success('Review delete ho gaya')
    } catch (err) { showToast.error(err.message) }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-surface-900 dark:text-white text-lg">Company Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avgRating)} readonly />
              <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{avgRating} / 5</span>
              <span className="text-xs text-surface-400">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
        {user?.role === 'student' && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-outline btn-sm">
            <HiOutlinePencil /> Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-5 space-y-4">
          <h3 className="font-semibold text-surface-900 dark:text-white">Your review for {company}</h3>
          <div>
            <label className="label">Rating</label>
            <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
          </div>
          <div>
            <label className="label">Comment</label>
            <textarea rows={3} className="input"
              placeholder="Interview experience, work culture..."
              value={form.comment} onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
              maxLength={500} />
            <p className="text-xs text-surface-400 mt-1">{form.comment.length}/500</p>
          </div>
          <div>
            <label className="label">Tags (optional)</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.tags.includes(tag)
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-surface-200 text-surface-600 dark:border-surface-700 dark:text-surface-400'
                  }`}>{tag}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-surface-400 text-center py-6">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-surface-400 text-sm">Koi review nahi hai abhi. Pehle review likhne wale bano! 🌟</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {getInitials(review.reviewer?.name || 'U')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{review.reviewer?.name || 'Anonymous'}</p>
                    <p className="text-xs text-surface-400">{timeAgo(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readonly />
                  {(user?._id === review.reviewer?._id || user?.role === 'admin') && (
                    <button onClick={() => handleDelete(review._id)} className="text-danger-400 hover:text-danger-600 ml-2">
                      <HiOutlineTrash />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-300 mt-3 leading-relaxed">{review.comment}</p>
              {review.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {review.tags.map(tag => <span key={tag} className="badge-gray text-xs">{tag}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
