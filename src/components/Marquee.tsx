type MarqueeProps = {
  items: string[]
  className?: string
}

export default function Marquee({ items, className = '' }: MarqueeProps) {
  // Repeated 4x (not just doubled) and shifted by exactly 1/4 of the
  // track's width — same seamless-loop trick (shift by one copy's worth,
  // so the loop point is pixel-identical to the start), but with enough
  // duplicated content that the track is always wider than the viewport.
  // With only 2 copies, a short item list could be narrower than a wide
  // monitor's viewport, leaving a visible blank gap once the track
  // scrolled past — the "seam" the animation is supposed to hide.
  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div
      className={`overflow-hidden bg-acid py-3 ${className}`}
      role="presentation"
    >
      <div className="marquee-track">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="mx-4 flex items-center font-mono text-sm font-bold tracking-widest text-void uppercase shrink-0"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
