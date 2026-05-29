import { useState, useId } from 'react'

function Star({ filled, half, onClick, onHover, size, clipId }) {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  const fillColor = 'var(--color-warning)'
  const emptyColor = 'var(--color-border)'
  return (
    <button type="button" onClick={onClick} onMouseEnter={onHover}
      className={`${dim} relative ${onClick ? 'cursor-pointer' : 'cursor-default'} transition-transform ${onHover && 'hover:scale-110'}`}>
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        {half && (
          <defs>
            <clipPath id={clipId}><rect x="0" y="0" width="12" height="24" /></clipPath>
          </defs>
        )}
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={filled || half ? fillColor : 'none'}
          stroke={filled || half ? fillColor : emptyColor}
          strokeWidth="1.5" />
        {half && (
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={emptyColor} stroke={emptyColor} strokeWidth="1.5" clipPath={`url(#${clipId})`} />
        )}
      </svg>
    </button>
  )
}

export default function StarRating({ rating = 0, size = 'md', interactive, onChange }) {
  const [hovered, setHovered] = useState(0)
  const uid = useId()
  const display = interactive && hovered ? hovered : rating
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const filled = display >= i
    const half = !filled && display >= i - 0.5
    stars.push(<Star key={i} filled={filled} half={half} size={size}
      clipId={`hs-${uid}-${i}`}
      onClick={interactive ? () => onChange?.(i) : undefined}
      onHover={interactive ? () => setHovered(i) : undefined} />)
  }
  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => interactive && setHovered(0)}>
      {stars}
    </div>
  )
}
