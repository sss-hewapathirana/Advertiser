import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDateTime, getDaysLeft, formatPrice } from '../utils/format'
import { useCurrency } from '../contexts/CurrencyContext'

function SortIcon({ active, dir }) {
  return (
    <span className={`inline-block ml-1 transition-colors ${active ? 'text-indigo-400' : 'text-slate-600'}`}>
      {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )
}

function SortTh({ label, field, currentSort, currentDir, onSort }) {
  const active = currentSort === field
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-white transition-colors"
      onClick={() => onSort(field, active && currentDir === 'asc' ? 'desc' : 'asc')}
    >
      {label}
      <SortIcon active={active} dir={currentDir} />
    </th>
  )
}

export default function AdTable({ ads, selectedIds, onToggleSelect, onSelectAll, onDeselectAll, onSort, onDelete, sortBy, sortDir, loading }) {
  const { currency, rates } = useCurrency()
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (ads.length === 0) return null

  const allSelected = ads.length > 0 && selectedIds.size === ads.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < ads.length

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected }}
                onChange={() => allSelected ? onDeselectAll() : onSelectAll()}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500 cursor-pointer"
              />
            </th>
            <SortTh label="Title" field="adTitle" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
            <SortTh label="Status" field="expireDate" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Media</th>
            <SortTh label="Created" field="createDate" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {ads.map((ad) => {
            const selected = selectedIds.has(ad.adInfoId)
            const expiry = getDaysLeft(ad.expireDate)

            return (
              <tr
                key={ad.adInfoId}
                className={`transition-all ${
                  selected
                    ? 'bg-indigo-500/5'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(ad.adInfoId)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/[0.03] relative">
                      {ad.images?.[0]?.imageUrl ? (
                        <img
                          src={ad.images[0].imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden') }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center ${ad.images?.[0]?.imageUrl ? 'hidden' : ''}`}>
                        <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium truncate max-w-[200px]">{ad.adTitle || 'Untitled'}</p>
                      <p className="text-slate-500 text-xs truncate max-w-[200px]">{ad.adInfo || 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                  {ad.price != null ? formatPrice(ad.price, currency, rates) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {ad.published === false && (
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
                        Unpublished
                      </span>
                    )}
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full border ${expiry.color}`}>
                      {expiry.label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {ad.numberOfPicture > 0 && <span>📷 {ad.numberOfPicture}</span>}
                    {ad.numberOfVideos > 0 && <span>🎬 {ad.numberOfVideos}</span>}
                    {!ad.numberOfPicture && !ad.numberOfVideos && <span className="text-slate-600">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                  {ad.createDate ? formatDateTime(ad.createDate) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
