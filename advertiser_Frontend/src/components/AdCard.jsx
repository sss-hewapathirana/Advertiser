import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPrice } from '../utils/format'
import RatingBadge from './RatingBadge'

function getDaysLeft(expireDate) {
  const diff = new Date(expireDate) - new Date()
  if (diff <= 0) return { label: 'Expired', type: 'error' }
  const days = Math.ceil(diff / 86400000)
  if (days <= 7) return { label: `${days}d left`, type: 'warning' }
  if (days <= 30) return { label: `${days}d left`, type: 'info' }
  return { label: `${days}d`, type: 'success' }
}

function AdCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 skeleton" />
        <div className="h-6 w-1/3 skeleton" />
      </div>
    </div>
  )
}

export default function AdCard({ ad, loading, error }) {
  const [imgError, setImgError] = useState(false)
  const [saved, setSaved] = useState(() => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('savedAds') || '[]')
      return savedIds.includes(ad?.adInfoId)
    } catch { return false }
  })
  const navigate = useNavigate()
  const { currency, rates } = useCurrency()

  if (loading) return <AdCardSkeleton />
  if (error || !ad) return null

  const heroImage = ad.images?.[0]?.imageUrl
  const badge = getDaysLeft(ad.expireDate)
  const isExpired = badge.type === 'error'

  const handleSave = (e) => {
    e.stopPropagation()
    const savedIds = JSON.parse(localStorage.getItem('savedAds') || '[]')
    if (saved) {
      localStorage.setItem('savedAds', JSON.stringify(savedIds.filter((id) => id !== ad.adInfoId)))
      setSaved(false)
    } else {
      localStorage.setItem('savedAds', JSON.stringify([...new Set([...savedIds, ad.adInfoId])]))
      setSaved(true)
    }
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div
      onClick={() => !isExpired && navigate(`/ad/${ad.adInfoId}`)}
      className={`card overflow-hidden group ${isExpired ? 'opacity-50' : 'cursor-pointer hover:translate-y-[-2px]'}`}
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative" style={{ background: 'color-mix(in srgb, var(--color-elevated) 50%, transparent)' }}>
        {heroImage && !imgError ? (
          <img
            src={heroImage}
            alt={ad.adTitle}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`badge badge-${badge.type}`}>{badge.label}</span>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
          style={{ background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)', backdropFilter: 'blur(4px)' }}
        >
          <svg className="w-4 h-4" fill={saved ? 'var(--color-accent)' : 'none'} viewBox="0 0 24 24" stroke={saved ? 'var(--color-accent)' : 'white'} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* Video indicator */}
        {ad.numberOfVideos > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="badge badge-info flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              {ad.numberOfVideos}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{ad.adTitle || 'Untitled'}</h3>
        <div className="flex items-center justify-between">
          {ad.price != null && (
            <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{formatPrice(ad.price, currency, rates)}</span>
          )}
          <RatingBadge averageRating={ad.averageRating} reviewCount={ad.reviewCount} />
        </div>
        {ad.category && (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ad.category}</span>
        )}
      </div>
    </div>
  )
}
