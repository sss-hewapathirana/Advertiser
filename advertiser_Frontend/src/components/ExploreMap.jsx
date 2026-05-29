import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Tooltip, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import publicApi from '../services/publicApi'
import { CATEGORIES } from '../utils/categories'
import { formatPrice } from '../utils/format'
import { useCurrency } from '../contexts/CurrencyContext'
import MapListPanel from './MapListPanel'
import { HeatmapLayer, POILayer } from './MapLayers'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const icons = {
  blue: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  red: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  grey: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
}

function FitBounds({ markers }) {
  const map = useMap()
  const fittedRef = useRef(false)
  useEffect(() => {
    if (markers.length > 0 && !fittedRef.current) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
      fittedRef.current = true
    }
  }, [markers, map])
  return null
}

function MapBoundsTracker({ onBoundsChange, zoomingRef }) {
  const map = useMap()
  useEffect(() => {
    const handleZoomStart = () => { zoomingRef.current = true }
    const handleZoomEnd = () => {
      zoomingRef.current = false
      const b = map.getBounds()
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    }
    const handleMoveEnd = () => {
      if (zoomingRef.current) return
      const b = map.getBounds()
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    }
    map.on('zoomstart', handleZoomStart)
    map.on('zoomend', handleZoomEnd)
    map.on('moveend', handleMoveEnd)
    return () => {
      map.off('zoomstart', handleZoomStart)
      map.off('zoomend', handleZoomEnd)
      map.off('moveend', handleMoveEnd)
    }
  }, [map, onBoundsChange, zoomingRef])
  return null
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

export default function ExploreMap({ searchQuery, category = '' }) {
  const { currency, rates } = useCurrency()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchQuery || '')
  const [selectedCategories, setSelectedCategories] = useState(category ? [category] : [])
  const [showPanel, setShowPanel] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showPOI, setShowPOI] = useState(false)
  const [hoveredAdId, setHoveredAdId] = useState(null)
  const [mediaFilter, setMediaFilter] = useState('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [radius, setRadius] = useState('')
  const [locating, setLocating] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)
  const zoomingRef = useRef(false)
  const catPanelRef = useRef(null)
  const mapRef = useRef(null)
  const lastBoundsRef = useRef(null)

  const fetchWithBounds = useCallback(async (b) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: 0, size: 999, sort: 'createDate', dir: 'desc' }
      if (b) {
        params.north = b.north
        params.south = b.south
        params.east = b.east
        params.west = b.west
      }
      const { data } = await publicApi.get('/ads/public', { params })
      if (zoomingRef.current) return
      setAds(data.content || [])
    } catch {
      setError('Failed to load advertisements')
    } finally {
      setLoading(false)
    }
  }, [])

  const getExpandedBounds = useCallback((b, radiusKm) => {
    if (!radiusKm || !b) return b
    const centerLat = (b.north + b.south) / 2
    const centerLng = (b.east + b.west) / 2
    const latChange = radiusKm / 111.32
    const lngChange = radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180))
    return {
      north: centerLat + latChange,
      south: centerLat - latChange,
      east: centerLng + lngChange,
      west: centerLng - lngChange,
    }
  }, [])

  const handleBoundsChange = useCallback((b) => {
    if (zoomingRef.current) return
    const expanded = getExpandedBounds(b, parseFloat(radius))
    const last = lastBoundsRef.current
    if (last &&
        Math.abs(last.north - expanded.north) < 0.001 &&
        Math.abs(last.south - expanded.south) < 0.001 &&
        Math.abs(last.east - expanded.east) < 0.001 &&
        Math.abs(last.west - expanded.west) < 0.001) return
    lastBoundsRef.current = expanded
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (zoomingRef.current) return
      fetchWithBounds(expanded)
    }, 300)
  }, [fetchWithBounds, getExpandedBounds, radius])

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapRef.current
        if (map) {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 10)
        }
        setLocating(false)
      },
      () => {
        setLocating(false)
        setError('Location access denied. Please enable location services.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const toggleCategory = useCallback((cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }, [])

  const handleHoverAd = useCallback((id) => {
    setHoveredAdId(id)
  }, [])

  const handleLeaveAd = useCallback(() => {
    setHoveredAdId(null)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catPanelRef.current && !catPanelRef.current.contains(e.target)) {
        setShowCategories(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchWithBounds(null)
  }, [fetchWithBounds])

  useEffect(() => {
    setSelectedCategories(category ? [category] : [])
  }, [category])

  const getDateThreshold = useCallback((filter) => {
    if (filter === 'all') return null
    const now = new Date()
    if (filter === 'today') {
      now.setHours(0, 0, 0, 0)
      return now
    }
    if (filter === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    if (filter === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return null
  }, [])

  const filteredAds = useMemo(() => {
    let result = ads.filter(a => a.latitude && a.longitude)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        (a.adTitle && a.adTitle.toLowerCase().includes(q)) ||
        (a.adInfo && a.adInfo.toLowerCase().includes(q))
      )
    }

    if (selectedCategories.length > 0) {
      result = result.filter(a => selectedCategories.includes(a.category))
    }

    if (mediaFilter === 'images') {
      result = result.filter(a => (a.numberOfPicture || 0) > 0)
    } else if (mediaFilter === 'videos') {
      result = result.filter(a => (a.numberOfVideos || 0) > 0)
    }

    if (priceMin || priceMax) {
      result = result.filter(a => {
        const price = a.price
        if (!price && price !== 0) return false
        if (priceMin && price < parseFloat(priceMin)) return false
        if (priceMax && price > parseFloat(priceMax)) return false
        return true
      })
    }

    if (dateFilter !== 'all') {
      const threshold = getDateThreshold(dateFilter)
      if (threshold) {
        result = result.filter(a => {
          if (!a.createDate) return false
          return new Date(a.createDate) >= threshold
        })
      }
    }

    return result
  }, [ads, search, selectedCategories, mediaFilter, priceMin, priceMax, dateFilter, getDateThreshold])

  const getIcon = useCallback((ad) => {
    if ((ad.numberOfVideos || 0) > 0) return icons.red
    if ((ad.numberOfPicture || 0) > 0) return icons.blue
    return icons.grey
  }, [])

  const markers = useMemo(() =>
    filteredAds.map(ad => ({
      lat: ad.latitude,
      lng: ad.longitude,
      ad,
    })),
    [filteredAds]
  )

  const handleSelectAd = useCallback((id) => {
    const m = markers.find(m => m.ad.adInfoId === id)
    if (m && mapRef.current && !zoomingRef.current) {
      mapRef.current.flyTo([m.lat, m.lng], Math.max(mapRef.current.getZoom(), 10))
    }
  }, [markers])

  const hasAds = ads.some(a => a.latitude && a.longitude)
  const heatmapPoints = useMemo(() => markers.map(m => [m.lat, m.lng, 0.5]), [markers])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by title or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'images', 'videos'].map(tab => (
            <button key={tab} onClick={() => setMediaFilter(tab)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all capitalize ${
                mediaFilter === tab
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              {tab === 'all' ? 'All' : tab === 'images' ? '📷 Images' : '🎬 Videos'}
            </button>
          ))}
        </div>
        <div className="relative" ref={catPanelRef}>
          <button onClick={() => setShowCategories(!showCategories)}
            onKeyDown={e => { if (e.key === 'Escape') setShowCategories(false) }}
            aria-expanded={showCategories}
            aria-haspopup="listbox"
            aria-label={selectedCategories.length === 0 ? 'All Categories' : `${selectedCategories.length} categories selected`}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all flex items-center gap-2 whitespace-nowrap">
            {selectedCategories.length === 0 ? 'All Categories' : `${selectedCategories.length} selected`}
            <svg className={`w-3 h-3 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showCategories && (
            <div className="absolute top-full mt-1 left-0 z-50 bg-slate-800 border border-white/10 rounded-xl p-2 max-h-60 overflow-y-auto min-w-[200px] shadow-xl">
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-all">
                  <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="rounded border-white/20 bg-white/5" />
                  {cat}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <input type="number" min="0" step="0.01" value={priceMin} onChange={e => setPriceMin(e.target.value)}
            placeholder="Min ₹"
            className="w-16 sm:w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
          <span className="text-slate-500 text-sm shrink-0">—</span>
          <input type="number" min="0" step="0.01" value={priceMax} onChange={e => setPriceMax(e.target.value)}
            placeholder="Max ₹"
            className="w-16 sm:w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {[
          { value: 'all', label: 'All Time' },
          { value: 'today', label: 'Today' },
          { value: '7d', label: '7 Days' },
          { value: '30d', label: '30 Days' }
        ].map(opt => (
          <button key={opt.value} onClick={() => setDateFilter(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              dateFilter === opt.value
                ? 'bg-white/10 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {opt.label}
          </button>
        ))}
        <div className="w-px h-5 bg-white/[0.08]" />
        <select value={radius} onChange={e => setRadius(e.target.value)}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer appearance-none">
          <option value="" className="bg-slate-900">Any distance</option>
          <option value="5" className="bg-slate-900">Within 5 km</option>
          <option value="10" className="bg-slate-900">Within 10 km</option>
          <option value="25" className="bg-slate-900">Within 25 km</option>
          <option value="50" className="bg-slate-900">Within 50 km</option>
          <option value="100" className="bg-slate-900">Within 100 km</option>
        </select>
        <button onClick={() => setShowPanel(p => !p)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
            showPanel ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          List
        </button>
        <button onClick={() => setShowHeatmap(p => !p)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
            showHeatmap ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}>
          🔥 Heat
        </button>
        <button onClick={() => setShowPOI(p => !p)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
            showPOI ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}>
          🏪 POI
        </button>
        <button onClick={handleLocateMe} disabled={locating}
          className="px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50">
          {locating ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          {locating ? 'Locating…' : 'Near Me'}
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
        {error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400">{error}</p>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : !hasAds ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 px-6 text-center">
            <svg className="w-10 h-10 text-slate-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-slate-400">No location data yet</p>
            <p className="text-sm text-slate-500 max-w-xs">Advertisers can add a location when creating their ad</p>
          </div>
        ) : markers.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 px-6 text-center">
            <svg className="w-10 h-10 text-slate-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-slate-400">No ads match your filter</p>
            <p className="text-sm text-slate-500 max-w-xs">Try adjusting your search, category, or price range</p>
          </div>
        ) : (
          <div className="flex h-full relative">
            {showPanel && (
              <div className="absolute md:relative z-[1000] md:z-auto inset-x-0 bottom-0 md:inset-auto md:w-[320px] md:shrink-0 md:border-r border-white/[0.06] p-3 overflow-hidden bg-slate-900 md:bg-transparent rounded-t-2xl md:rounded-none" style={{ maxHeight: '50%', minHeight: '200px' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Results</h3>
                  <span className="text-xs text-slate-500">{markers.length}</span>
                </div>
                <MapListPanel
                  markers={markers}
                  hoveredId={hoveredAdId}
                  onHover={handleHoverAd}
                  onLeave={handleLeaveAd}
                  onSelect={handleSelectAd}
                />
              </div>
            )}
            <div className="flex-1 relative">
              <MapContainer ref={mapRef} center={[20.5937, 78.9629]} zoom={4} className="h-full w-full" scrollWheelZoom={true} markerZoomAnimation={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBoundsTracker onBoundsChange={handleBoundsChange} zoomingRef={zoomingRef} />
            <HeatmapLayer points={heatmapPoints} visible={showHeatmap} />
            <POILayer visible={showPOI} radius={1000} />
            <MarkerClusterGroup chunkedLoading maxClusterRadius={80} spiderfyOnMaxZoom={true} showCoverageOnHover={false} zoomToBoundsOnClick={true}>
              {markers.map((m) => (
                <Marker key={m.ad.adInfoId} position={[m.lat, m.lng]} icon={getIcon(m.ad)} eventHandlers={{
                  click() { handleSelectAd(m.ad.adInfoId) },
                  mouseover() { handleHoverAd(m.ad.adInfoId) },
                  mouseout() { handleLeaveAd() },
                }}>
                  <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                    <div className="text-sm whitespace-nowrap">
                      <div className="font-semibold">{m.ad.adTitle || 'Untitled'}</div>
                      <div className="text-xs opacity-70">by {m.ad.user?.name || m.ad.user?.email || 'Unknown'}</div>
                      {m.ad.category && (
                        <div className="text-xs font-medium" style={{color: 'var(--color-accent)'}}>{m.ad.category}</div>
                      )}
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="text-sm max-w-[220px]">
                      {m.ad.images?.[0]?.imageUrl && (
                        <div className="h-[100px] -mx-3 -mt-3 mb-2 overflow-hidden rounded-t-lg">
                          <img src={m.ad.images[0].imageUrl} alt=""
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none' }}
                            loading="lazy" />
                        </div>
                      )}
                      <p className="font-bold text-base mb-1">{m.ad.adTitle || 'Untitled'}</p>
                      {m.ad.price != null && (
                        <p className="font-bold text-sm mb-1" style={{color: 'var(--color-accent)'}}>{formatPrice(m.ad.price, currency, rates)}</p>
                      )}
                      {m.ad.category && (
                        <p className="text-[11px] font-medium mb-1 uppercase tracking-wide" style={{color: 'var(--color-accent)'}}>{m.ad.category}</p>
                      )}
                      <p className="mb-1 leading-relaxed opacity-80" style={{color: 'var(--color-text)'}}>{truncate(m.ad.adInfo, 100)}</p>
                      <p className="text-xs opacity-60 mb-2">by {m.ad.user?.name || m.ad.user?.email || 'Unknown'}</p>
                      <Link to={`/ad/${m.ad.adInfoId}`}
                        className="inline-block px-3 py-1 text-white text-xs rounded-lg transition-colors" style={{background: 'var(--color-accent)'}}>
                        View Ad →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
            {hoveredAdId && (() => {
              const m = markers.find(x => x.ad.adInfoId === hoveredAdId)
              if (!m) return null
              return <Circle center={[m.lat, m.lng]} radius={100} pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.15 }} />
            })()}
            <FitBounds markers={markers} />
          </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
