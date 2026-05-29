import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import AdCard from '../components/AdCard'
import AdHeroCarousel from '../components/AdHeroCarousel'
import ExploreMap from '../components/ExploreMap'
import publicApi from '../services/publicApi'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIES } from '../utils/categories'

const SORT_OPTIONS = [
  { value: 'createDate,desc', label: 'Newest First' },
  { value: 'createDate,asc', label: 'Oldest First' },
  { value: 'expireDate,asc', label: 'Expiring Soon' },
  { value: 'adTitle,asc', label: 'Title A-Z' },
  { value: 'adTitle,desc', label: 'Title Z-A' },
]

function RecentlyViewed() {
  const [recent, setRecent] = useState([])
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    if (ids.length === 0) return
    publicApi.get('/ads/public', { params: { page: 0, size: ids.length } }).then(({ data }) => {
      const items = data.content?.filter((a) => ids.includes(a.adInfoId)) || []
      setRecent(items.sort((a, b) => ids.indexOf(a.adInfoId) - ids.indexOf(b.adInfoId)).slice(0, 6))
    }).catch(() => {})
  }, [])
  if (recent.length === 0) return null
  return (
    <section className="max-w-7xl mx-auto px-6 py-6">
      <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        Recently Viewed
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {recent.map((ad) => (
          <div key={ad.adInfoId} className="shrink-0 w-48">
            <AdCard ad={ad} />
          </div>
        ))}
      </div>
    </section>
  )
}

function LiveAds({ ads, loading, error, onRetry, hasMore, onLoadMore, loadingMore }) {
  const [mediaFilter, setMediaFilter] = useState('all')
  const { isAuthenticated } = useAuth()

  const filtered = mediaFilter === 'all'
    ? ads
    : mediaFilter === 'images'
      ? ads.filter((a) => a.numberOfPicture > 0)
      : ads.filter((a) => a.numberOfVideos > 0)

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>Failed to load advertisements</p>
        <button onClick={onRetry} className="btn btn-primary px-4 py-2 text-sm">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div id="ads" className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Live Advertisements</h2>
        {ads.length > 0 && (
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{ads.length} running</span>
        )}
      </div>

      <div className="divider mb-4" />

      <div className="flex items-center gap-2 mb-6">
        {[{ value: 'all', label: 'All' }, { value: 'images', label: 'Image Ads' }, { value: 'videos', label: 'Video Ads' }].map((tab) => (
          <button key={tab.value} onClick={() => setMediaFilter(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              mediaFilter === tab.value
                ? 'btn-primary text-white'
                : 'btn-ghost'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <AdCard key={i} loading />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>No advertisements found</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {mediaFilter === 'all' ? 'Be the first to advertise!' : 'No ads match this filter.'}
          </p>
          {mediaFilter === 'all' && (
            <Link to="/register" className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
              Get started →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
            {filtered.map((ad) => <AdCard key={ad.adInfoId} ad={ad} />)}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={onLoadMore} disabled={loadingMore}
                className="btn btn-secondary px-5 py-2 text-sm disabled:opacity-50">
                {loadingMore ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg> Loading...</>
                ) : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Landing() {
  const [allAds, setAllAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('createDate,desc')
  const [initialLoad, setInitialLoad] = useState(true)
  const [viewMode, setViewMode] = useState('cards')
  const [category, setCategory] = useState('')
  const searchTimer = useRef(null)

  const fetchAds = useCallback(async (pageNum, append = false) => {
    if (!append) setLoading(true)
    setError(null)
    try {
      const [sortField, sortDir] = sort.split(',')
      const params = { page: pageNum, size: 12, sort: sortField, dir: sortDir }
      if (search.trim()) params.q = search.trim()
      if (category) params.category = category
      const { data } = await publicApi.get('/ads/public', { params })
      if (append) {
        setAllAds((prev) => [...prev, ...data.content])
      } else {
        setAllAds(data.content || [])
      }
      setTotalPages(data.totalPages || 0)
      setPage(pageNum)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setInitialLoad(false)
    }
  }, [search, sort, category])

  useEffect(() => {
    setPage(0)
    setAllAds([])
    setInitialLoad(true)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      fetchAds(0, false)
    }, search ? 300 : 0)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search, sort, category, fetchAds])

  const handleLoadMore = () => {
    setLoadingMore(true)
    fetchAds(page + 1, true)
  }

  return (
    <div className="animate-fade-up">
      <AdHeroCarousel ads={allAds} />

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 flex card overflow-hidden" style={{ boxShadow: 'none' }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2.5 input-base rounded-none rounded-l-xl border-r-0 shrink-0 max-w-[140px] cursor-pointer appearance-none"
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 py-2.5 input-base rounded-none rounded-r-xl border-l-0" />
            </div>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 input-base cursor-pointer appearance-none min-w-[150px]">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={() => setViewMode(viewMode === 'map' ? 'cards' : 'map')}
            className="btn btn-primary px-4 py-2.5 text-sm shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {viewMode === 'map' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              )}
            </svg>
            {viewMode === 'map' ? 'Grid' : 'Map'}
          </button>
        </div>
      </div>

      <RecentlyViewed />

      {viewMode === 'map' ? (
        <ExploreMap searchQuery={search} category={category} />
      ) : (
        <LiveAds
          ads={allAds}
          loading={loading}
          error={error}
          onRetry={() => fetchAds(0, false)}
          hasMore={page + 1 < totalPages}
          onLoadMore={handleLoadMore}
          loadingMore={loadingMore}
        />
      )}
    </div>
  )
}
