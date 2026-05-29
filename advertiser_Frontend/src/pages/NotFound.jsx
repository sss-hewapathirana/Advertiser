import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="text-center animate-fade-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 mb-6">
          <span className="text-4xl font-black text-slate-500">404</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/"
          className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
