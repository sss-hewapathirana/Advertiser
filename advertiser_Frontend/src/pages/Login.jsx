import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>
            <span className="text-white text-lg font-black">A</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Sign in to your account</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5 text-sm font-medium" style={{ background: 'color-mix(in srgb, var(--color-error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)', color: 'var(--color-error)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
              <input id="login-email" type="email" required autoComplete="email"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-base w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
              <input id="login-password" type="password" required autoComplete="current-password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input-base w-full px-4 py-2.5 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full py-2.5 text-sm font-medium disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="divider my-5" />
          <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-accent)' }} className="font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
