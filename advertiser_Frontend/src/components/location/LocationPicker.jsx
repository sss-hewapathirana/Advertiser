import { useState, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CENTER = [20.5937, 78.9629]

function SearchBox({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const timer = useRef(null)

  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.map((d) => ({
          label: d.display_name,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
        })))
        setOpen(true)
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false))
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (timer.current) clearTimeout(timer.current)
            timer.current = setTimeout(() => search(e.target.value), 400)
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a place..."
          className="w-full pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
        />
        {searching && (
          <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 glass rounded-xl border border-white/[0.08] shadow-2xl z-[9999] max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <button key={i} type="button"
              onClick={() => { onSelect(r); setQuery(r.label); setOpen(false); setResults([]) }}
              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors border-b border-white/[0.04] last:border-0">
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ClickHandler({ onPlace }) {
  useMapEvents({
    click(e) { onPlace({ lat: e.latlng.lat, lng: e.latlng.lng }) },
  })
  return null
}

function FlyTo({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 0.5 })
  }, [center, map])
  return null
}

export default function LocationPicker({ value, onChange }) {
  const [marker, setMarker] = useState(value?.lat && value?.lng ? [value.lat, value.lng] : null)

  const handlePlace = useCallback(async ({ lat, lng }) => {
    setMarker([lat, lng])
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await res.json()
      onChange({ address: data.display_name || `${lat}, ${lng}`, lat, lng })
    } catch {
      onChange({ address: `${lat}, ${lng}`, lat, lng })
    }
  }, [onChange])

  const handleSearchSelect = useCallback(({ label, lat, lng }) => {
    setMarker([lat, lng])
    onChange({ address: label, lat, lng })
  }, [onChange])

  const center = marker || (value?.lat && value?.lng ? [value.lat, value.lng] : DEFAULT_CENTER)

  return (
    <div className="space-y-3">
      <SearchBox onSelect={handleSearchSelect} />

      <div className="rounded-xl overflow-hidden border border-white/[0.06] h-[250px] relative">
        <MapContainer center={center} zoom={marker ? 13 : 4} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPlace={handlePlace} />
          {marker && <Marker position={marker} />}
          <FlyTo center={marker} />
        </MapContainer>
      </div>

      {value?.address && (
        <div className="flex items-start gap-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-2">{value.address}</span>
        </div>
      )}
    </div>
  )
}
