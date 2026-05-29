import { useState, useRef, useEffect } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import { CURRENCIES } from '../utils/format'

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
      >
        <span className="font-medium">{current.symbol}</span>
        <span className="hidden sm:inline">{current.code}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-[140px] glass rounded-xl border border-white/[0.08] shadow-2xl z-50 py-1.5 animate-fade-up">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                  c.code === currency
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="w-5 text-center">{c.symbol}</span>
                <span>{c.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
