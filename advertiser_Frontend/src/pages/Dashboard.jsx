import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import EmptyState from '../components/ui/EmptyState'
import { formatDate, isExpired, getDaysLeft } from '../utils/format'
import { FREE_AD_LIMIT, APP_NAME } from '../utils/constants'

function StatCard({ label, value, icon, sub, accent }) {
  return (
    <div className="glass rounded-xl p-4 border border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
          accent === 'violet' ? 'bg-violet-500/10 text-violet-400' :
          accent === 'amber' ? 'bg-amber-500/10 text-amber-400' :
          'bg-indigo-500/10 text-indigo-400'
        }`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-lg font-bold text-white">{value ?? '—'}</p>
          {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function AdCard({ ad }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const daysLeft = getDaysLeft(ad.expireDate)
  const expired = isExpired(ad.expireDate)
  const heroImage = ad.images?.[0]?.imageUrl

  return (
    <Link to={`/ads/${ad.adInfoId}`}
      className="glass rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all overflow-hidden group"
    >
      <div className="aspect-[16/9] bg-white/[0.02] relative overflow-hidden">
        {heroImage && !imgError ? (
          <img
            src={heroImage}
            alt=""
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/5 to-violet-600/5">
            <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className={`absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-medium rounded border backdrop-blur-sm ${daysLeft.color}`}>
          {daysLeft.label}
        </span>
        {ad.numberOfVideos > 0 && (
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-medium bg-black/40 backdrop-blur-sm rounded border border-white/10 text-white flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            {ad.numberOfVideos}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
          {ad.adTitle || 'Untitled'}
        </h3>
        {ad.adInfo && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ad.adInfo}</p>
        )}
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user, isAdvanced, refreshUser } = useAuth()
  const toast = useToast()
  const [stats, setStats] = useState({ ads: 0, active: 0, expired: 0 })
  const [recentAds, setRecentAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    const userId = user.id || user.consumerId
    if (!userId) return
    setLoading(true)
    Promise.all([
      api.get(`/users/${userId}`),
      api.get('/ads', { params: { page: 0, size: 6, sort: 'adInfoId,desc' } })
    ])
      .then(([{ data: userData }, { data: adsData }]) => {
        const normalized = { ...userData, id: userData.consumerId || userId }
        const ads = adsData.content || []
        setStats({
          ads: userData.noOfAd || 0,
          active: ads.filter((a) => !isExpired(a.expireDate)).length,
          expired: ads.filter((a) => isExpired(a.expireDate)).length,
        })
        setRecentAds(ads)
        localStorage.setItem('user', JSON.stringify(normalized))
      })
      .catch((err) => console.error('Dashboard fetch failed:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      await refreshUser()
      toast.success('Account upgraded to Advanced!')
    } catch {
      toast.error('Upgrade failed. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  const progressPercent = isAdvanced ? 100 : Math.min((stats.ads / FREE_AD_LIMIT) * 100, 100)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-up">
      {/* Welcome + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back<span className="text-slate-400">, {user.name || user.email}</span></h1>
          <p className="text-sm text-slate-500 mt-0.5">{APP_NAME} dashboard overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/ads/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all btn-glow">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Ad
          </Link>
          <Link to="/ads"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-sm font-semibold hover:bg-white/10 hover:text-white transition-all border border-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            All Ads
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Ads"
          value={stats.ads}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          label="Active"
          value={stats.active}
          accent="emerald"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          accent="amber"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Account"
          value={isAdvanced ? 'Advanced' : 'Basic'}
          accent={isAdvanced ? 'emerald' : 'violet'}
          sub={`Level ${user.level || 0}`}
          icon={isAdvanced
            ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          }
        />
      </div>

      {/* Free tier usage + Upgrade */}
      {!isAdvanced && (
        <div className="glass rounded-xl p-4 border border-white/[0.06] mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Free tier usage</span>
                <span className="text-xs font-semibold text-slate-500">{stats.ads} / {FREE_AD_LIMIT} ads</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent >= 80 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <button onClick={handleUpgrade} disabled={upgrading}
              className="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-semibold hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50">
              {upgrading ? 'Processing...' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      )}

      {/* Recent Ads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Advertisements</h2>
          <Link to="/ads" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1">
            View all
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="aspect-[16/9] skeleton" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 skeleton" />
                  <div className="h-2 w-full skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : recentAds.length === 0 ? (
          <EmptyState
            icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="No advertisements yet"
            description="Start by creating your first advertisement."
            actionLabel="Create Advertisement"
            actionTo="/ads/new"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentAds.slice(0, 6).map((ad) => <AdCard key={ad.adInfoId} ad={ad} />)}
          </div>
        )}
      </div>
    </div>
  )
}
