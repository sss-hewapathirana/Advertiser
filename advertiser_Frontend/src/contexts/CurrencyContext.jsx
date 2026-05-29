import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CurrencyContext = createContext()

const STORAGE_KEY = 'preferred_currency'
const RATES_CACHE_KEY = 'exchange_rates_cache'
const RATES_URL = 'https://api.exchangerate-api.com/v4/latest/INR'
const CACHE_TTL = 60 * 60 * 1000

function loadRates() {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_TTL) return null
    return cached.rates
  } catch {
    return null
  }
}

function saveRates(rates) {
  try {
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }))
  } catch {}
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'INR' } catch { return 'INR' }
  })
  const [rates, setRates] = useState(() => loadRates() || {})
  const [loadingRates, setLoadingRates] = useState(false)

  const setCurrency = useCallback((code) => {
    setCurrencyState(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch {}
  }, [])

  useEffect(() => {
    if (rates && Object.keys(rates).length > 0) return
    setLoadingRates(true)
    fetch(RATES_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) {
          setRates(data.rates)
          saveRates(data.rates)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRates(false))
  }, [])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, loadingRates }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
