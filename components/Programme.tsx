import Reveal from "./Reveal";

const programme = [
  { time: "18 h 00", title: "Accueil des invités" },
  { time: "18 h 30", title: "Séance photos & vidéos" },
  { time: "18 h 50", title: "Ouverture du buffet & du bar" },
  { time: "19 h 45", title: "Présentation des événements & vente des tickets" },
  { time: "20 h 00", title: "Présentation de nos partenaires" },
  { time: "20 h 30", title: "Remise des cadeaux aux invités" },
  { time: "21 h 00", title: "Fin de la soirée" },
];

export default function Programme() {
  return (
    <section id="programme" className="relative overflow-hidden bg-surface py-28 lg:py-40">
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-gold/10 blur-[120px]" />

      <div className="relative mx-auto max-w-2xl px-6 lg:px-10">
        <div className="mb-14 flex flex-col items-center text-center">
          <div className="mb-6 flex items-baseline gap-4">
            <span className="numeral">IV</span>
            <span className="eyebrow-plain">Programme</span>
          </div>
          <Reveal>
            <h2 className="font-display text-4xl font-light text-fg sm:text-5xl md:text-6xl">
              Le déroulé de la soirée
            </h2>
          </Reveal>
        </div>

        <ol>
          {programme.map((item, i) => {
            const last = i === programme.length - 1;
            return (
              <Reveal
                as="li"
                key={item.time + item.title}
                delay={i * 0.06}
                className="flex gap-5 sm:gap-8"
              >
                <div className="w-16 shrink-0 pt-0.5 text-right font-display text-lg text-gold sm:w-20 sm:text-xl">
                  {item.time}
                </div>

                <div className="relative flex flex-col items-center">
                  <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-gold bg-surface" />
                  {!last && <span className="w-px flex-1 bg-fg/15" />}
                </div>

                <div className={last ? "pb-0" : "pb-10"}>
                  <h3 className="font-display text-xl leading-snug text-fg sm:text-2xl">
                    {item.title}
                  </h3>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
