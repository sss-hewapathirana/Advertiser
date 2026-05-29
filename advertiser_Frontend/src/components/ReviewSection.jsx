import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { formatDate } from '../utils/format'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './ui/Toast'
import StarRating from './StarRating'

export default function ReviewSection({ adId, advertiserId }) {
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ averageRating: 0, reviewCount: 0 })
  const [loading, setLoading] = useState(true)
  const [myReview, setMyReview] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [formTitle, setFormTitle] = useState('')
  const [formText, setFormText] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const isOwner = isAuthenticated && user?.consumerId === advertiserId

  const fetchReviews = useCallback(async (p = 0, append = false) => {
    try {
      const { data } = await api.get(`/ads/${adId}/reviews?page=${p}&size=5`)
      if (append) {
        setReviews((prev) => [...prev, ...data.content])
      } else {
        setReviews(data.content)
      }
      setHasMore(!data.last)
      setPage(p)
    } catch {} finally {
      setLoading(false)
    }
  }, [adId])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get(`/ads/${adId}/reviews/stats`)
      setStats(data)
    } catch {}
  }, [adId])

  const fetchMyReview = useCallback(async () => {
    if (!isAuthenticated || isOwner) return
    try {
      const { data } = await api.get(`/ads/${adId}/reviews/mine`)
      if (data && data.id) {
        setMyReview(data)
        setFormRating(data.rating)
        setFormTitle(data.title || '')
        setFormText(data.reviewText || '')
      }
    } catch {}
  }, [adId, isAuthenticated, isOwner])

  useEffect(() => { fetchReviews(); fetchStats(); fetchMyReview() }, [fetchReviews, fetchStats, fetchMyReview])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post(`/ads/${adId}/reviews`, { rating: formRating, title: formTitle, reviewText: formText })
      setFormOpen(false)
      toast.success('Review submitted!')
      fetchReviews()
      fetchStats()
      fetchMyReview()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return
    try {
      await api.delete(`/ads/${adId}/reviews`)
      setMyReview(null)
      setFormRating(5)
      setFormTitle('')
      setFormText('')
      toast.success('Review deleted')
      fetchReviews()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete review')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <span>⭐</span> Ratings & Reviews
      </h3>

      <div className="glass rounded-xl p-4 border border-white/[0.06] space-y-4">
        <div className="flex items-center gap-4">
          <StarRating rating={stats.averageRating} size="lg" />
          <div>
            <p className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</p>
            <p className="text-xs text-slate-400">{stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {isAuthenticated && !isOwner && !myReview && !formOpen && (
          <button onClick={() => setFormOpen(true)}
            className="px-4 py-2 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/10 transition-all">
            Write a Review
          </button>
        )}

        {isAuthenticated && !isOwner && myReview && !formOpen && (
          <div className="flex items-center gap-2">
            <button onClick={() => setFormOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-all">
              Edit Your Review
            </button>
            <button onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 transition-all">
              Delete
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-xs text-slate-500">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link> to leave a review
          </p>
        )}

        {formOpen && (
          <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-white/[0.06]">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rating</label>
              <StarRating rating={formRating} size="md" interactive onChange={setFormRating} />
            </div>
            <div>
              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Review title (optional)"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
            </div>
            <div>
              <textarea value={formText} onChange={(e) => setFormText(e.target.value)}
                placeholder="Write your review..."
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <button type="submit" disabled={saving}
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setFormOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2].map((i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/[0.06] animate-pulse">
              <div className="h-3 w-24 skeleton mb-2" />
              <div className="h-3 w-full skeleton" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-xs">No reviews yet</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="glass rounded-xl p-4 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} size="sm" />
                  <span className="text-xs font-medium text-white">{r.userName}</span>
                </div>
                <span className="text-[10px] text-slate-600">{formatDate(r.createdAt)}</span>
              </div>
              {r.title && (
                <p className="text-xs font-semibold text-slate-200 mt-1">{r.title}</p>
              )}
              {r.reviewText && (
                <p className="text-xs text-slate-400 mt-0.5">{r.reviewText}</p>
              )}
            </div>
          ))
        )}

        {hasMore && (
          <button onClick={() => fetchReviews(page + 1, true)}
            className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors">
            Load more reviews...
          </button>
        )}
      </div>
    </div>
  )
}
