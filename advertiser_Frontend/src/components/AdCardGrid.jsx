import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getDaysLeft, formatPrice } from '../utils/format'
import { useCurrency } from '../contexts/CurrencyContext'

function GalleryImage({ images, title }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const imgs = images?.filter((img) => img.imageUrl) || []
  const currentSrc = imgs[imgIndex]?.imageUrl

  const prev = (e) => { e.stopPropagation(); setImgIndex((i) => (i - 1 + imgs.length) % imgs.length); setImgError(false); setImgLoaded(false) }
  const next = (e) => { e.stopPropagation(); setImgIndex((i) => (i + 1) % imgs.length); setImgError(false); setImgLoaded(false) }

  if (imgs.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center">
        <svg className="w-12 h-12 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden group">
      {currentSrc && !imgError ? (
        <img
          src={currentSrc}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {imgs.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm backdrop-blur-sm">
            ‹
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm backdrop-blur-sm">
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-3' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function AdCardGrid({ ads, selectedIds, onToggleSelect, onDelete, loading }) {
  const { currency, rates } = useCurrency()
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-52 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
      {ads.map((ad) => {
        const expiry = getDaysLeft(ad.expireDate)
        const selected = selectedIds.has(ad.adInfoId)
        const images = ad.images || []
        const videos = ad.videos || []

        return (
          <div
            key={ad.adInfoId}
            className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
              selected
                ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                : 'border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg bg-white/[0.03]'
            }`}
          >
            <label className="absolute top-3 left-3 z-10 cursor-pointer">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(ad.adInfoId)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500 cursor-pointer"
              />
            </label>

            <div className="relative h-[150px] overflow-hidden">
              <GalleryImage images={images} title={ad.adTitle} />

              <div className="absolute top-3 right-3 flex gap-1.5">
                {images.length > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-medium text-white bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
                    📷 {images.length}
                  </span>
                )}
                {videos.length > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-medium text-white bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
                    🎬 {videos.length}
                  </span>
                )}
              </div>

              {videos.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {ad.published === false && (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 backdrop-blur-sm">
                    Unpublished
                  </span>
                )}
                <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border backdrop-blur-sm ${expiry.color}`}>
                  {expiry.label}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-white font-semibold text-base truncate">{ad.adTitle || 'Untitled'}</h3>
              {ad.price != null && (
                <p className="text-indigo-400 font-semibold text-sm mt-0.5">{formatPrice(ad.price, currency, rates)}</p>
              )}
              <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mt-1 min-h-[2.5rem]">
                {ad.adInfo || 'No description'}
              </p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                <div className="flex gap-2">
                  <Link
                    to={`/ads/${ad.adInfoId}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg border border-indigo-500/10 transition-all"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(ad.adInfoId)}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg border border-red-500/10 transition-all"
                  >
                    Delete
                  </button>
                </div>
                <span className="text-xs text-slate-500 truncate max-w-[40%]">
                  {ad.user?.name || ad.user?.email || ''}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
