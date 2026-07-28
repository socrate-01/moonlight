import Reveal from "./Reveal";
import GalleryTile from "./GalleryTile";
import { DRESSCODE } from "./images";

const palette = [
  { name: "Pêche", hex: "#f6b884" },
  { name: "Corail", hex: "#ef6f53" },
  { name: "Terracotta", hex: "#e0632a" },
  { name: "Rose crépuscule", hex: "#cf5f83" },
  { name: "Prune", hex: "#6d4a92" },
];

export default function DressCode() {
  return (
    <section id="theme" className="relative overflow-hidden bg-surface py-28 lg:py-40">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-terracotta/15 blur-[130px]" />
      <div className="pointer-events-none absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-indigo-plum/15 blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex items-baseline justify-center gap-4">
            <span className="numeral">II</span>
            <span className="eyebrow-plain">Thème de la soirée</span>
          </div>

          <Reveal>
            <h2 className="font-display text-5xl font-light leading-tight text-fg sm:text-6xl md:text-7xl">
              Sunset <span className="italic text-sunset">Color</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-3 font-sans text-[11px] uppercase tracking-luxe text-gold">
              S'habiller chic · esprit croisière &amp; casual
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-7 max-w-2xl font-sans text-[15px] font-light leading-[1.9] text-muted">
              Pour ce premier soir, parez-vous des teintes du coucher de soleil :
              corail, abricot, terracotta, prune. Une élégance solaire et
              décontractée, entre esprit croisière et chic casual.
            </p>
          </Reveal>

          {/* Sunset palette */}
          <Reveal delay={0.16}>
            <div className="mx-auto mt-11 flex max-w-2xl flex-wrap items-center justify-center gap-5 sm:gap-6">
              {palette.map((c) => (
                <div key={c.name} className="group flex flex-col items-center gap-2.5">
                  <span
                    className="h-14 w-14 rounded-full border border-fg/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-1.5 sm:h-16 sm:w-16"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-sans text-[10px] uppercase tracking-wide2 text-muted">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Chic ambiance — cruise & casual */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-start lg:mt-20 lg:gap-8">
          <GalleryTile src={DRESSCODE[0]} index={0} ratio="aspect-[3/4]" className="sm:mt-10" />
          <GalleryTile src={DRESSCODE[1]} index={1} ratio="aspect-[3/4]" />
          <GalleryTile src={DRESSCODE[2]} index={2} ratio="aspect-[3/4]" className="sm:mt-10" />
        </div>
      </div>
    </section>
  );
}
