import { useState } from 'react'
import ConfirmDialog from './ui/ConfirmDialog'

export default function BulkActionBar({
  totalItems,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onExport,
  loading,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const selectedCount = selectedIds.size
  const allSelected = totalItems > 0 && selectedCount === totalItems
  const someSelected = selectedCount > 0 && selectedCount < totalItems

  if (totalItems === 0) return null

  const handleDelete = () => {
    setConfirmOpen(false)
    onDelete()
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected }}
              onChange={() => allSelected ? onDeselectAll() : onSelectAll()}
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-slate-400">
              {selectedCount > 0
                ? `${selectedCount} of ${totalItems} selected`
                : 'Select all'}
            </span>
          </label>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg border border-red-500/10 transition-all disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete ({selectedCount})
              </span>
            </button>
            <button
              onClick={onExport}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-all disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </span>
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Advertisements"
        message={`Are you sure you want to delete ${selectedCount} selected advertisement${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
