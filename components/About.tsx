import Image from "next/image";
import Reveal from "./Reveal";

const pillars = [
  { t: "Mixologie d'auteur", d: "Des cocktails signature composés comme des parfums : précis, rares, inoubliables." },
  { t: "Service d'orfèvre", d: "L'art de recevoir dans sa forme la plus délicate, du premier regard au dernier verre." },
  { t: "Adresse confidentielle", d: "Un lieu pensé comme un salon privé, où l'on entre par invitation." },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-bg py-28 lg:py-40">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 flex items-baseline justify-center gap-4">
          <span className="numeral">I</span>
          <span className="eyebrow-plain">La Maison</span>
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {/* Arched image */}
          <Reveal className="relative">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-t-[999px] border border-gold/40 lg:block" />
              <div className="group relative aspect-[3/4] overflow-hidden rounded-t-[999px] border border-fg/10">
                <Image
                  src="/images/bar-day.png"
                  alt="Le bar Moonlight, fleuri et raffiné"
                  fill
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/40 to-transparent" />
              </div>
              <div className="mt-5 text-center font-sans text-[10px] uppercase tracking-luxe text-muted">
                Moonlight · Est. 2026
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <div>
            <Reveal>
              <h2 className="font-display text-4xl font-light leading-[1.1] text-fg sm:text-5xl md:text-6xl">
                L'élégance d'un
                <span className="italic text-gradient"> clair de lune</span>,
                servie dans un verre.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rule my-9 max-w-[9rem]" />
            </Reveal>
            <Reveal delay={0.12}>
              <p className="drop-cap max-w-xl font-sans text-[15px] font-light leading-[1.9] text-muted">
                Moonlight est né d'une conviction : une soirée peut être un art. Ici, la
                lune se glisse dans le verre, les agrumes rencontrent l'or, et chaque
                cocktail se raconte comme une confidence. Nous avons imaginé une maison
                feutrée, où le temps ralentit et où l'élégance se vit sans effort. Ce
                soir d'ouverture, nous vous convions à en écrire la toute première page.
              </p>
            </Reveal>

            <div className="mt-14 space-y-10">
              {pillars.map((p, i) => (
                <Reveal key={p.t} delay={0.16 + i * 0.08}>
                  <div>
                    <h3 className="font-display text-2xl font-normal leading-snug text-fg">
                      {p.t}
                    </h3>
                    <p className="mt-2 max-w-md font-sans text-[14px] font-light leading-relaxed text-muted">
                      {p.d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
