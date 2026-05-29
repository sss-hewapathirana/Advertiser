import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../components/ui/Toast'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FilterBar from '../components/FilterBar'
import BulkActionBar from '../components/BulkActionBar'
import AdCardGrid from '../components/AdCardGrid'
import AdTable from '../components/AdTable'

export default function AdList() {
  const [ads, setAds] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(8)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [view, setView] = useState('grid')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: pageSize, sort: `${filters.sortBy || 'adInfoId'},${filters.sortDir || 'desc'}` }
      if (filters.search) params.q = filters.search
      if (filters.status) params.status = filters.status
      if (filters.mediaType) params.mediaType = filters.mediaType
      if (filters.dateFrom) params.dateFrom = filters.dateFrom
      if (filters.dateTo) params.dateTo = filters.dateTo
      const { data } = await api.get('/ads', { params })
      setAds(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch {
      setAds([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  useEffect(() => { fetchAds() }, [fetchAds])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [ads])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setPage(0)
  }

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelectAll = () => setSelectedIds(new Set(ads.map((a) => a.adInfoId)))
  const handleDeselectAll = () => setSelectedIds(new Set())

  const handleDelete = (id) => setDeleteTarget(id)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/ads/${deleteTarget}`)
      toast.success('Advertisement deleted')
      setDeleteTarget(null)
      fetchAds()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const { data } = await api.post('/ads/bulk-delete', [...selectedIds])
      toast.success(data.message || 'Deleted')
      setSelectedIds(new Set())
      fetchAds()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete')
    }
  }

  const handleExport = async () => {
    if (selectedIds.size === 0) return
    try {
      const ids = [...selectedIds]
      const params = ids.map((id) => `ids=${id}`).join('&')
      const { data } = await api.get(`/ads/export?${params}`, { responseType: 'text' })
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ads-export.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('CSV exported')
    } catch (err) {
      toast.error(err.response?.data || 'Failed to export')
    }
  }

  const handleSort = (field, dir) => {
    setFilters((prev) => ({ ...prev, sortBy: field, sortDir: dir }))
    setPage(0)
  }

  const pageSizes = [4, 8, 12, 20]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Advertisements</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalElements} advertisement{totalElements !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/ads/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all btn-glow">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Ad
        </Link>
      </div>

      {/* View toggle inline with filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
          <button onClick={() => setView('grid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Grid
          </button>
          <button onClick={() => setView('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'table' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Table
          </button>
        </div>
      </div>

      <FilterBar filters={filters} onFiltersChange={handleFiltersChange} loading={loading} />

      <BulkActionBar
        totalItems={totalElements}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onDelete={handleBulkDelete}
        onExport={handleExport}
        loading={loading}
      />

      {ads.length === 0 && !loading ? (
        <EmptyState
          icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title={filters.search || filters.status || filters.mediaType ? 'No matching advertisements' : 'No advertisements yet'}
          description={filters.search || filters.status || filters.mediaType ? 'Try different filters or clear all.' : 'Create your first advertisement.'}
          actionLabel={filters.search || filters.status || filters.mediaType ? undefined : 'Create Advertisement'}
          actionTo={filters.search || filters.status || filters.mediaType ? undefined : '/ads/new'}
        />
      ) : (
        <>
          {view === 'grid' ? (
            <AdCardGrid
              ads={ads}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onDelete={handleDelete}
              loading={loading}
            />
          ) : (
            <AdTable
              ads={ads}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onSort={handleSort}
              onDelete={handleDelete}
              sortBy={filters.sortBy || 'adInfoId'}
              sortDir={filters.sortDir || 'desc'}
              loading={loading}
            />
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-1">
                <button disabled={page === 0} onClick={() => setPage(0)}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium">
                  First
                </button>
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium">
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum
                  if (totalPages <= 5) pageNum = i
                  else if (page < 2) pageNum = i
                  else if (page > totalPages - 3) pageNum = totalPages - 5 + i
                  else pageNum = page - 2 + i
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all ${
                        pageNum === page
                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                          : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}>
                      {pageNum + 1}
                    </button>
                  )
                })}
                <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium">
                  Next
                </button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium">
                  Last
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Per page:</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
                  className="bg-white/5 border border-white/10 px-2 py-1.5 rounded-lg text-white text-xs">
                  {pageSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Advertisement"
        message="Are you sure you want to delete this advertisement? This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
