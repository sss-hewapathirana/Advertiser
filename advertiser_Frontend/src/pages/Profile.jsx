import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import api from '../services/api'
import { formatDate } from '../utils/format'
import { FREE_AD_LIMIT, APP_NAME } from '../utils/constants'

function Section({ title, desc, children }) {
  return (
    <div className="glass rounded-xl border border-white/[0.06] p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">{title}</h3>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 font-medium mb-1">{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={onChange} disabled={disabled}
          className="w-full input-dark px-3 py-2 rounded-xl text-white text-sm bg-white/5 border border-white/10">
          {(['']).map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full input-dark px-3 py-2 rounded-xl text-white text-sm placeholder-slate-500 bg-white/5 border border-white/10 focus:border-indigo-500/30 transition-all disabled:opacity-50"
        />
      )}
    </div>
  )
}

export default function Profile() {
  const { user, isAdvanced, refreshUser } = useAuth()
  const toast = useToast()
  const fileRef = useRef(null)

  const [name, setName] = useState(user.name || '')
  const [telNumber, setTelNumber] = useState(String(user.telNumber || ''))
  const [saving, setSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [upgrading, setUpgrading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', { name, telNumber })
      const normalized = { ...data.user, id: data.user.consumerId }
      localStorage.setItem('user', JSON.stringify(normalized))
      await refreshUser()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      await api.put('/auth/password', { currentPassword, newPassword })
      toast.success('Password changed')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = data.fileUrl || data
      await api.put('/auth/profile', { avatarUrl: url })
      await refreshUser()
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      await api.post('/auth/upgrade')
      await refreshUser()
      toast.success('Account upgraded to Advanced!')
    } catch {
      toast.error('Upgrade failed')
    } finally {
      setUpgrading(false)
    }
  }

  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your account and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile info */}
          <Section title="Profile Information" desc="Update your name and contact details.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" value={user.email || ''} disabled />
              <Input label="Phone" value={telNumber} onChange={(e) => setTelNumber(e.target.value)} placeholder="Phone number" />
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 btn-glow">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </Section>

          {/* Password */}
          <Section title="Change Password" desc="Update your account password.">
            <div className="space-y-3 mb-4">
              <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
              <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
            </div>
            <button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50">
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Avatar */}
          <Section title="Avatar" desc="Upload a profile picture.">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl mb-3 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-black">{initial}</span>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-xs font-medium hover:bg-white/10 transition-all disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </Section>

          {/* Account info */}
          <Section title="Account Details">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Account ID</span>
                <span className="text-xs text-white font-mono">#{user.id || user.consumerId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Type</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  isAdvanced ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {isAdvanced ? 'Advanced' : 'Basic'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Level</span>
                <span className="text-xs text-white font-semibold">{user.level || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Ads Created</span>
                <span className="text-xs text-white font-semibold">{user.noOfAd || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Ad Limit</span>
                <span className="text-xs text-white font-semibold">{isAdvanced ? 'Unlimited' : FREE_AD_LIMIT}</span>
              </div>
              {user.date && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Registered</span>
                  <span className="text-xs text-slate-400">{formatDate(user.date)}</span>
                </div>
              )}
            </div>
          </Section>

          {/* Upgrade */}
          {!isAdvanced && (
            <Section title="Upgrade Account" desc="Get unlimited ads and more.">
              <button onClick={handleUpgrade} disabled={upgrading}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50">
                {upgrading ? 'Processing...' : 'Upgrade to Premium'}
              </button>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
