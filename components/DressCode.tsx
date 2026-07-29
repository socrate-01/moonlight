import Reveal from "./Reveal";

const palette = [
  { name: "Pêche", hex: "#f6b884" },
  { name: "Corail", hex: "#ef6f53" },
  { name: "Terracotta", hex: "#e0632a" },
  { name: "Rose crépuscule", hex: "#cf5f83" },
  { name: "Prune", hex: "#6d4a92" },
];

const cards = [
  {
    k: "Chic",
    t: "Soigné & raffiné",
    d: "Une allure élégante, jusque dans les moindres détails.",
  },
  {
    k: "Décontracté",
    t: "À l'aise, avec style",
    d: "L'élégance sans la rigidité : un esprit casual et détendu.",
  },
  {
    k: "Sunset",
    t: "Aux couleurs du soir",
    d: "Osez les teintes du coucher de soleil : corail, abricot, terracotta, prune.",
  },
];

export default function DressCode() {
  return (
    <section id="theme" className="relative overflow-hidden bg-surface py-28 lg:py-40">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-terracotta/15 blur-[130px]" />
      <div className="pointer-events-none absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-indigo-plum/15 blur-[130px]" />

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
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
            Un style chic, casual, décontracté & élégant
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-7 max-w-2xl font-sans text-[15px] font-light leading-[1.9] text-muted">
            Pour ce premier soir, adoptez une tenue chic et décontractée, dans les
            teintes du coucher de soleil. Élégance et légèreté, sans se prendre au
            sérieux.
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

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.k} delay={0.2 + i * 0.08}>
              <div className="group h-full rounded-2xl border border-fg/10 bg-surface2/60 p-8 text-left backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.6)]">
                <span className="font-sans text-[10px] uppercase tracking-luxe text-gold">
                  {c.k}
                </span>
                <h3 className="mt-3 font-display text-2xl text-fg">{c.t}</h3>
                <div className="my-4 h-px w-8 bg-fg/20 transition-all duration-500 group-hover:w-14 group-hover:bg-gold" />
                <p className="font-sans text-[13px] font-light leading-relaxed text-muted">
                  {c.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
