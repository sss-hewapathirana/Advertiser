import { useState, useRef, useEffect } from 'react'
import { CATEGORIES } from '../utils/categories'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function Dropdown({ label, value, options, onChange, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const active = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-all whitespace-nowrap">
        {active?.icon && <span className="text-slate-500">{active.icon}</span>}
        {active?.label || label}
        <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className={`absolute z-40 mt-1 min-w-[160px] glass border border-white/[0.08] rounded-xl py-1 shadow-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}>
            {options.map((opt) => (
              <button key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                  value === opt.value ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300 hover:bg-white/5'
                }`}>
                {opt.icon && <span className="text-slate-500">{opt.icon}</span>}
                {opt.label}
                {value === opt.value && (
                  <svg className="w-3.5 h-3.5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const STATUS_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
  { value: 'expired', label: 'Expired' },
  { value: 'expiring', label: 'Expiring soon' },
]
const MEDIA_OPTS = [
  { value: 'all', label: 'All media' },
  { value: 'images', label: 'With images' },
  { value: 'videos', label: 'With videos' },
  { value: 'text', label: 'Text only' },
]
const CATEGORY_OPTS = [
  { value: 'all', label: 'All categories' },
  ...CATEGORIES.map(c => ({ value: c, label: c })),
]
const SORT_OPTS = [
  { value: 'createDate', label: 'Created', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: 'adTitle', label: 'Title', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg> },
  { value: 'expireDate', label: 'Expiry', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
]
const DATE_PRESETS = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
]

export default function FilterBar({ filters, onFiltersChange, loading }) {
  const [search, setSearch] = useState(filters?.search || '')
  const [status, setStatus] = useState(filters?.status || 'all')
  const [mediaType, setMediaType] = useState(filters?.mediaType || 'all')
  const [category, setCategory] = useState(filters?.category || 'all')
  const [sortBy, setSortBy] = useState(filters?.sortBy || 'createDate')
  const [sortDir, setSortDir] = useState(filters?.sortDir || 'desc')
  const [datePreset, setDatePreset] = useState('all')
  const [dateFrom, setDateFrom] = useState(filters?.dateFrom || '')
  const [dateTo, setDateTo] = useState(filters?.dateTo || '')
  const [showDateRange, setShowDateRange] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    if (debouncedSearch !== (filters?.search || '')) {
      const clean = {}
      if (debouncedSearch) clean.search = debouncedSearch
      if (status !== 'all') clean.status = status
      if (mediaType !== 'all') clean.mediaType = mediaType
      if (category !== 'all') clean.category = category
      clean.sortBy = sortBy
      clean.sortDir = sortDir
      if (dateFrom) clean.dateFrom = dateFrom
      if (dateTo) clean.dateTo = dateTo
      onFiltersChange(clean)
    }
  }, [debouncedSearch])

  const emit = (overrides = {}) => {
    const clean = {}
    const s = overrides.search !== undefined ? overrides.search : search
    const st = overrides.status !== undefined ? overrides.status : status
    const mt = overrides.mediaType !== undefined ? overrides.mediaType : mediaType
    const ct = overrides.category !== undefined ? overrides.category : category
    const sb = overrides.sortBy !== undefined ? overrides.sortBy : sortBy
    const sd = overrides.sortDir !== undefined ? overrides.sortDir : sortDir
    const df = overrides.dateFrom !== undefined ? overrides.dateFrom : dateFrom
    const dt = overrides.dateTo !== undefined ? overrides.dateTo : dateTo
    if (s) clean.search = s
    if (st !== 'all') clean.status = st
    if (mt !== 'all') clean.mediaType = mt
    if (ct !== 'all') clean.category = ct
    clean.sortBy = sb
    clean.sortDir = sd
    if (df) clean.dateFrom = df
    if (dt) clean.dateTo = dt
    onFiltersChange(clean)
  }

  const handleDatePreset = (preset) => {
    setDatePreset(preset)
    if (preset === 'all') {
      setDateFrom(''); setDateTo(''); setShowDateRange(false)
      emit({ dateFrom: '', dateTo: '' })
    } else if (preset === 'custom') {
      setShowDateRange(true)
    } else {
      setShowDateRange(false)
      const days = { '7d': 7, '30d': 30, '90d': 90 }
      const to = new Date()
      const from = new Date(Date.now() - days[preset] * 86400000)
      const f = from.toISOString().split('T')[0]
      const t = to.toISOString().split('T')[0]
      setDateFrom(f); setDateTo(t)
      emit({ dateFrom: f, dateTo: t })
    }
  }

  const clearAll = () => {
    setSearch(''); setStatus('all'); setMediaType('all'); setCategory('all')
    setSortBy('createDate'); setSortDir('desc')
    setDatePreset('all'); setDateFrom(''); setDateTo(''); setShowDateRange(false)
    onFiltersChange({})
  }

  const hasActive = status !== 'all' || mediaType !== 'all' || category !== 'all' || search || dateFrom || dateTo

  const dateLabel = datePreset === 'custom'
    ? `${dateFrom || '...'} — ${dateTo || '...'}`
    : DATE_PRESETS.find((d) => d.value === datePreset)?.label || 'Date'

  return (
    <div className="mb-5">
      {/* Main filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark w-full pl-9 pr-3 py-2 rounded-xl text-white placeholder-slate-500 text-sm"
          />
          {search && (
            <button onClick={() => { setSearch(''); emit({ search: '' }) }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Status */}
        <Dropdown label="Status" value={status} options={STATUS_OPTS} onChange={(v) => { setStatus(v); emit({ status: v }) }} />

        {/* Media type */}
        <Dropdown label="Media" value={mediaType} options={MEDIA_OPTS} onChange={(v) => { setMediaType(v); emit({ mediaType: v }) }} />

        {/* Category */}
        <Dropdown label={category === 'all' ? 'Category' : CATEGORY_OPTS.find(o => o.value === category)?.label || 'Category'} value={category} options={CATEGORY_OPTS} onChange={(v) => { setCategory(v); emit({ category: v }) }} />

        {/* Date */}
        <Dropdown label={dateLabel} value={datePreset} options={DATE_PRESETS} onChange={handleDatePreset} />

        {/* Sort */}
        <Dropdown label={SORT_OPTS.find((o) => o.value === sortBy)?.label || 'Sort'} value={sortBy} options={SORT_OPTS} onChange={(v) => { setSortBy(v); emit({ sortBy: v }) }} align="right" />

        {/* Sort direction */}
        <button onClick={() => { const d = sortDir === 'asc' ? 'desc' : 'asc'; setSortDir(d); emit({ sortDir: d }) }}
          className="px-2.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 rounded-xl text-sm transition-all"
          title={sortDir === 'asc' ? 'Ascending' : 'Descending'}>
          {sortDir === 'asc' ? '↑' : '↓'}
        </button>

        {/* Clear */}
        {hasActive && (
          <button onClick={clearAll} className="px-2.5 py-2 text-xs text-slate-500 hover:text-white transition-colors font-medium">
            Clear
          </button>
        )}
      </div>

      {/* Custom date range */}
      {showDateRange && (
        <div className="flex items-center gap-2 mt-2">
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); emit({ dateFrom: e.target.value }) }}
            className="input-dark px-3 py-1.5 rounded-xl text-white text-xs" />
          <span className="text-slate-600 text-xs">→</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); emit({ dateTo: e.target.value }) }}
            className="input-dark px-3 py-1.5 rounded-xl text-white text-xs" />
        </div>
      )}

      {/* Active chips */}
      {hasActive && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {status !== 'all' && (
            <Chip label={`Status: ${STATUS_OPTS.find((o) => o.value === status)?.label}`} onRemove={() => { setStatus('all'); emit({ status: 'all' }) }} />
          )}
          {mediaType !== 'all' && (
            <Chip label={`Media: ${MEDIA_OPTS.find((o) => o.value === mediaType)?.label}`} onRemove={() => { setMediaType('all'); emit({ mediaType: 'all' }) }} />
          )}
          {category !== 'all' && (
            <Chip label={`Category: ${category}`} onRemove={() => { setCategory('all'); emit({ category: 'all' }) }} />
          )}
          {search && (
            <Chip label={`"${search}"`} onRemove={() => { setSearch(''); emit({ search: '' }) }} />
          )}
          {(dateFrom || dateTo) && (
            <Chip label={`${dateFrom || '...'} → ${dateTo || '...'}`} onRemove={() => { setDatePreset('all'); setDateFrom(''); setDateTo(''); setShowDateRange(false); emit({ dateFrom: '', dateTo: '' }) }} />
          )}
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </span>
  )
}
