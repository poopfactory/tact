import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import ScrollProgressRail from './ScrollProgressRail'

// Same basis as the scroll-progress rail (right-center gauge) — the header
// morph is meant to trigger off that reading, not off a hero-specific
// pixel height, so it tracks whatever the user sees on the gauge.
const PILL_TRIGGER = 0.3
const PILL_WINDOW = 0.04

// No "Home" entry — the logo itself is the home link now (see the header
// markup below), so a redundant text link isn't needed next to it.
const navItems = [
  { to: '/shop', label: 'Shop' },
  { to: '/studio', label: 'Studio' },
  { to: '/brand', label: 'Brand' },
  { to: '/video', label: 'Video' },
]

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClick}
          className={({ isActive }) =>
            `font-mono text-sm uppercase tracking-widest transition-colors ${
              isActive ? 'text-acid' : 'text-bone hover:text-acid'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

export default function Layout() {
  const { pathname, hash } = useLocation()

  // React Router doesn't reset scroll on navigation (it's an SPA, not a
  // real page load) — without this, clicking a nav link opens the new
  // route at whatever scroll depth the previous page was left at. A link
  // that also carries a hash (e.g. from another page to /#lookbook) scrolls
  // to that section instead, since Home now hosts content — like the
  // lookbook highlight — that other pages link back into.
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  const { scrollYProgress } = useScroll()

  // Past 30% on the scroll-progress gauge, the full-width glass bar morphs
  // into a narrower, rounded floating pill — same on every route (the hero
  // no longer has its own scroll-driven reveal to key an entrance fade off
  // of, so nav is just visible from load like the rest of the page).
  const pillProgress = useTransform(scrollYProgress, [PILL_TRIGGER, PILL_TRIGGER + PILL_WINDOW], [0, 1])
  // Function form on purpose: framer-motion's automatic string interpolation
  // breaks when keyframes mix units ('100%' vs '860px' silently collapses
  // to e.g. '100px'), so the whole string is built here instead of letting
  // it interpolate between two unit-mismatched keyframes.
  const navMaxWidth = useTransform(pillProgress, (p) => `calc(100% - ${Math.round(p * 700)}px)`)
  const navRadius = useTransform(pillProgress, [0, 1], [0, 9999])
  const navMarginTop = useTransform(pillProgress, [0, 1], [0, 14])
  const navBorderColor = useTransform(pillProgress, [0, 1], ['rgba(10,10,11,0)', 'rgba(10,10,11,0.08)'])

  return (
    <div className="min-h-screen bg-paper text-bone flex flex-col">
      <ScrollProgressRail />

      {/* Frosted glass bar — translucent white + backdrop-blur so whatever
          sits behind it (hero art, page content) shows through softly. */}
      <motion.header
        style={{
          maxWidth: navMaxWidth,
          borderRadius: navRadius,
          marginTop: navMarginTop,
          borderColor: navBorderColor,
        }}
        className="site-header sticky mx-auto top-0 z-50 w-full border border-transparent bg-white/70 shadow-[0_1px_0_rgba(10,10,11,0.06),0_12px_32px_rgba(10,10,11,0.16)] backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
          {/* Black logo by default, neon on hover — two stacked images
              cross-fading via opacity rather than swapping `src`, so there's
              no flash/reload on hover (both are already loaded). */}
          <NavLink to="/" className="group relative block h-7 w-auto md:h-8">
            <img
              src="/brand/logo_black.png"
              alt="TACT"
              className="h-7 w-auto transition-opacity duration-300 ease-out group-hover:opacity-0 md:h-8"
            />
            <img
              src="/brand/logo_neon.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-7 w-auto opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 md:h-8"
            />
          </NavLink>
          <nav className="hidden items-center gap-8 md:flex">
            <NavLinks />
          </nav>
          <MobileNav />
        </div>
      </motion.header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="noise-overlay bg-gunmetal">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <img src="/brand/logo_black.png" alt="TACT" className="h-8 w-auto" />
              <p className="mt-4 max-w-xs font-sans text-sm text-concrete">
                A cold metal cuff engineered for warm frequencies. Worn by the scene,
                built like the sound system.
              </p>
            </div>
            <div>
              <p className="inline-block bg-acid px-2 py-1 font-mono text-xs uppercase tracking-widest text-white">
                Explore
              </p>
              <ul className="mt-4 space-y-2 font-sans text-sm">
                <li>
                  <NavLink to="/shop" className="hover:text-acid">
                    The Bracelet
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/#lookbook" className="hover:text-acid">
                    Lookbook
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/brand" className="hover:text-acid">
                    Our Story
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/studio" className="hover:text-acid">
                    Studio (Live Demo)
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <p className="inline-block bg-acid px-2 py-1 font-mono text-xs uppercase tracking-widest text-white">
                Support
              </p>
              <ul className="mt-4 space-y-2 font-sans text-sm text-bone/80">
                <li>Sizing Guide</li>
                <li>Shipping</li>
                <li>Returns</li>
              </ul>
            </div>
            <div>
              <p className="inline-block bg-acid px-2 py-1 font-mono text-xs uppercase tracking-widest text-white">
                Frequency
              </p>
              <ul className="mt-4 space-y-2 font-sans text-sm text-bone/80">
                <li>Instagram</li>
                <li>TikTok</li>
                <li>Newsletter</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex flex-col gap-2 border-t border-steel-2 pt-6 font-mono text-xs uppercase tracking-widest text-concrete md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} TACT Studio. All rights reserved.</span>
            <span>Made of steel. Tuned by sound.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function MobileNav() {
  return (
    <details className="relative md:hidden">
      <summary className="list-none cursor-pointer select-none rounded-full border border-steel-2 px-3 py-2 font-sans text-xs uppercase tracking-widest">
        Menu
      </summary>
      <div className="absolute right-0 top-12 z-50 flex w-56 flex-col gap-4 border-2 border-bone bg-gunmetal p-6 shadow-hard">
        <NavLinks />
      </div>
    </details>
  )
}
