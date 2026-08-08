import { useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import Marquee from '../components/Marquee'
import { ScrollRevealWords } from '../components/ScrollRevealWords'
import { SITE_SLOGAN } from '../lib/brand'

// Same three core values as the Home lookbook cards (see coreValues in
// Home.tsx) — restated here as their own section rather than imported,
// since this page pairs them with a different (blob-card) presentation.
const beliefs = [
  {
    title: 'Zero Barrier',
    bodyLines: ['손가락을 집고 튕기는 직관적인 제스처', '하나만 누구나 즉시 음악을 조작합니다.'],
  },
  {
    title: 'Iconic Piece',
    bodyLines: ['단순한 기기가 아닌 당신의 취향을', '완성하는 주얼리로서 빛납니다.'],
  },
  {
    title: 'Playful',
    bodyLines: ['수동적인 청취를 넘어, 음악을 직접 다루고', '노는 즐거움을 선사합니다.'],
  },
]

export default function BrandStory() {
  // Same cursor-follow grid spotlight as the Home hero (see Home.tsx) — a
  // ref + direct style writes instead of state, since mousemove fires too
  // often to push through a render each time.
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
      {/* HERO — acid-green gradient field with the brush-stroke wordmark,
          same key-visual language as the Home hero's neon logo (oversized
          wordmark + cursor-follow grid spotlight) but in the brand's
          white-on-acid mark instead. */}
      <section
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, var(--color-acid) 0%, var(--color-acid) 62%, var(--color-paper) 100%)' }}
        onMouseMove={handleHeroGridMove}
        onMouseEnter={() => setHeroGridHover(true)}
        onMouseLeave={() => setHeroGridHover(false)}
      >
        <div
          ref={heroGridRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out [background-image:linear-gradient(rgba(10,10,11,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,11,0.2)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(220px_circle_at_var(--mx,50%)_var(--my,50%),black_0%,transparent_75%)] [-webkit-mask-image:radial-gradient(220px_circle_at_var(--mx,50%)_var(--my,50%),black_0%,transparent_75%)] ${
            heroGridHover ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <img
          src="/brand/logo_white.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none relative w-[115vw] max-w-none select-none"
        />
      </section>

      {/* ABOUT — headline + name origin + focus statement, all centered,
          same narrow reading column throughout. */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[900px] px-6 pb-24 pt-20 text-center md:px-10 md:pt-28">
          <p className="font-mono text-xs uppercase tracking-widest text-acid">About Us</p>
          <h1 className="mt-4 font-slogan text-4xl font-bold leading-[1.05] md:text-6xl">
            <ScrollRevealWords text="Sound is Fashion" />
            <br />
            <ScrollRevealWords text="Motion is Rhythm" />
          </h1>

          <h2 className="mt-24 font-slogan text-lg font-bold uppercase tracking-wide md:mt-32 md:text-xl">
            Name Origin
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-kr text-sm leading-relaxed text-concrete md:text-base">
            <span className="block">
              <ScrollRevealWords text="TACT는 Tactile(촉각)과 Takt(독일어로 '지휘봉' 또는 '박자')의 결합에서 탄생했습니다." />
            </span>
            <span className="block">
              <ScrollRevealWords text="손짓 하나로 나만의 리듬과 비트를 지휘(Takt)하는 브랜드." />
            </span>
            <span className="block">
              <ScrollRevealWords text="TACT는 당신의 손목 위에서 사운드와 몸의 감각을 직관적으로 연결합니다." />
            </span>
          </p>

          <div className="mx-auto mt-16 h-16 w-px bg-steel-2 md:mt-20" />

          <h2 className="mt-16 font-slogan text-lg font-bold uppercase tracking-wide md:mt-20 md:text-xl">
            Focus On( &nbsp; )
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-kr text-sm leading-relaxed text-concrete md:text-base">
            <span className="block">
              <ScrollRevealWords text="락페스티벌의 전율과 온몸으로 느끼는 리듬의 손맛." />
            </span>
            <span className="block">
              <ScrollRevealWords text="왜 이 엄청난 현장감은 페스티벌에서만 느껴야 할까요?" />
            </span>
            <span className="block">
              <ScrollRevealWords text="기존 DJ 장비는 비싸고 무거우며, 스마트폰 스피커는 손끝의 몰입감을 주지 못합니다." />
            </span>
          </p>
          <p className="mx-auto mt-6 max-w-2xl font-kr text-sm leading-relaxed text-concrete md:text-base">
            <span className="block">
              <ScrollRevealWords text="TACT는 '언제 어디서든 간편함'과 '착장을 완성하는 패션'에 집중했습니다." />
            </span>
            <span className="block">
              <ScrollRevealWords text="방구석, 캠핑장, 파티장 어디든—손가락을 튕기는 바로 그곳이 당신의 무대가 됩니다." />
            </span>
          </p>

          <img
            src="/brand/product_1.png"
            alt="TACT cuff, side profile"
            className="mx-auto mt-16 w-full max-w-[480px] md:mt-20"
          />
        </div>
      </section>

      <Marquee items={['TACT · STYLE YOUR SOUND · EVERYDAY LIFE NON-STOP FESTIVAL']} />

      {/* OUR BELIEF — same three core values as the Home lookbook cards,
          restated here as blob-shaped cards. */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[900px] px-6 pt-20 text-center md:px-10 md:pt-28">
          <h2 className="font-slogan text-2xl font-bold md:text-4xl">Our Belief</h2>
          <p className="mx-auto mt-5 max-w-2xl font-kr text-sm leading-relaxed text-concrete md:text-base">
            <span className="block">
              TACT는 음악을 그저 '듣는 사람'에 머물던 당신을, 분위기를 주도하는 '플레이어'로 바꿀 수 있다고
            </span>
            <span className="block">믿습니다. 이 신념을 바탕으로 3가지 핵심 가치를 지켜나갑니다.</span>
          </p>
        </div>

        <div className="mx-auto grid max-w-[1100px] gap-10 px-6 pb-24 pt-16 sm:grid-cols-3 md:px-10 md:pb-32 md:pt-20">
          {beliefs.map((b) => (
            <div
              key={b.title}
              className="blob-card mx-auto flex aspect-square w-[240px] flex-col items-center justify-center bg-paper-2 px-6 text-center md:w-[270px] md:px-8"
            >
              <span className="font-display text-lg md:text-xl">{b.title}</span>
              <p className="mt-3 font-kr text-[10px] leading-relaxed text-concrete md:text-xs">
                {b.bodyLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING SLOGAN — full-bleed acid band, script wordmark treatment. */}
      <section className="bg-acid">
        <div className="mx-auto max-w-[900px] px-6 py-20 text-center md:px-10 md:py-28">
          <p className="font-slogan text-3xl font-bold text-paper md:text-5xl">{SITE_SLOGAN}</p>
        </div>
      </section>
    </>
  )
}
