export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-32 w-full" />
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-24 w-full" />
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 space-y-5 border border-white/[0.06]">
      <div className="skeleton h-12 w-full" />
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-12 w-1/2" />
      <div className="skeleton h-10 w-32" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-up space-y-6">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-4 w-72" />
      <CardSkeleton />
      <ListSkeleton />
    </div>
  )
}
