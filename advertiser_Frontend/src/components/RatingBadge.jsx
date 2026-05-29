import StarRating from './StarRating'

export default function RatingBadge({ averageRating = 0, reviewCount = 0 }) {
  const hasReviews = reviewCount > 0
  return (
    <div className="inline-flex items-center gap-1.5">
      <StarRating rating={averageRating} size="sm" />
      <span className="text-xs font-medium" style={{ color: hasReviews ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
        {hasReviews ? averageRating.toFixed(1) : '0.0'}
      </span>
      <span className="text-xs" style={{ color: hasReviews ? 'var(--color-text-muted)' : 'var(--color-text-muted)' }}>
        ({reviewCount})
      </span>
    </div>
  )
}
