import { cn } from '../../utils/cn'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel }) {
  if (!open) return null

  const variantStyles = {
    danger: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass rounded-2xl p-6 max-w-sm w-full border border-white/[0.08] animate-fade-up shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl font-semibold text-sm transition-all">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={cn('px-4 py-2 rounded-xl font-semibold text-sm transition-all', variantStyles[variant])}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
