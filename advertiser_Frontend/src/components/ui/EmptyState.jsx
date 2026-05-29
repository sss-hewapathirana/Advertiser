import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export default function EmptyState({ icon, title, description, actionLabel, actionTo, onAction, className }) {
  return (
    <div className={cn('glass rounded-2xl p-12 sm:p-16 text-center border border-white/[0.06] max-w-lg mx-auto mt-8', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-slate-400 text-sm mb-6">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo}
          className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
