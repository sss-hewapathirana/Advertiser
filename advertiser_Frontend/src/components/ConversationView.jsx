import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import { formatDateTime } from '../utils/format'

export default function ConversationView({ conversationId, onBack }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/conversations/${conversationId}`)
      setDetail(data)
    } catch {
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (conversationId) fetchDetail() }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    try {
      const { data } = await api.post(`/conversations/${conversationId}/messages`, { body: body.trim() })
      setDetail((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), data],
      }))
      setBody('')
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full animate-pulse p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`h-10 ${i % 2 === 0 ? 'w-48' : 'w-36'} skeleton rounded-2xl`} />
          </div>
        ))}
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Conversation not found
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        {onBack && (
          <button onClick={onBack}
            className="lg:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{detail.adTitle || 'Conversation'}</p>
          <p className="text-[11px] text-slate-500">{detail.messages?.length || 0} messages</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {detail.messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No messages yet. Send the first one!
          </div>
        ) : (
          detail.messages?.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-medium text-slate-500">{msg.senderName}</span>
                <span className="text-[10px] text-slate-600">{formatDateTime(msg.createdAt)}</span>
              </div>
              <div className="glass inline-block rounded-2xl px-4 py-2.5 border border-white/[0.06] max-w-[80%]">
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.body}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex-shrink-0 px-4 py-3 border-t border-white/[0.06] flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
        <button type="submit" disabled={sending || !body.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all btn-glow disabled:opacity-50 flex items-center gap-1.5">
          {sending ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}
