export default function Video() {
  return (
    <section className="bg-void">
      <div className="mx-auto max-w-[1400px] px-6 pb-24 pt-16 md:px-10 md:pt-20">
        <p className="font-mono text-xs uppercase tracking-widest text-acid">TACT — Film</p>
        <h1 className="mt-4 font-display text-4xl leading-[0.95] text-paper md:text-6xl">
          WEAR THE FREQUENCY
        </h1>

        <video
          controls
          playsInline
          className="mt-10 aspect-video w-full rounded-[28px] bg-black"
        >
          <source src="/videos/tact-film.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  )
}
