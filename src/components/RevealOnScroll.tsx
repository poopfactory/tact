import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Block-level counterpart to ScrollRevealWords — for images, cards, and
// other non-text elements that need the same "rises into place once"
// entrance instead of being wrapped word-by-word. Same easing/duration so
// the two read as one motion language across the page.
export function RevealOnScroll({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
