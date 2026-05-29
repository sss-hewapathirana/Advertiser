export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function isExpired(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export function getDaysLeft(expireDate) {
  if (!expireDate) return { label: 'No expiry', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
  const diff = new Date(expireDate) - new Date()
  if (diff <= 0) return { label: 'Expired', color: 'text-red-400 bg-red-500/10 border-red-500/20' }
  const days = Math.ceil(diff / 86400000)
  if (days <= 7) return { label: `${days}d left`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
  if (days <= 30) return { label: `${days}d left`, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' }
  return { label: `${days}d left`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
}

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR' },
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
  { code: 'JPY', symbol: '¥', label: 'JPY' },
  { code: 'AUD', symbol: 'A$', label: 'AUD' },
  { code: 'CAD', symbol: 'C$', label: 'CAD' },
  { code: 'SGD', symbol: 'S$', label: 'SGD' },
]

export function formatPrice(price, currency = 'INR', rates = {}) {
  if (price == null) return ''
  const rate = rates[currency] || 1
  const converted = price * rate
  const found = CURRENCIES.find((c) => c.code === currency)
  const symbol = found?.symbol || currency
  return `${symbol}${Number(converted).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
