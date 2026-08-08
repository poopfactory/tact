import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopCuffModel } from '../components/CuffModel'
import Marquee from '../components/Marquee'
import { ShimmerButton } from '@/components/ui/shimmer-button'

// '3d' is the interactive drag-to-rotate model; the rest are the shot
// product photos, in display order.
const galleryItems = [
  { id: '3d' as const },
  { id: 'photo' as const, src: '/products/shop-1.png', alt: 'TACT cuff, side profile' },
  { id: 'photo' as const, src: '/products/shop-2.png', alt: 'TACT cuff, worn on wrist' },
  { id: 'photo' as const, src: '/products/shop-3.png', alt: 'TACT cuff, top-down' },
  { id: 'photo' as const, src: '/products/shop-4.png', alt: 'TACT cuff, clasp detail' },
]

const finishes = [
  { name: 'Chrome', price: 0 },
  { name: 'Gunmetal', price: 20000 },
  { name: 'Acid Etch', price: 40000, limited: true },
]

const sizes = [
  { name: 'S', range: '15-16cm' },
  { name: 'M', range: '17-18cm' },
  { name: 'L', range: '19-20cm' },
]

const specRows = [
  ['Material', '316L Surgical Steel Core'],
  ['Finish', 'Brushed / Acid-Etched'],
  ['Closure', 'Hex-Pin Locking Clasp'],
  ['Circumference', '15.5 – 21 cm (adjustable)'],
  ['Weight', '64g'],
  ['Water Resistance', 'IP67'],
  ['Origin', 'Designed in-house, cast in small batch'],
]

// Left/right pinch-gesture map — same finger assignments as the Studio
// engine (see src/studio/components/LeftControlPanel.tsx /
// RightEffectPanel.tsx), laid out here as a static diagram rather than a
// live control surface.
const pinchLeft = [
  { label: 'Custom', finger: 'Pinky', top: 84 },
  { label: 'Volume Down', finger: 'Ring', top: 138, inner: true },
  { label: 'Volume Up', finger: 'Middle', top: 241, inner: true },
  { label: 'Play Pause', finger: 'Index', top: 345, inner: true },
  { label: 'Trigger', finger: 'Thumb', top: 398, active: true },
]
const pinchRight = [
  { label: 'Pitch', finger: 'Pinky', top: 84 },
  { label: 'Pass Filter', finger: 'Ring', top: 138, inner: true },
  { label: 'Delay', finger: 'Middle', top: 241, inner: true },
  { label: 'Reverb', finger: 'Index', top: 345, inner: true },
  { label: 'Trigger', finger: 'Thumb', top: 398, active: true },
]

function PinchBubble({
  label,
  finger,
  top,
  inner,
  active,
  side,
}: {
  label: string
  finger: string
  top: number
  inner?: boolean
  active?: boolean
  side: 'left' | 'right'
}) {
  const outerPct = side === 'left' ? 11.6 : 88.4
  const innerPct = side === 'left' ? 22.5 : 77.5
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
      style={{ left: `${inner ? innerPct : outerPct}%`, top }}
    >
      <div
        className={`flex items-center justify-center rounded-full border text-center font-sans font-semibold leading-tight ${
          active
            ? 'h-20 w-20 border-acid bg-acid text-void md:h-24 md:w-24'
            : 'h-14 w-14 border-steel-2 bg-paper text-bone md:h-16 md:w-16'
        } text-[11px] md:text-xs`}
      >
        {label}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-concrete">{finger}</span>
    </div>
  )
}

export default function Shop() {
  const navigate = useNavigate()
  const [finish, setFinish] = useState(finishes[0].name)
  const [size, setSize] = useState(sizes[1].name)
  const [activeIdx, setActiveIdx] = useState(0)
  const active = galleryItems[activeIdx]
  const total = finishes.find((f) => f.name === finish)?.price ?? 0

  const goPrev = () => setActiveIdx((i) => (i - 1 + galleryItems.length) % galleryItems.length)
  const goNext = () => setActiveIdx((i) => (i + 1) % galleryItems.length)

  return (
    <>
      {/* BUY — clean row-list configurator: single image carousel on the
          left, finish/size selectors as full-width rows on the right. */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 pt-16 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-2xl tracking-tight md:text-3xl">BUY TO TACT</h1>
            <button
              type="button"
              onClick={() => navigate('/studio')}
              className="rounded-full border border-steel-2 bg-paper-2 px-5 py-2 font-mono text-[11px] uppercase tracking-widest text-concrete transition-colors hover:border-acid hover:text-acid"
            >
              Try In Studio
            </button>
          </div>

          <div className="mt-8 grid gap-10 pb-16 md:grid-cols-2 md:gap-16">
            {/* GALLERY — single frame + prev/dot/next controls */}
            <div>
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[28px] bg-paper-2">
                {active.id === '3d' ? (
                  <ShopCuffModel className="h-full w-full" />
                ) : (
                  <img src={active.src} alt={active.alt} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="mt-4 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-steel-2 text-bone transition-colors hover:border-acid hover:text-acid"
                >
                  ‹
                </button>
                <div className="flex items-center gap-2">
                  {galleryItems.map((item, i) => (
                    <button
                      key={item.id === '3d' ? '3d' : item.src}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-pressed={activeIdx === i}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        activeIdx === i ? 'bg-void' : 'bg-steel-2'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-steel-2 text-bone transition-colors hover:border-acid hover:text-acid"
                >
                  ›
                </button>
              </div>
            </div>

            {/* CONFIGURE */}
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-concrete">Finish</p>
              <div className="mt-3 flex flex-col gap-3">
                {finishes.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setFinish(f.name)}
                    aria-pressed={finish === f.name}
                    className={`flex items-center justify-between rounded-xl border px-5 py-3 font-sans text-sm transition-colors ${
                      finish === f.name ? 'border-acid' : 'border-steel-2 hover:border-bone/40'
                    }`}
                  >
                    <span className="uppercase tracking-wide">{f.name}</span>
                    <span className="text-concrete">
                      {f.price === 0 ? '+0' : `+${f.price.toLocaleString('ko-KR')}`}
                      {f.limited ? ' [Limited]' : ''}
                    </span>
                  </button>
                ))}
              </div>

              <p className="mt-8 font-mono text-xs uppercase tracking-widest text-concrete">Size</p>
              <div className="mt-3 flex flex-col gap-3">
                {sizes.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSize(s.name)}
                    aria-pressed={size === s.name}
                    className={`flex items-center justify-between rounded-xl border px-5 py-3 font-sans text-sm transition-colors ${
                      size === s.name ? 'border-acid' : 'border-steel-2 hover:border-bone/40'
                    }`}
                  >
                    <span className="uppercase tracking-wide">{s.name}</span>
                    <span className="text-concrete">{s.range}</span>
                  </button>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-steel-2 pt-6">
                <span className="font-display text-2xl">₩{total.toLocaleString('ko-KR')}</span>
                <ShimmerButton
                  borderRadius="9999px"
                  shimmerSize="0.15em"
                  shimmerDuration="1.3s"
                  shimmerSpread="150deg"
                  className="px-8 py-3 text-xs"
                >
                  Buy
                </ShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={['TACT · STYLE YOUR SOUND · EVERYDAY LIFE NON-STOP FESTIVAL']} />

      {/* PINCH CONTROL — static diagram of the left/right pinch-gesture map.
          Below md the absolute-positioned diagram has no room to breathe
          (bubbles and the center text column collide), so it's swapped for
          a simple stacked list of the same content instead of trying to
          scale the same coordinates down. */}
      <section className="bg-paper py-16 md:py-32">
        <div className="mx-auto flex max-w-[440px] flex-col items-center px-6 text-center md:hidden">
          <h2 className="font-slogan text-2xl font-bold">PINCH CONTROL</h2>
          <p className="mt-4 font-kr text-sm leading-relaxed text-concrete">
            엄지와 손끝이 만나는 순간, 움직이는 사운드
          </p>
          <p className="mt-2 font-kr text-[11px] leading-relaxed text-concrete/80">
            <span className="block">손목 피부로 전해지는 미세한 힘줌의 텝, 그리고 손끝을 맞대는 핀치(Pinch) 제스처 하나로</span>
            <span className="block">기본 플레이부터 화려한 이펙트 믹싱까지 완벽하게 지휘하세요.</span>
          </p>
          <button
            type="button"
            className="mt-6 rounded-full border border-steel-2 bg-paper px-6 py-2 font-mono text-[11px] uppercase tracking-widest text-concrete transition-colors hover:border-acid hover:text-acid"
          >
            App Store
          </button>

          {[
            { title: 'Basic Player (L)', items: pinchLeft },
            { title: 'Effect Mixing (R)', items: pinchRight },
          ].map((col) => (
            <div key={col.title} className="mt-12 w-full">
              <p className="font-display text-sm uppercase">{col.title}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-5">
                {col.items.map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-2">
                    <div
                      className={`flex items-center justify-center rounded-full border text-center font-sans text-[11px] font-semibold leading-tight ${
                        b.active ? 'h-20 w-20 border-acid bg-acid text-void' : 'h-14 w-14 border-steel-2 bg-paper text-bone'
                      }`}
                    >
                      {b.label}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-concrete">
                      {b.finger}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop diagram — mirrored columns of finger bubbles flanking
            the pitch, positioned with hand-placed coordinates. */}
        <div className="relative mx-auto hidden h-[460px] max-w-[1400px] px-6 md:block md:px-10">
          {pinchLeft.map((b) => (
            <PinchBubble key={b.label} {...b} side="left" />
          ))}
          {pinchRight.map((b) => (
            <PinchBubble key={b.label} {...b} side="right" />
          ))}

          <div
            className="absolute max-w-[140px] font-display text-sm uppercase leading-tight md:text-base"
            style={{ left: '11.6%', top: 246, transform: 'translate(-50%, -50%)' }}
          >
            Basic Player (L)
          </div>
          <div
            className="absolute max-w-[140px] text-right font-display text-sm uppercase leading-tight md:text-base"
            style={{ left: '88.4%', top: 246, transform: 'translate(-50%, -50%)' }}
          >
            Effect Mixing (R)
          </div>

          <div
            className="absolute left-1/2 flex w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
            style={{ top: 200 }}
          >
            <h2 className="font-slogan text-2xl font-bold md:text-4xl">PINCH CONTROL</h2>
            <p className="mt-4 font-kr text-sm leading-relaxed text-concrete md:text-base">
              엄지와 손끝이 만나는 순간, 움직이는 사운드
            </p>
            <p className="mt-2 font-kr text-[11px] leading-relaxed text-concrete/80 md:text-xs">
              <span className="block">손목 피부로 전해지는 미세한 힘줌의 텝, 그리고 손끝을 맞대는 핀치(Pinch) 제스처 하나로</span>
              <span className="block">기본 플레이부터 화려한 이펙트 믹싱까지 완벽하게 지휘하세요.</span>
            </p>
            <button
              type="button"
              className="mt-6 rounded-full border border-steel-2 bg-paper px-6 py-2 font-mono text-[11px] uppercase tracking-widest text-concrete transition-colors hover:border-acid hover:text-acid"
            >
              App Store
            </button>
          </div>
        </div>
      </section>

      {/* CLOSING ACID BLOCK — gradient hand-off from the page background,
          triple headline, then the spec sheet in the same acid field. */}
      <div className="h-40 bg-gradient-to-b from-paper to-acid md:h-56" />
      <section className="bg-acid text-void">
        <div className="mx-auto max-w-[1000px] px-6 py-16 text-center md:px-10">
          <h2 className="font-display text-3xl leading-tight md:text-5xl">NO HEAVY GEAR</h2>
          <h2 className="mt-2 font-display text-3xl leading-tight md:text-5xl">NO BOUNDARIES</h2>
          <h2 className="mt-2 font-display text-3xl leading-tight md:text-5xl">NO BOREDOM</h2>
        </div>
        <div className="mx-auto max-w-[1000px] px-6 pb-20 md:px-10">
          <div className="divide-y-2 divide-void border-y-2 border-void font-mono text-sm">
            {specRows.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col justify-between gap-1 py-4 sm:flex-row sm:items-center"
              >
                <span className="font-bold uppercase tracking-widest">{label}</span>
                <span className="text-void/70">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
