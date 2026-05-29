import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './ui/Toast'
import CommentItem from './CommentItem'

export default function CommentSection({ adId }) {
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const fetchComments = useCallback(async (p = 0, append = false) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/ads/${adId}/comments?page=${p}&size=10`)
      if (append) {
        setComments((prev) => [...prev, ...data.content])
      } else {
        setComments(data.content)
      }
      setHasMore(!data.last)
      setPage(p)
    } catch {} finally {
      setLoading(false)
    }
  }, [adId])

  useEffect(() => { fetchComments() }, [fetchComments])

  const handlePost = async () => {
    if (!body.trim()) return
    setSaving(true)
    try {
      await api.post(`/ads/${adId}/comments`, { body: body.trim() })
      setBody('')
      toast.success('Comment posted!')
      fetchComments()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post comment')
    } finally {
      setSaving(false)
    }
  }

  const handleReply = async (parentId, replyBody) => {
    try {
      await api.post(`/ads/${adId}/comments`, { body: replyBody, parentId })
      toast.success('Reply posted!')
      fetchComments()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post reply')
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.delete(`/ads/${adId}/comments/${commentId}`)
      toast.success('Comment deleted')
      fetchComments()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete comment')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <span>💬</span> Public Comments
      </h3>

      {isAuthenticated ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a public comment..."
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            onKeyDown={(e) => { if (e.key === 'Enter') handlePost() }}
          />
          <button onClick={handlePost} disabled={saving || !body.trim()}
            className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50">
            {saving ? '...' : 'Post'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link> to post a comment
        </p>
      )}

      <div className="space-y-3">
        {loading ? (
          [1, 2].map((i) => (
            <div key={i} className="glass rounded-xl p-3 border border-white/[0.06] animate-pulse">
              <div className="h-3 w-20 skeleton mb-2" />
              <div className="h-3 w-full skeleton" />
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-xs">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userId={user?.consumerId}
              isAuthenticated={isAuthenticated}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        )}

        {hasMore && (
          <button onClick={() => fetchComments(page + 1, true)}
            className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors">
            Load more comments...
          </button>
        )}
      </div>
    </div>
  )
}
