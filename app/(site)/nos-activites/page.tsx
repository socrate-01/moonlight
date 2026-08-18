import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/Reveal";
import { ACTIVITIES, FAQ, PACKAGES, money } from "@/lib/site";

export const metadata = {
  title: "Nos activités · Moonlight Cocktail Bar",
  description:
    "Mariages, réceptions privées, événements d'entreprise et ateliers de dégustation. Nos forfaits et nos prestations.",
};

const VISUALS = [
  "/images/gallery/cocktail-05.jpg",
  "/images/gallery/cocktail-02.jpg",
  "/images/gallery/cocktail-01.jpg",
];

export default function ActivitesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nos prestations"
        title="Ce que nous"
        accent="savons faire"
        lead="Un bar complet, une équipe et une carte, installés là où vous célébrez. Le format s'ajuste, l'exigence reste la même."
      />

      {/* Prestations, en alternance gauche / droite */}
      <section className="px-6 pb-8 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-6">
          {ACTIVITIES.map((a, i) => (
            <Reveal key={a.key} delay={0.04 * i}>
              <article
                className={`rounded-2xl bg-surface/50 grid items-center gap-8 overflow-hidden p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 ${
                  i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                }`}
              >
                <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src={VISUALS[i % VISUALS.length]}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover transition-transform duration-[1.6s] hover:scale-105"
                  />
                </figure>
                <div>
                  <span className="font-sans text-[11px] tabular-nums tracking-[0.2em] text-gold/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="engraved mt-4 text-[21px] leading-tight text-fg sm:text-[26px]">
                    {a.title}
                  </h2>
                  <p className="mt-3 font-sans text-[12px] uppercase tracking-[0.2em] text-gold">
                    {a.lead}
                  </p>
                  <p className="mt-5 font-sans text-[14px] font-light leading-[2] text-muted">
                    {a.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Forfaits */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-gold">
              Nos forfaits
            </p>
            <h2 className="engraved mx-auto mt-6 max-w-2xl text-[24px] leading-tight text-fg sm:text-[32px]">
              Trois formules, un même soin
            </h2>
            <p className="mx-auto mt-6 max-w-xl font-sans text-[14px] font-light leading-[2] text-muted">
              Les montants indiqués sont des points de départ. Le devis final
              dépend du nombre d&apos;invités, de la durée et du lieu.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.key} delay={i * 0.07}>
                <article
                  className={`rounded-2xl bg-surface/50 relative flex h-full flex-col p-8 ${
                    p.featured ? "border-gold/50 lg:-translate-y-4" : ""
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 font-sans text-[9px] uppercase tracking-[0.2em] text-bg">
                      Le plus demandé
                    </span>
                  )}
                  <h3 className="engraved text-[20px] text-fg">{p.name}</h3>
                  <p className="mt-4 font-sans text-[13px] font-light text-muted">
                    {p.guests} · {p.duration}
                  </p>
                  <p className="mt-6 font-sans text-[13px] uppercase tracking-[0.18em] text-gold">
                    à partir de
                  </p>
                  <p className="engraved mt-1 text-[30px] text-fg">
                    {money(p.from)}
                  </p>

                  <ul className="mt-8 flex-1 space-y-3.5">
                    {p.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-3">
                        <span className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-gold" />
                        <span className="font-sans text-[13px] font-light leading-relaxed text-muted">
                          {inc}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/reservation"
                    className={`mt-9 ${p.featured ? "btn-luxe" : "btn-ghost"} w-full justify-center`}
                  >
                    Choisir {p.name}
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-28 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-gold">
              Questions fréquentes
            </p>
            <h2 className="engraved mt-6 text-[24px] leading-tight text-fg sm:text-[30px]">
              Ce qu&apos;on nous demande le plus
            </h2>
          </Reveal>

          <div className="mt-12 space-y-3">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.04}>
                <details className="rounded-2xl bg-surface/50 group p-6 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-6">
                    <span className="font-sans text-[14px] font-light text-fg">
                      {f.q}
                    </span>
                    <span className="relative h-3 w-3 shrink-0">
                      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-gold" />
                      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-gold transition-transform duration-500 group-open:rotate-90 group-open:opacity-0" />
                    </span>
                  </summary>
                  <p className="mt-5 font-sans text-[13px] font-light leading-[2] text-muted">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
