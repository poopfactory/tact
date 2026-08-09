import { motion } from 'framer-motion'

// Word-by-word "rises into place" reveal — each word starts slightly below
// and transparent, then settles up into its resting position once the
// block scrolls into view. Fires once (not scrubbed continuously with
// scroll position like the old opacity-only version, which read as a
// dull gray-to-black fade rather than actual motion) and staggers by word
// for a wave rather than a typewriter cutoff. Renders inline `<span>`s,
// not its own block element, so it drops straight into an existing
// heading/paragraph without fighting that element's own font styling.
export function ScrollRevealWords({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.035 }}
          className="mr-[0.28em] inline-block last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
