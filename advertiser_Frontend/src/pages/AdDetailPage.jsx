import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatDate, getDaysLeft, isExpired, formatPrice } from '../utils/format'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import MapDisplay from '../components/location/MapDisplay'
import ReviewSection from '../components/ReviewSection'
import CommentSection from '../components/CommentSection'

function MediaGallery({ images, videos }) {
  const allMedia = []
  const imgList = images || []
  const vidList = videos || []
  imgList.forEach((img) => allMedia.push({ type: 'image', url: img.imageUrl }))
  vidList.forEach((vid) => allMedia.push({ type: 'video', url: vid.videoUrl }))

  const [mediaIndex, setMediaIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  const current = allMedia[mediaIndex]

  const noMedia = (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-slate-900 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">No media available</p>
      </div>
    </div>
  )

  return (
    <div className="flex gap-3">
      {allMedia.length > 1 && (
        <div className="hidden sm:flex flex-col gap-2 overflow-y-auto max-h-[500px] w-[60px] flex-shrink-0">
          {allMedia.map((m, i) => (
            <button key={i} onClick={() => setMediaIndex(i)}
              className={`w-[60px] h-[60px] rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                i === mediaIndex
                  ? 'border-indigo-400 opacity-100 ring-1 ring-indigo-400/30'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}>
              {m.type === 'video' ? (
                <div className="w-full h-full bg-black/80 flex items-center justify-center relative">
                  <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              ) : (
                <ThumbnailImg url={m.url} />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {allMedia.length === 0 ? noMedia : (
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/50 relative group">
            {current.type === 'video' ? (
              <video
                key={current.url}
                autoPlay muted loop playsInline
                controls
                className="w-full h-full object-contain"
              >
                <source src={current.url} type="video/mp4" />
              </video>
            ) : !imgError ? (
              <img
                src={current.url}
                alt=""
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-violet-600/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {allMedia.length > 1 && (
              <>
                <button onClick={() => setMediaIndex((i) => (i - 1 + allMedia.length) % allMedia.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setMediaIndex((i) => (i + 1) % allMedia.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {allMedia.slice(0, Math.min(allMedia.length, 7)).map((_, i) => (
                <button key={i} onClick={() => setMediaIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === mediaIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                  }`} />
              ))}
              {allMedia.length > 7 && (
                <span className="text-[10px] text-white/60 ml-1">{mediaIndex + 1}/{allMedia.length}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ThumbnailImg({ url }) {
  const [err, setErr] = useState(false)
  if (err) {
    return <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-violet-600/10" />
  }
  return <img src={url} alt="" className="w-full h-full object-cover" onError={() => setErr(true)} />
}

function AdvertiserCard({ user, createDate }) {
  if (!user) return null
  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()
  return (
    <div className="glass rounded-xl p-4 border border-white/[0.06] flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-indigo-300">{initial}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{user.name || 'Anonymous'}</p>
        <p className="text-xs text-slate-500">
          Published {createDate ? formatDate(createDate) : 'recently'}
        </p>
        {user.telNumber > 0 && (
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {user.telNumber}
          </p>
        )}
      </div>
    </div>
  )
}

function ConversationModal({ adId, onClose }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Message is required')
      return
    }
    setSending(true)
    try {
      const { data } = await api.post('/conversations', {
        adInfoId: adId,
        body: message.trim(),
      })
      toast.success('Message sent!')
      navigate(`/messages?conversationId=${data.conversationId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="w-full max-w-md glass rounded-2xl border border-white/[0.08] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-white">Send Message</h3>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-400 -mt-2">Send a message to the advertiser. You can continue the conversation in your inbox.</p>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="I'm interested in this advertisement. Please provide more details..."
              rows={4}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none" />
          </div>

          <button type="submit" disabled={sending}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all btn-glow disabled:opacity-50">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AdSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <div className="w-full aspect-[4/3] rounded-2xl skeleton" />
        </div>
        <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 space-y-4">
          <div className="h-16 rounded-xl skeleton" />
          <div className="h-6 w-3/4 skeleton rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-full skeleton rounded" />
            <div className="h-4 w-2/3 skeleton rounded" />
          </div>
          <div className="h-24 rounded-xl skeleton" />
          <div className="h-20 rounded-xl skeleton" />
        </div>
      </div>
    </div>
  )
}

export default function AdDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { currency, rates } = useCurrency()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversationOpen, setConversationOpen] = useState(false)

  useEffect(() => {
    const fetchAd = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/ads/${id}/public`)
        setAd(data)
        if (data?.adInfoId) {
          const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
          const updated = [data.adInfoId, ...recent.filter((rid) => rid !== data.adInfoId)].slice(0, 20)
          localStorage.setItem('recentlyViewed', JSON.stringify(updated))
        }
      } catch (err) {
        if (err.response?.status === 404) setError('Advertisement not found')
        else setError('Failed to load advertisement')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchAd()
  }, [id])

  if (loading) return <AdSkeleton />
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{error}</h2>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
          ← Back to home
        </Link>
      </div>
    )
  }
  if (!ad) return null

  const daysLeft = getDaysLeft(ad.expireDate)
  const expired = isExpired(ad.expireDate)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-up">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all ads
      </Link>

      {ad.published === false && (
        <div className="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          This advertisement is unpublished and not visible on the landing page.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <MediaGallery images={ad.images} videos={ad.videos} />
        </div>

        <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 space-y-5">
          <AdvertiserCard user={ad.user} createDate={ad.createDate} />

          <div>
            <div className="flex items-start gap-3 mb-1">
              <h1 className="text-xl xl:text-2xl font-bold text-white leading-tight">{ad.adTitle || 'Untitled'}</h1>
              <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border whitespace-nowrap mt-0.5 backdrop-blur-sm ${daysLeft.color}`}>
                {daysLeft.label}
              </span>
            </div>
          </div>

          <div className="glass rounded-xl p-4 border border-white/[0.06] space-y-2.5">
            {ad.price != null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Price</span>
                <span className="text-sm text-emerald-400 font-bold">{formatPrice(ad.price, currency, rates)}</span>
              </div>
            )}
            {ad.createDate && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Created</span>
                <span className="text-xs text-white font-medium">{formatDate(ad.createDate)}</span>
              </div>
            )}
            {ad.category && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Category</span>
                <span className="text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {ad.category}
                </span>
              </div>
            )}
            {ad.expireDate && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Expires</span>
                <span className="text-xs text-white font-medium">{formatDate(ad.expireDate)}</span>
              </div>
            )}
            {(ad.numberOfPicture || 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Images</span>
                <span className="text-xs text-white font-medium">{ad.numberOfPicture}</span>
              </div>
            )}
            {(ad.numberOfVideos || 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Videos</span>
                <span className="text-xs text-white font-medium">{ad.numberOfVideos}</span>
              </div>
            )}
          </div>

          {ad.latitude && ad.longitude && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</h3>
              <MapDisplay latitude={ad.latitude} longitude={ad.longitude} address={ad.location} />
              {ad.location && (
                <p className="text-xs text-slate-400 flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{ad.location}</span>
                </p>
              )}
            </div>
          )}

          {!expired && ad.published !== false && isAuthenticated ? (
            <button onClick={() => setConversationOpen(true)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all btn-glow flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Message
            </button>
          ) : !expired && ad.published !== false && !isAuthenticated ? (
            <Link to="/login"
              className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Log in to send message
            </Link>
          ) : (
            <div className="glass rounded-xl p-4 border border-white/[0.06] text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500">Messaging disabled{expired ? ' for expired ads' : ''}</p>
            </div>
          )}

          {ad.adInfo && (
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ad.adInfo}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 max-w-3xl space-y-10">
        <ReviewSection adId={ad.adInfoId} advertiserId={ad.user?.consumerId} />
        <CommentSection adId={ad.adInfoId} />
      </div>

      {conversationOpen && (
        <ConversationModal
          adId={ad.adInfoId}
          onClose={() => setConversationOpen(false)}
        />
      )}
    </div>
  )
}
