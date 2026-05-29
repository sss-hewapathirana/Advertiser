import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastContext = createContext(null)
let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)) }, duration)
  }, [])

  const toast = useMemo(() => ({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  }), [addToast])

  const typeStyles = {
    success: { borderColor: 'color-mix(in srgb, var(--color-success) 40%, transparent)', background: 'color-mix(in srgb, var(--color-success) 20%, var(--color-elevated))' },
    error: { borderColor: 'color-mix(in srgb, var(--color-error) 40%, transparent)', background: 'color-mix(in srgb, var(--color-error) 20%, var(--color-elevated))' },
    info: { borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)', background: 'color-mix(in srgb, var(--color-accent) 20%, var(--color-elevated))' },
    warning: { borderColor: 'color-mix(in srgb, var(--color-warning) 40%, transparent)', background: 'color-mix(in srgb, var(--color-warning) 20%, var(--color-elevated))' },
  }

  const typeIcons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} style={{ ...typeStyles[t.type], backdropFilter: 'blur(12px)', color: 'var(--color-text)' }}
            className="px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-fade-up flex items-center gap-2.5">
            <span className="text-lg">{typeIcons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
