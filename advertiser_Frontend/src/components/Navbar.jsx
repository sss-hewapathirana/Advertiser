import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { APP_NAME } from '../utils/constants'
import CurrencySwitcher from './CurrencySwitcher'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-all"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    setLoggingOut(false)
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navLinkClass = (path) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent-subtle)]'
    }`

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/ads', label: 'My Ads' },
        { to: '/messages', label: 'Inbox' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/#ads', label: 'Browse Ads' },
      ]

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'color-mix(in srgb, var(--color-bg) 85%, transparent)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>
                <span className="text-white text-xs font-black">A</span>
              </div>
              <span className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                {APP_NAME}
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <CurrencySwitcher />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-accent-subtle)] transition-all"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', border: '1px solid var(--color-border)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                      {(user.name || user.email || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm text-[var(--color-text-secondary)] font-medium max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                  <svg className="w-3.5 h-3.5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 rounded-xl z-50 py-2 animate-fade-up" style={{ background: 'var(--color-elevated)', border: '1px solid var(--color-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                      <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{user.name || user.email}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button onClick={() => { setUserMenuOpen(false); navigate('/profile') }}
                          className="w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}
                          onMouseEnter={e => e.target.style.background = 'var(--color-accent-subtle)'}
                          onMouseLeave={e => e.target.style.background = 'transparent'}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </button>
                      </div>
                      <div className="border-t pt-1" style={{ borderColor: 'var(--color-border)' }}>
                        <button onClick={handleLogout} disabled={loggingOut}
                          className="w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 disabled:opacity-50" style={{ color: 'var(--color-error)' }}
                          onMouseEnter={e => e.target.style.background = 'color-mix(in srgb, var(--color-error) 10%, transparent)'}
                          onMouseLeave={e => e.target.style.background = 'transparent'}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {loggingOut ? 'Signing out...' : 'Sign out'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost px-3 py-1.5 text-sm">
                  Log in
                </Link>
                <Link to="/register"
                  className="btn btn-primary px-3 py-1.5 text-sm font-medium">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-4 animate-fade-up" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent-subtle)]'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
