import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/Reveal";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "À propos · Moonlight Cocktail Bar",
  description:
    "La naissance de Moonlight Cocktail Bar et ce en quoi nous croyons : un bar à cocktails mobile qui se déplace là où vous célébrez.",
};

/* ⚠️ À CONFIRMER — le récit ci-dessous est volontairement écrit sans date,
   sans nom de fondateur et sans anecdote vérifiable, pour ne rien affirmer de
   faux sur un site public. Remplacez-le par votre véritable histoire : l'année
   de création, qui est derrière le projet, et le déclic de départ. */

const BELIEFS = [
  {
    n: "01",
    title: "Le verre n'est pas un détail",
    body:
      "Un bon cocktail change la tenue d'une soirée. Il donne un rythme, ouvre les conversations, marque le moment où la fête commence vraiment. Nous le traitons avec le sérieux qu'on accorde ailleurs à un plat.",
  },
  {
    n: "02",
    title: "Le bar vient à vous",
    body:
      "Une salle, un jardin, un loft, une cour arrière. Nous arrivons avec tout : le comptoir, la verrerie, la glace, les agrumes coupés le matin même. Vous n'avez ni à installer, ni à ranger.",
  },
  {
    n: "03",
    title: "Personne ne reste sur le côté",
    body:
      "Celui qui ne boit pas mérite mieux qu'un jus tiède. Chaque carte comprend des créations sans alcool travaillées avec la même exigence, servies dans le même verre.",
  },
  {
    n: "04",
    title: "Le service se remarque par son absence",
    body:
      "Le meilleur compliment qu'on nous fasse, c'est qu'on ne nous a pas vus travailler. Rapides, discrets, jamais dans le passage. La soirée vous appartient.",
  },
];

export default function AProposPage() {
  return (
    <>
      <PageHeader
        eyebrow="Notre maison"
        title="Une nuit,"
        accent="une idée fixe"
        lead="Moonlight est né d'une conviction simple : la qualité d'une fête tient souvent à ce qu'on a dans la main."
      />

      {/* Récit */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="order-2 lg:order-1">
            <Reveal>
              <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-gold">
                L&apos;origine
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="engraved mt-6 text-[24px] leading-tight text-fg sm:text-[30px]">
                Tout a commencé par une frustration
              </h2>
            </Reveal>

            <div className="mt-8 space-y-6 font-sans text-[15px] font-light leading-[2] text-muted">
              <Reveal delay={0.12}>
                <p>
                  Trop de belles réceptions se terminaient sur la même note : une
                  table encombrée de bouteilles, un invité qui improvise derrière
                  le comptoir, et des verres qu&apos;on abandonne à moitié pleins.
                  Le repas avait été pensé pendant des mois. Le bar, lui,
                  n&apos;avait été pensé par personne.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <p>
                  Moonlight est né de cet écart. L&apos;idée n&apos;était pas
                  d&apos;ouvrir un lieu de plus, mais de faire l&apos;inverse : que
                  le bar se déplace. Qu&apos;il arrive monté, approvisionné, tenu
                  par des gens dont c&apos;est le métier, et qu&apos;il reparte
                  sans laisser d&apos;autre trace que le souvenir.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <p>
                  Le nom s&apos;est imposé de lui-même. Les plus belles heures
                  d&apos;une fête arrivent après la tombée du jour, quand la
                  lumière baisse et que les gens se parlent enfin. Un croissant de
                  lune posé dans un verre : c&apos;est devenu notre signature avant
                  même d&apos;être notre logo.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <p className="text-fg">
                  Aujourd&apos;hui, nous montons notre bar chez vous, pour votre
                  mariage, votre baptême, vos retrouvailles. Le décor change à
                  chaque fois. L&apos;exigence, jamais.
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="rounded-2xl bg-surface/50 overflow-hidden rounded-3xl p-1.5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem]">
                <Image
                  src="/images/gallery/cocktail-03.jpg"
                  alt="Un cocktail signature Moonlight"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover transition-transform duration-[1.6s] hover:scale-105"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Convictions */}
      <section className="relative overflow-hidden px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-gold">
              Ce en quoi nous croyons
            </p>
            <h2 className="engraved mx-auto mt-6 max-w-2xl text-[24px] leading-tight text-fg sm:text-[32px]">
              Quatre principes qui ne se négocient pas
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {BELIEFS.map((b, i) => (
              <Reveal key={b.n} delay={i * 0.06}>
                <article className="rounded-2xl bg-surface/50 h-full p-8">
                  <span className="font-sans text-[11px] tabular-nums tracking-[0.2em] text-gold/70">
                    {b.n}
                  </span>
                  <h3 className="engraved mt-5 text-[18px] leading-snug text-fg">
                    {b.title}
                  </h3>
                  <p className="mt-4 font-sans text-[14px] font-light leading-[1.95] text-muted">
                    {b.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Appel */}
      <section className="px-6 pb-28 lg:px-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="engraved text-[24px] leading-tight text-fg sm:text-[30px]">
            Parlons de votre soirée
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-sans text-[15px] font-light leading-[2] text-muted">
            Dites-nous la date, le lieu et le nombre d&apos;invités. Nous revenons
            vers vous sous 24 heures avec une proposition.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/reservation" className="btn-luxe">
              Demander une date
            </Link>
            <a href={`mailto:${SITE.email}`} className="btn-ghost">
              Nous écrire
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
