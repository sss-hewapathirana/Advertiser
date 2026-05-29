import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../utils/constants'

function SlideContent({ ad }) {
  const [imgError, setImgError] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const heroImage = ad?.images?.[0]?.imageUrl
  const heroVideo = ad?.videos?.[0]?.videoUrl
  const hasVideo = heroVideo && ad.numberOfVideos > 0 && !videoError
  const hasImage = heroImage && ad.numberOfPicture > 0 && !imgError

  if (!hasVideo && !hasImage) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-violet-600/20 to-slate-900" />
    )
  }

  return (
    <>
      {hasVideo ? (
        <video
          autoPlay muted loop playsInline
          poster={hasImage ? heroImage : undefined}
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : hasImage ? (
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : null}
      {!hasVideo && hasImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
      )}
    </>
  )
}

export default function AdHeroCarousel({ ads }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const intervalRef = useRef(null)
  const navigate = useNavigate()

  const total = ads?.length || 0

  const next = useCallback(() => {
    if (total <= 1) return
    setCurrent((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    if (total <= 1) return
    setCurrent((prev) => (prev - 1 + total) % total)
  }, [total])

  useEffect(() => {
    if (total <= 1 || isPaused) return
    intervalRef.current = setInterval(next, 7000)
    return () => clearInterval(intervalRef.current)
  }, [total, isPaused, next])

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div
      className="relative w-full min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] overflow-hidden bg-slate-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`flex h-full transition-transform duration-700 ease-in-out ${loaded ? '' : 'opacity-0'}`}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {total > 0 ? (
          ads.map((ad) => (
            <button
              key={ad.adInfoId}
              onClick={() => navigate(`/ad/${ad.adInfoId}`)}
              className="relative min-w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] flex-shrink-0 text-left focus:outline-none group/slide cursor-pointer"
            >
              <SlideContent ad={ad} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 max-w-5xl">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                  {ad.adTitle || 'Untitled'}
                </h2>
                {ad.adInfo && (
                  <p className="text-sm sm:text-base lg:text-lg text-slate-300 mb-3 max-w-2xl line-clamp-2">
                    {ad.adInfo}
                  </p>
                )}
                {ad.user?.name && (
                  <p className="text-xs sm:text-sm text-slate-400 mb-3">
                    by {ad.user.name}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/60 group-hover/slide:text-white transition-colors">
                  View details
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="relative min-w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-slate-900" />
            <div className="relative text-center px-6">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4">
                Advertise on {APP_NAME}
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create image and video advertisements and reach our audience.
              </p>
              <Link to="/register"
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all btn-glow">
                Get Started →
              </Link>
            </div>
          </div>
        )}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {total > 1 && (
        <div className="absolute bottom-4 right-4 sm:right-10 flex items-center gap-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-4 sm:w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsPaused((p) => !p) }}
          className="absolute bottom-4 left-4 sm:left-10 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
        >
          {isPaused ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
