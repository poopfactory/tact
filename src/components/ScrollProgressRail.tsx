import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

export default function ScrollProgressRail() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 32, mass: 0.4 })

  const fillScale = progress
  const cometTop = useTransform(progress, (v) => `${(1 - v) * 100}%`)
  const percentLabel = useTransform(progress, (v) => String(Math.round(v * 100)).padStart(2, '0'))
  const glow = useTransform(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0])
  const cometOpacity = useTransform(glow, (g) => 0.4 + g * 0.6)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-3 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-center gap-3 md:flex"
    >
      <span className="font-mono text-[9px] uppercase tracking-widest text-bone/40 [writing-mode:vertical-rl]">
        Scroll
      </span>

      <div className="relative h-40 w-[3px] overflow-visible rounded-full bg-steel-2">
        {/* neon fill, grows from the bottom */}
        <motion.div
          style={{ scaleY: fillScale }}
          className="absolute bottom-0 left-0 h-full w-full origin-bottom rounded-full bg-acid"
        />
        {/* comet — a glowing dot riding the leading edge of the fill */}
        <motion.div
          style={{ top: cometTop, opacity: cometOpacity }}
          className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid shadow-neon"
        />
      </div>

      <motion.span className="font-sans text-[10px] tracking-widest text-acid">
        {percentLabel}
      </motion.span>
    </div>
  )
}
