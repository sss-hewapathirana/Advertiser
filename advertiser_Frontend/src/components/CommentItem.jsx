import { useState } from 'react'
import { formatDate } from '../utils/format'

export default function CommentItem({ comment, userId, isAuthenticated, onReply, onDelete, depth = 0 }) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const isOwn = userId && userId === comment.consumerId

  const handleReply = () => {
    if (!replyText.trim()) return
    onReply(comment.id, replyText.trim())
    setReplyText('')
    setReplyOpen(false)
  }

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l border-white/[0.06]' : ''}`}>
      <div className="glass rounded-xl p-3 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-indigo-300">
                {(comment.userName || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-white">{comment.userName || 'Anonymous'}</span>
            {depth === 0 && comment.parentId == null && (
              <span className="text-[10px] text-slate-500">· Comment</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600">{formatDate(comment.createdAt)}</span>
            {isOwn && (
              <button onClick={() => onDelete(comment.id)}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors">
                Delete
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{comment.body}</p>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          userId={userId}
          isAuthenticated={isAuthenticated}
          onReply={onReply}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}

      {depth === 0 && isAuthenticated && (
        <div className="ml-6 mt-1">
          <button
            onClick={() => setReplyOpen(!replyOpen)}
            className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors"
          >
            {replyOpen ? 'Cancel' : 'Reply'}
          </button>
          {replyOpen && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter') handleReply() }}
              />
              <button onClick={handleReply}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/10 hover:bg-indigo-500/20 transition-all">
                Reply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
