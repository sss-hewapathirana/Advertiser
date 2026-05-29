import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import { FormSkeleton } from '../components/ui/LoadingSkeleton'
import { FREE_AD_LIMIT } from '../utils/constants'
import { getDaysLeft, formatPrice } from '../utils/format'
import { CATEGORIES } from '../utils/categories'
import { useCurrency } from '../contexts/CurrencyContext'
import LocationPicker from '../components/location/LocationPicker'

const TITLE_MAX = 100
const DESC_MAX = 500

function DropZone({ label, accept, onFiles, multiple, uploading }) {
  const [drag, setDrag] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && onFiles) onFiles(files)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
        drag
          ? 'border-indigo-500/60 bg-indigo-500/5'
          : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]'
      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={uploading}
        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={(e) => { const files = Array.from(e.target.files); if (files.length > 0 && onFiles) onFiles(files) }}
      />
      {uploading ? (
        <svg className="animate-spin h-5 w-5 mx-auto text-indigo-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 mx-auto mb-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )}
      <p className="text-xs text-slate-500">{uploading ? 'Uploading...' : label}</p>
    </div>
  )
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
    </div>
  )
}

function MediaThumb({ src, name, uploading, error, onRemove }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-2 pr-3 border border-white/[0.06]">
      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/[0.03]">
        {uploading ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : error || imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>
      <span className="flex-1 text-xs text-slate-400 truncate">
        {error ? 'Upload failed' : name || src || 'No file'}
      </span>
      <button type="button" onClick={onRemove}
        className="p-1 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-red-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function AdForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAdvanced, adCount } = useAuth()
  const { currency, rates } = useCurrency()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ adTitle: '', adInfo: '', expireDate: '', price: '' })
  const [category, setCategory] = useState('Other')
  const [images, setImages] = useState([{ imageUrl: '' }])
  const [videos, setVideos] = useState([{ videoUrl: '', videoName: '', videoSize: 0 }])
  const [location, setLocation] = useState(null)
  const [showLocation, setShowLocation] = useState(false)
  const [published, setPublished] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [uploading, setUploading] = useState(false)

  const previewUrls = useRef({})
  const uploadIndex = useRef(0)

  const adLimitReached = !isAdvanced && adCount >= FREE_AD_LIMIT

  useEffect(() => {
    if (isEdit) {
      api.get(`/ads/${id}`)
        .then(({ data }) => {
          setForm({
            adTitle: data.adTitle || '',
            adInfo: data.adInfo || '',
            expireDate: data.expireDate ? data.expireDate.slice(0, 16) : '',
            price: data.price || '',
          })
          if (data.images?.length > 0) {
            setImages(data.images.map((img) => ({ imageUrl: img.imageUrl || '' })))
          }
          if (data.videos?.length > 0) {
            setVideos(data.videos.map((vid) => ({
              videoUrl: vid.videoUrl || '',
              videoName: vid.videoName || '',
              videoSize: vid.videoSize || 0,
            })))
          }
          setPublished(data.published !== false)
          if (data.category) setCategory(data.category)
          if (data.location || data.latitude) {
            setLocation({ address: data.location || '', lat: data.latitude, lng: data.longitude })
            setShowLocation(true)
          }
        })
        .catch(() => navigate('/ads'))
        .finally(() => setLoading(false))
    }

    return () => {
      Object.values(previewUrls.current).forEach((url) => URL.revokeObjectURL(url))
      previewUrls.current = {}
    }
  }, [id])

  const addImage = () => setImages((prev) => [...prev, { imageUrl: '' }])
  const removeImage = (i) => {
    if (previewUrls.current[i]) {
      URL.revokeObjectURL(previewUrls.current[i])
      delete previewUrls.current[i]
    }
    setImages((prev) => prev.filter((_, idx) => idx !== i))
  }
  const updateImage = (i, val) => setImages((prev) => {
    const copy = [...prev]; copy[i] = { imageUrl: val }; return copy
  })

  const addVideo = () => setVideos((prev) => [...prev, { videoUrl: '', videoName: '', videoSize: 0 }])
  const removeVideo = (i) => setVideos((prev) => prev.filter((_, idx) => idx !== i))
  const updateVideo = (i, field, val) => setVideos((prev) => {
    const copy = [...prev]; copy[i] = { ...copy[i], [field]: val }; return copy
  })

  const uploadFile = async (file) => {
    const id = ++uploadIndex.current
    const blobUrl = URL.createObjectURL(file)
    previewUrls.current[id] = blobUrl
    return { id, blobUrl }
  }

  const handleImageFiles = async (files) => {
    setUploading(true)
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const { id, blobUrl } = await uploadFile(file)

      const idx = images.length
      setImages((prev) => [...prev, { imageUrl: blobUrl, _uploadId: id }])

      const formData = new FormData()
      formData.append('file', file)

      try {
        const { data } = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setImages((prev) => prev.map((img, i) =>
          i === idx && img._uploadId === id
            ? { imageUrl: `/files/${data.filename}` }
            : img
        ))
      } catch {
        setImages((prev) => prev.map((img, i) =>
          i === idx && img._uploadId === id
            ? { ...img, _uploadError: true }
            : img
        ))
      }
    }

    setUploading(false)
  }

  const handleVideoFiles = async (files) => {
    setUploading(true)
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const { id, blobUrl } = await uploadFile(file)

      const idx = videos.length
      setVideos((prev) => [...prev, {
        videoUrl: blobUrl, videoName: file.name, videoSize: file.size, _uploadId: id
      }])

      const formData = new FormData()
      formData.append('file', file)

      try {
        const { data } = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setVideos((prev) => prev.map((vid, i) =>
          i === idx && vid._uploadId === id
            ? { videoUrl: `/files/${data.filename}`, videoName: file.name, videoSize: file.size }
            : vid
        ))
      } catch {
        setVideos((prev) => prev.map((vid, i) =>
          i === idx && vid._uploadId === id
            ? { ...vid, _uploadError: true }
            : vid
        ))
      }
    }

    setUploading(false)
  }

  const isUploading = () => {
    return images.some((img) => img._uploadId) || videos.some((vid) => vid._uploadId) || uploading
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isUploading()) return

    setError('')
    setSaving(true)

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || user.consumerId
      if (!userId) throw new Error('User session not found. Please log in again.')

      const payload = {
        ...form,
        price: parseFloat(form.price) || null,
        category,
        published,
        location: location?.address || null,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        images: images.filter((img) => img.imageUrl.trim() && !img._uploadError),
        videos: videos.filter((vid) => vid.videoUrl.trim() && !vid._uploadError),
        user: { consumerId: userId },
      }

      if (isEdit) {
        if (published && form.expireDate && new Date(form.expireDate) < new Date()) {
          toast.info('Re-publishing will extend the expiry date from today.')
        }
        await api.put(`/ads/${id}`, payload)
        toast.success('Campaign updated successfully')
      } else {
        await api.post('/ads', payload)
        toast.success('Campaign created successfully')
      }
      navigate('/ads')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save campaign')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-up">
      <div className="skeleton h-8 w-48 mb-6" />
      <FormSkeleton />
    </div>
  )

  const inputClass = 'input-dark w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm'
  const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5'

  const previewTitle = form.adTitle || 'Your Campaign Title'
  const previewDesc = form.adInfo || 'Campaign description will appear here...'
  const previewExpiry = form.expireDate ? getDaysLeft(new Date(form.expireDate).toISOString()) : null
  const previewImages = images.filter((img) => img.imageUrl.trim() && !img._uploadError)
  const previewVideos = videos.filter((vid) => vid.videoUrl.trim() && !vid._uploadError)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-up">
      <button onClick={() => navigate('/ads')}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to advertisements
      </button>

      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
        {isEdit ? 'Edit Advertisement' : 'Create Advertisement'}
      </h1>
      <p className="text-slate-400 mb-6">
        {isEdit ? 'Update the details of your advertisement' : 'Create a new advertisement for our platform'}
      </p>

      {!isEdit && (
        <div className="mb-6 text-sm font-medium">
          {isAdvanced ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Unlimited advertisements — Advanced account
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {adCount} of {FREE_AD_LIMIT} free advertisements used{adLimitReached ? ' (limit reached)' : ''}
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          {!isEdit && adLimitReached && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>
              You've reached the free tier limit. <a href="/" className="underline font-semibold ml-1">Upgrade to Advanced</a> to create unlimited advertisements.
            </div>
          )}

          {/* Section: Campaign Basics */}
          <div className="glass rounded-2xl p-5 border border-white/[0.06] space-y-4">
            <SectionHeader title="Ad Content" description="What do you want to advertise?" />
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                required
                maxLength={TITLE_MAX}
                value={form.adTitle}
                onChange={e => setForm({ ...form, adTitle: e.target.value })}
                placeholder="E.g. Summer Mega Sale"
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{form.adTitle.length}/{TITLE_MAX}</p>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className={inputClass}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="E.g. 99.99 — leave blank if free or N/A"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={4}
                maxLength={DESC_MAX}
                value={form.adInfo}
                onChange={e => setForm({ ...form, adInfo: e.target.value })}
                placeholder="Describe what your advertisement is about..."
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{form.adInfo.length}/{DESC_MAX}</p>
            </div>
          </div>

          {/* Section: Media */}
          <div className="glass rounded-2xl p-5 border border-white/[0.06] space-y-4">
            <SectionHeader title="Media" description="Drag & drop or paste URLs for images and videos" />

            <div className="space-y-2">
              <label className={labelClass}>Images</label>
              <DropZone label="Drop image files or click to upload" accept="image/*" onFiles={handleImageFiles} multiple uploading={uploading} />
              {images.map((img, i) => (
                <div key={i}>
                  {img._uploadId ? (
                    <MediaThumb
                      src={img.imageUrl}
                      name={img._uploadError ? img.imageUrl : 'Uploading...'}
                      uploading={!img._uploadError && !img.imageUrl.startsWith('/files/') && !img._uploadError}
                      error={img._uploadError}
                      onRemove={() => removeImage(i)}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input type="url" value={img.imageUrl}
                        onChange={e => updateImage(i, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className={`${inputClass} flex-1`} />
                      {images.length > 1 && (
                        <button type="button" onClick={() => removeImage(i)}
                          className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={addImage} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                + Add image URL
              </button>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Videos</label>
              <DropZone label="Drop video files or click to upload" accept="video/*" onFiles={handleVideoFiles} multiple uploading={uploading} />
              {videos.map((vid, i) => (
                <div key={i}>
                  {vid._uploadId ? (
                    <MediaThumb
                      src={vid.videoUrl}
                      name={vid._uploadError ? 'Upload failed' : (vid.videoName || 'Uploading...')}
                      uploading={!vid._uploadError && !vid.videoUrl.startsWith('/files/')}
                      error={vid._uploadError}
                      onRemove={() => removeVideo(i)}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" value={vid.videoUrl}
                        onChange={e => updateVideo(i, 'videoUrl', e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className={`${inputClass} flex-1`} />
                      <input type="text" value={vid.videoName}
                        onChange={e => updateVideo(i, 'videoName', e.target.value)}
                        placeholder="Name"
                        className={`${inputClass} w-20`} />
                      {videos.length > 1 && (
                        <button type="button" onClick={() => removeVideo(i)}
                          className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={addVideo} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                + Add video URL
              </button>
            </div>
          </div>

          {/* Section: Schedule */}
          <div className="glass rounded-2xl p-5 border border-white/[0.06] space-y-4">
            <SectionHeader title="Schedule" description="Set campaign expiry date" />
            <div>
              <label className={labelClass}>Expiry Date & Time</label>
              <input type="datetime-local" value={form.expireDate}
                onChange={e => setForm({ ...form, expireDate: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          {/* Section: Visibility */}
          <div className="glass rounded-2xl p-5 border border-white/[0.06] space-y-4">
            <SectionHeader title="Landing Page Visibility" description="Control whether this ad appears on the public landing page" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Published</p>
                <p className="text-xs text-slate-400 mt-0.5">Show this ad on the public landing page</p>
              </div>
              <button type="button" onClick={() => setPublished(!published)}
                className={`relative w-11 h-6 rounded-full transition-all ${
                  published ? 'bg-indigo-500' : 'bg-white/10'
                }`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
                  published ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>
            {!published && (
              <p className="text-xs text-amber-400 flex items-center gap-1">This ad is hidden from the public landing page</p>
            )}
          </div>

          {/* Section: Location */}
          <div className="glass rounded-2xl p-5 border border-white/[0.06] space-y-4">
            <SectionHeader title="Location" description="Optional — add a map location to your ad" />
            <button type="button" onClick={() => setShowLocation(!showLocation)}
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              <svg className={`w-4 h-4 transition-transform ${showLocation ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showLocation ? 'Remove Location' : 'Add Location'}
            </button>
            {showLocation && (
              <LocationPicker value={location} onChange={setLocation} />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving || (!isEdit && adLimitReached) || isUploading()}
              className="btn-glow px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : isUploading() ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </span>
              ) : isEdit ? 'Save Changes' : 'Save Advertisement'}
            </button>
            <button type="button" onClick={() => navigate('/ads')}
              className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl font-semibold text-sm transition-all">
              Cancel
            </button>
          </div>
        </form>

        {/* Preview Panel */}
        <div className="lg:col-span-2 lg:sticky lg:top-8 self-start">
          <div className="glass rounded-2xl p-5 border border-white/[0.06]">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Live Preview</h3>

            <div className="rounded-xl overflow-hidden border border-white/[0.06]">
              {previewImages.length > 0 ? (
                <div className="h-[140px] overflow-hidden">
                  <img src={previewImages[0].imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} loading="lazy" />
                </div>
              ) : (
                <div className="h-[100px] bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-white font-semibold text-base truncate">{previewTitle}</h4>
                  {previewExpiry && (
                    <span className={`shrink-0 px-2 py-0.5 text-[11px] font-medium rounded-full border ${previewExpiry.color}`}>
                      {previewExpiry.label}
                    </span>
                  )}
                </div>
                {form.price && (
                  <p className="text-indigo-400 font-bold text-sm mb-1">{formatPrice(parseFloat(form.price), currency, rates)}</p>
                )}
                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{previewDesc}</p>

                <div className="flex gap-2 mt-3">
                  {previewImages.length > 0 && (
                    <span className="text-xs text-slate-500">📷 {previewImages.length}</span>
                  )}
                  {previewVideos.length > 0 && (
                    <span className="text-xs text-slate-500">🎬 {previewVideos.length}</span>
                  )}
                  {previewImages.length === 0 && previewVideos.length === 0 && (
                    <span className="text-xs text-slate-600">No media attached</span>
                  )}
                </div>

                {form.expireDate && (
                  <p className="text-xs text-slate-500 mt-2">
                    Expires: {new Date(form.expireDate).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
