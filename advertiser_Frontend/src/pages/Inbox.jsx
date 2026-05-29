import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { formatDateTime } from '../utils/format'
import ConversationView from '../components/ConversationView'
import EmptyState from '../components/ui/EmptyState'

function ConversationListItem({ conv, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        active
          ? 'bg-indigo-500/10 border-indigo-500/20'
          : 'bg-transparent border-transparent hover:bg-white/[0.03]'
      }`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-white truncate">{conv.otherUserName || 'Unknown'}</span>
        <span className="text-[10px] text-slate-600 whitespace-nowrap">
          {conv.lastMessageAt ? formatDateTime(conv.lastMessageAt) : ''}
        </span>
      </div>
      <p className="text-[11px] text-indigo-400/70 truncate mb-1">{conv.adTitle}</p>
      <div className="flex items-center gap-2">
        <p className="text-xs text-slate-500 truncate flex-1">
          {conv.lastMessage || 'No messages yet'}
        </p>
        {conv.unreadCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex-shrink-0">
            {conv.unreadCount}
          </span>
        )}
      </div>
    </button>
  )
}

export default function Inbox() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/conversations')
      setConversations(Array.isArray(data) ? data : [])
    } catch {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConversations() }, [])

  const selected = conversations.find((c) => c.id === selectedId)
  const [showThread, setShowThread] = useState(false)

  useEffect(() => {
    const paramId = searchParams.get('conversationId')
    if (paramId && conversations.length > 0) {
      const id = Number(paramId)
      if (conversations.find((c) => c.id === id)) {
        setSelectedId(id)
        setShowThread(true)
      }
    }
  }, [conversations, searchParams])

  const handleSelect = (id) => {
    setSelectedId(id)
    setShowThread(true)
    setSearchParams({ conversationId: id })
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full">
        <div className={`w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 border-r border-white/[0.06] flex flex-col ${
          showThread ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
            <div>
              <h1 className="text-lg font-bold text-white">Inbox</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                {totalUnread > 0 && ` · ${totalUnread} unread`}
              </p>
            </div>
            <button onClick={fetchConversations}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="p-3 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 skeleton rounded" />
                    <div className="h-3 w-12 skeleton rounded" />
                  </div>
                  <div className="h-3 w-20 skeleton rounded" />
                  <div className="h-3 w-full skeleton rounded" />
                </div>
              ))
            ) : conversations.length === 0 ? (
              <div className="pt-12">
                <EmptyState
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  title="No conversations yet"
                  description="Send an inquiry from an ad page to start a conversation."
                />
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === selectedId}
                  onClick={() => handleSelect(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-w-0 ${
          !showThread ? 'hidden lg:flex' : 'flex'
        }`}>
          {selectedId && selected ? (
            <ConversationView
              conversationId={selectedId}
              onBack={() => setShowThread(false)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
