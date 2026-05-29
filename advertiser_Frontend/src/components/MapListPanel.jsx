import { useRef, useEffect, memo } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function AdListItem({ ad, isHovered, onHover, onLeave, onSelect, scrollRef }) {
  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => onHover(ad.adInfoId)}
      onMouseLeave={onLeave}
      onClick={() => onSelect(ad.adInfoId)}
      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isHovered
          ? 'bg-indigo-500/10 border border-indigo-500/20'
          : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
      }`}
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white/[0.03]">
        {ad.images?.[0]?.imageUrl ? (
          <img src={ad.images[0].imageUrl} alt="" className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none' }} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{ad.adTitle || 'Untitled'}</p>
        {ad.price != null && (
          <p className="text-indigo-400 text-xs font-bold">₹{Number(ad.price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          {ad.category && (
            <span className="text-[10px] text-indigo-500 font-medium uppercase tracking-wide">{ad.category}</span>
          )}
          {ad.createDate && (
            <span className="text-[10px] text-slate-500 ml-auto">{formatDate(ad.createDate)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

const MemoizedAdListItem = memo(AdListItem, (prev, next) =>
  prev.ad.adInfoId === next.ad.adInfoId && prev.isHovered === next.isHovered
)

export default function MapListPanel({ markers, hoveredId, onHover, onLeave, onSelect }) {
  const containerRef = useRef(null)
  const itemRefs = useRef({})

  useEffect(() => {
    if (hoveredId && itemRefs.current[hoveredId]) {
      itemRefs.current[hoveredId].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [hoveredId])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto space-y-1 pr-1 scrollbar-thin"
      style={{ scrollbarWidth: 'thin' }}>
      {markers.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 text-sm">No ads in this area</p>
        </div>
      ) : (
        markers.map(m => (
          <MemoizedAdListItem
            key={m.ad.adInfoId}
            ad={m.ad}
            isHovered={hoveredId === m.ad.adInfoId}
            onHover={onHover}
            onLeave={onLeave}
            onSelect={onSelect}
            scrollRef={el => { itemRefs.current[m.ad.adInfoId] = el }}
          />
        ))
      )}
    </div>
  )
}
