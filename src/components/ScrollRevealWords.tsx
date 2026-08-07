import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

// The word-by-word "dims in as you scroll past it" reveal from the loro.dev
// reference — each word tracks its own slice of the parent's scroll-through
// progress (via useScroll's element-relative `target`), so words earlier in
// the sentence light up first as the block scrolls up through the trigger
// zone. Renders inline `<span>`s, not its own block element, so it drops
// straight into an existing heading/paragraph without fighting that
// element's own font styling.
function RevealWord({
  word,
  progress,
  range,
}: {
  word: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block last:mr-0">
      {word}
    </motion.span>
  )
}

export function ScrollRevealWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  // Trigger zone is the block's own scroll-through range, not the whole
  // page — starts dim as it enters from the bottom, fully lit well before
  // it reaches center, so it reads as "settled" rather than still catching up.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.4'] })
  const words = text.split(' ')

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length
        // 1.4x a single word's share so neighboring words' reveal windows
        // overlap slightly — a hard per-word cutoff reads as a typewriter,
        // this reads as a wave.
        const end = Math.min(start + 1.4 / words.length, 1)
        return <RevealWord key={`${word}-${i}`} word={word} progress={scrollYProgress} range={[start, end]} />
      })}
    </span>
  )
}
