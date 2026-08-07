type Props = {
  className?: string
  glow?: boolean
}

export default function BraceletGraphic({ className = '', glow = true }: Props) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="TACT metal cuff bracelet, abstract render"
    >
      <defs>
        <linearGradient id="metalBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e4e6ea" />
          <stop offset="35%" stopColor="#8a8d94" />
          <stop offset="55%" stopColor="#1d1e22" />
          <stop offset="80%" stopColor="#b9bdc4" />
          <stop offset="100%" stopColor="#55585f" />
        </linearGradient>
        <linearGradient id="metalRim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1efe9" />
          <stop offset="100%" stopColor="#55585f" />
        </linearGradient>
        {glow && (
          <filter id="acidGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <circle
        cx="200"
        cy="200"
        r="150"
        fill="none"
        stroke="url(#metalBody)"
        strokeWidth="46"
      />
      <circle
        cx="200"
        cy="200"
        r="150"
        fill="none"
        stroke="url(#metalRim)"
        strokeWidth="46"
        opacity="0.35"
        strokeDasharray="2 14"
      />

      <g transform="translate(200 200)">
        <rect
          x="-18"
          y="-172"
          width="36"
          height="44"
          rx="4"
          fill="var(--color-acid)"
          filter={glow ? 'url(#acidGlow)' : undefined}
        />
        <text
          x="0"
          y="-146"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="14"
          fontWeight="700"
          fill="var(--color-void)"
        >
          T
        </text>
      </g>

      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2
        const x1 = 200 + Math.cos(angle) * 128
        const y1 = 200 + Math.sin(angle) * 128
        const x2 = 200 + Math.cos(angle) * 172
        const y2 = 200 + Math.sin(angle) * 172
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--color-void)"
            strokeWidth="1"
            opacity="0.5"
          />
        )
      })}
    </svg>
  )
}
