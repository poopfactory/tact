import { useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Marquee from '../components/Marquee'
import { HeroCuffModel } from '../components/CuffModel'
import { InfiniteSlider } from '@/components/ui/infinite-slider-horizontal'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { ScrollRevealWords } from '../components/ScrollRevealWords'
import { SITE_SLOGAN } from '../lib/brand'

// Six campaign shots, in display order — the hover value/description cycle
// through the three core values twice so every card still gets one.
const coreValues = [
  { value: 'Zero Barrier', description: '듣는 것에서 버무리는 것으로, 누구나 손쉽게' },
  { value: 'Iconic Piece', description: '음악을 듣는 방식을 넘어서는 페스티벌한 리듬' },
  { value: 'Playful', description: '관객에서 리듬을 주도하는 DJ로' },
]
const lookbookPhotos = [
  { src: '/lookbook/lookbook-1.png', alt: 'TACT cuff, low-angle streetwear campaign shot' },
  { src: '/lookbook/lookbook-2.png', alt: 'TACT cuff, Shibuya crossing campaign shot' },
  { src: '/lookbook/lookbook-3.png', alt: 'TACT cuff, dark editorial portrait with graffiti backdrop' },
  { src: '/lookbook/lookbook-4.png', alt: 'TACT cuff, studio portrait against blue backdrop' },
  { src: '/lookbook/lookbook-5.png', alt: 'TACT cuff, outdoor portrait against corrugated metal' },
  { src: '/lookbook/lookbook-6.png', alt: 'TACT cuff, pink-backdrop beauty portrait' },
].map((photo, i) => ({ ...photo, ...coreValues[i % coreValues.length] }))

// Hardware/accessory highlights for the Fit section — an asymmetric bento
// grid (tall card on the right spans both left rows, wide card closes the
// bottom) rather than the old zigzag. Images are temporary stand-ins from
// the existing fit/ shoot until dedicated hardware photography exists.
const accessoryFeatures = [
  {
    src: '/fit/fit-1.jpg',
    alt: 'TACT cuff detail, haptic interface placeholder shot',
    title: 'Haptic Sound Interface',
    bodyLines: ['손끝에 전해지는 미세한 진동 반응을 통해', '음악의 속도와 이펙트를 직관적으로 제어할 수 있습니다.'],
  },
  {
    src: '/fit/fit-2.png',
    alt: 'TACT cuff detail, charging station placeholder shot',
    title: 'Custom Charging Station',
    bodyLines: [
      '거치하는 순간 하나의 인테리어 피스가 되는 TACT 전용 충전 스테이션.',
      '마그네틱 도킹 시스템으로 가볍게 올려두는 것만으로 빠르고 안정적인 충전을 지원합니다.',
    ],
    tall: true,
  },
  {
    src: '/fit/fit-3.jpg',
    alt: 'TACT cuff detail, chrome finish placeholder shot',
    title: 'Metallic Chrome Finish',
    bodyLines: ['스크래치에 강한 내구성과 은은한 광택으로', '웨어러블 쥬얼리 특유의 감각적인 룩을 완성합니다.'],
  },
  {
    src: '/fit/fit-4.png',
    alt: 'TACT cuff detail, organic fluid design placeholder shot',
    title: 'Organic Fluid Design',
    bodyLines: [
      '인체공학적으로 재해석한 매끈한 곡선 라인. 금속이 흐르는 듯한 유기적 형태는 착용감을 최우선으로 고려하면서도,',
      '손목 위에서 독보적인 오브제로서의 존재감을 드러냅니다.',
    ],
    wide: true,
  },
]

function LookbookVisual({
  src,
  alt,
  value,
  description,
}: {
  src: string
  alt: string
  value: string
  description: string
}) {
  return (
    // `group` scopes the hover state to just this card inside the infinite
    // slider's flowing row; `shrink-0` keeps it from being squeezed by the
    // flex row, and the slider itself keeps drifting regardless of hover.
    <div className="group relative isolate aspect-[4/5] w-[280px] shrink-0 overflow-hidden rounded-[28px] bg-paper-2 sm:w-[340px] md:w-[400px]">
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:blur-md"
      />
      {/* Bottom-left caption over a gradient scrim, not a solid bar — the
          value sits in acid green with a small Korean line underneath,
          both fading in on hover instead of the block sliding up. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/90 via-void/50 to-transparent px-5 pb-5 pt-16 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100">
        <span className="block font-slogan text-xl font-medium leading-tight text-acid md:text-2xl">{value}</span>
        <p className="mt-1 font-kr text-[11px] leading-relaxed text-paper/85 md:mt-1.5 md:text-xs">
          {description}
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  // Cursor-follow grid spotlight in the hero — a ref + direct style writes
  // instead of React state, since mousemove fires far too often to push
  // through a render each time. `hovering` is the one bit that DOES need a
  // render (it only flips twice per hover session), so opacity is the only
  // part driven by state; position is driven by CSS custom properties set
  // straight on the node.
  const heroGridRef = useRef<HTMLDivElement>(null)
  const [heroGridHover, setHeroGridHover] = useState(false)

  const handleHeroGridMove = (e: ReactMouseEvent<HTMLElement>) => {
    const el = heroGridRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    <>
      {/* HERO — static key visual, no scroll-driven reveal anymore. Grid
          stays as a cursor-follow spotlight; the center is left empty for
          a real 3D product render once a model exists. */}
      <section
        className="relative h-screen w-full overflow-hidden border-b-4 border-acid bg-paper"
        onMouseMove={handleHeroGridMove}
        onMouseEnter={() => setHeroGridHover(true)}
        onMouseLeave={() => setHeroGridHover(false)}
      >
        <div
          ref={heroGridRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out [background-image:linear-gradient(rgba(10,10,11,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,11,0.22)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(220px_circle_at_var(--mx,50%)_var(--my,50%),black_0%,transparent_75%)] [-webkit-mask-image:radial-gradient(220px_circle_at_var(--mx,50%)_var(--my,50%),black_0%,transparent_75%)] ${
            heroGridHover ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Oversized brand wordmark key visual — reserved space in front of
            it for a real 3D product render once a model exists. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
        >
          <img
            src="/brand/logo_neon.png"
            alt=""
            className="w-[115vw] max-w-none shrink-0"
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden'
            }}
          />
        </div>

        {/* Floating 3D cuff — sits above the wordmark, tilts gently toward
            the cursor (see CuffModel's followCursor). */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <HeroCuffModel className="h-[70vmin] w-[70vmin] max-w-[560px]" />
        </div>
      </section>

      {/* NEON STRIP — single flowing line, no star glyphs, no framing
          border (see Marquee.tsx). */}
      <Marquee items={['TACT · STYLE YOUR SOUND · EVERYDAY LIFE NON-STOP FESTIVAL']} />

      {/* SLOGAN + LOOKBOOK — the brand line, then three large moving shots.
          No copy on the cards themselves; hovering one blurs/scales the
          image and slides the matching core value up from the bottom. */}
      <section id="lookbook" className="scroll-mt-28 bg-paper">
        <div className="mx-auto max-w-[900px] px-6 pt-20 pb-20 text-center md:px-10 md:pt-28 md:pb-24">
          <p className="font-sans text-xs font-medium uppercase tracking-widest text-black/50">
            About Us
          </p>
          {/* font-slogan (Syne) is a one-off here — the reference headline
              wants a distinct geometric display face, not the site's usual
              Archivo Black. */}
          <h2 className="mt-4 font-slogan text-4xl font-bold leading-[0.95] md:text-6xl">
            <ScrollRevealWords text="Style Your Sound" />
          </h2>
          <p className="mt-3 font-sans text-lg text-bone md:text-xl">
            <ScrollRevealWords text={SITE_SLOGAN} />
          </p>
          {/* Two explicit lines rather than one long string left to wrap on
              its own — max-w-2xl gives each line room to actually hold its
              half instead of wrapping again into a third line. */}
          <p className="mx-auto mt-10 max-w-2xl font-kr text-sm leading-relaxed text-concrete md:mt-12 md:text-base">
            <span className="block">
              <ScrollRevealWords text="지루한 일상을 멈추지 않는 페스티벌로 만들어줄 나만의 오디오 피스. 단순한 청취를 넘어," />
            </span>
            <span className="block">
              <ScrollRevealWords text="당신의 느낌대로 비트를 믹싱하고 전환하며 매일을 멈추지 않는 페스티벌로 스타일링하세요" />
            </span>
          </p>
        </div>

        {/* `[transform:translateZ(0)]` forces this masked wrapper onto its
            own stable compositing layer — without it, Chromium/WebKit can
            fail to repaint the region under a `mask-image` when a masked
            descendant's own compositing layer changes (exactly what
            `group-hover:blur-md`/`scale-110` on each card does), which
            reads as the cards after the hovered one "disappearing" until
            something else forces a repaint. */}
        <InfiniteSlider
          gap={28}
          duration={30}
          className="pb-20 [transform:translateZ(0)] [will-change:transform] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        >
          {lookbookPhotos.map((photo) => (
            <LookbookVisual
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              value={photo.value}
              description={photo.description}
            />
          ))}
        </InfiniteSlider>
      </section>

      {/* SHOP — product imagery leading straight to the buy CTA. Only the
          top of this block gets section padding — the full-bleed banner
          at the bottom is meant to sit flush against the footer, so
          nothing here adds bottom spacing after it. */}
      <section id="fit" className="scroll-mt-28 bg-paper">
        <div className="mx-auto max-w-[1400px] px-6 pt-20 md:px-10">
          {/* Gesture-control cross-promo — ties the cuff back to the Studio
              demo (hand-tracking DJ mixer). Full-bleed edge to edge (breaks
              out of the section's own max-w/px container on purpose, same
              trick as the closeup banner further down) — no rounding/box
              here, it's meant to read as a banner, not a card. The copy
              sits directly over the empty white space on the photo's right
              side rather than in its own column. */}
          <div className="relative left-1/2 mb-16 aspect-video w-screen -translate-x-1/2 overflow-hidden md:mb-24">
            <img
              src="/fit/fit-gesture.png"
              alt="Hand wearing the TACT cuff, mid gesture"
              className="absolute inset-0 h-full w-full object-cover object-left"
            />
            <div className="absolute inset-y-0 right-0 flex w-[55%] flex-col justify-center px-6 md:w-[42%] md:px-12 lg:pr-24">
              <p className="font-sans text-xs font-medium uppercase tracking-widest text-black/50">
                Gesture Control Technology
              </p>
              <h3 className="mt-3 font-slogan text-2xl font-medium leading-[1.05] md:text-5xl">
                <ScrollRevealWords text="Just a Touch of Fingers" />
              </h3>
              <p className="mt-7 font-kr text-xs leading-relaxed text-concrete md:mt-9 md:text-base">
                <span className="block">
                  <ScrollRevealWords text="화면을 보지 않고도, 움직임만으로." />
                </span>
                <span className="block">
                  <ScrollRevealWords text="손끝의 미세한 제스처를 감지하는 정밀 센서가 당신의 동작을 음악 이벤트로 전환합니다" />
                </span>
              </p>
              <ShimmerButton
                onClick={() => navigate('/studio')}
                borderRadius="9999px"
                shimmerSize="0.15em"
                shimmerDuration="1.3s"
                shimmerSpread="150deg"
                className="mt-6 self-start px-6 py-3 text-xs md:px-8 md:text-sm"
              >
                Try In Studio
              </ShimmerButton>
            </div>
          </div>

          <div className="mx-auto max-w-[900px] text-center">
            <p className="font-sans text-xs font-medium uppercase tracking-widest text-black/50">Hardware Details</p>
            <h2 className="mt-4 font-slogan text-4xl font-medium leading-[0.95] md:text-6xl">
              <ScrollRevealWords text="Complete Your Outfit" />
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-kr text-sm leading-relaxed text-concrete md:text-base">
              <ScrollRevealWords text="단순한 청취를 넘어 음악의 리듬과 이펙트를 직접 다루는 TACT만의 차세대 오디오 컨트롤" />
            </p>
          </div>

          {/* Asymmetric bento grid — the charging-station card spans both
              left-column rows (`row-span-2`), the fluid-design card closes
              it out full-width. Each card is a real photo with a bottom
              gradient scrim (same pattern as LookbookVisual) rather than
              the plain gray placeholder in the reference, since a busy
              photo needs the scrim for the text to stay legible. */}
          <div className="mx-auto mt-12 grid max-w-[1000px] grid-cols-2 gap-4 md:mt-16 md:gap-6">
            {accessoryFeatures.map((feature) => (
              <div
                key={feature.src}
                className={`group relative isolate overflow-hidden rounded-[28px] bg-paper-2 ${
                  feature.tall ? 'row-span-2' : 'h-[220px] md:h-[260px]'
                } ${feature.wide ? 'col-span-2 h-[220px] md:h-[280px]' : ''}`}
              >
                <img
                  src={feature.src}
                  alt={feature.alt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-void/85 via-void/25 to-transparent p-5 md:p-7 ${
                    feature.wide ? 'items-end text-right' : 'items-start text-left'
                  }`}
                >
                  <p className="font-slogan text-lg font-medium leading-[1.1] text-paper md:text-xl">
                    {feature.title}
                  </p>
                  <p className="mt-2 max-w-[85%] font-kr text-[10px] leading-relaxed text-paper/85 md:text-[11px]">
                    {feature.bodyLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Closing CTA — full-bleed product photo fading into the page
              background at the bottom, with the headline + two stacked
              buttons sitting in that fade (same full-bleed break-out trick
              as the other banners in this section). */}
          <div className="relative left-1/2 mt-4 w-screen -translate-x-1/2 overflow-hidden">
            <img
              src="/fit/fit-cta.png"
              alt="TACT cuff, polished steel product shot"
              className="aspect-[16/9] w-full object-cover md:aspect-[21/9]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-paper via-paper/80 to-transparent" />
            <div className="relative z-10 -mt-24 flex flex-col items-center gap-5 pb-16 text-center md:-mt-32 md:pb-24">
              <h3 className="font-display text-2xl md:text-4xl">Ready to Style Your Sound?</h3>
              <div className="flex flex-col items-center gap-3">
                <ShimmerButton
                  onClick={() => navigate('/shop')}
                  borderRadius="9999px"
                  shimmerSize="0.15em"
                  shimmerDuration="1.3s"
                  shimmerSpread="150deg"
                  className="w-48 px-8 py-3"
                >
                  Shop Now
                </ShimmerButton>
                <ShimmerButton
                  onClick={() => navigate('/video')}
                  borderRadius="9999px"
                  shimmerSize="0.15em"
                  shimmerDuration="1.3s"
                  shimmerSpread="150deg"
                  className="w-48 px-8 py-3"
                >
                  Go To Video
                </ShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
