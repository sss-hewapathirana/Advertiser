import { Link } from 'react-router-dom'
import { APP_NAME } from '../utils/constants'

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>
                <span className="text-white text-xs font-black">A</span>
              </div>
              <span className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{APP_NAME}</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              A modern advertising platform for creating and managing image and video advertisements.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => e.target.style.color = 'var(--color-text)'} onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Home</Link></li>
              <li><Link to="/#ads" className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => e.target.style.color = 'var(--color-text)'} onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Browse Ads</Link></li>
              <li><Link to="/register" className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => e.target.style.color = 'var(--color-text)'} onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => e.target.style.color = 'var(--color-text)'} onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Log In</Link></li>
              <li><Link to="/register" className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => e.target.style.color = 'var(--color-text)'} onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Register</Link></li>
              <li><Link to="/dashboard" className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => e.target.style.color = 'var(--color-text)'} onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm cursor-default" style={{ color: 'var(--color-text-muted)' }}>Privacy Policy</span></li>
              <li><span className="text-sm cursor-default" style={{ color: 'var(--color-text-muted)' }}>Terms of Service</span></li>
              <li>
                <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-success)' }} />
                  System Online
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Built with React &middot; Spring Boot &middot; PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  )
}
