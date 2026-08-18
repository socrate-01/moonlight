import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Hero from "@/components/site/Hero";
import Newsletter from "@/components/site/Newsletter";
import GlassDetail from "@/components/site/GlassDetail";
import Social from "@/components/site/Social";
import { GALLERY } from "@/components/images";
import { ACTIVITIES, COCKTAILS } from "@/lib/site";

export const metadata = {
  title: "Moonlight Cocktail Bar · Bar à cocktails mobile à Montréal",
  description:
    "Nous apportons le bar, la carte et l'équipe là où vous célébrez. Mariages, réceptions privées et événements d'entreprise à Montréal.",
};

/* Visuels associés aux prestations : même trame photographique que la
   bannière, pour que la page ne change pas de langage en cours de route. */
const ACTIVITY_SHOTS = [
  "/images/gallery/cocktail-05.jpg",
  "/images/gallery/cocktail-02.jpg",
  "/images/gallery/cocktail-08.jpg",
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Raccord : la photo se dissout vers le fond du thème.
          Il est isolé du contenu à dessein : en l'étendant sous le texte, le
          fond restait noir en thème clair alors que le texte, lui, virait au
          sombre. Il devenait illisible. */}
      <div
        aria-hidden
        className="h-48 bg-gradient-to-b from-black via-band to-bg lg:h-64"
      />

      {/* ---------------- Manifeste ----------------
          Le verre est détouré et posé au centre, sans cadre ni rectangle : il
          se fond dans la page au lieu d'y être collé. Le texte l'encadre. */}
      <section id="suite" className="bg-bg px-6 pb-20 pt-4 lg:px-10 lg:pb-24 lg:pt-8">
        <Reveal className="text-center">
          <h2 className="engraved text-[24px] leading-tight text-fg sm:text-[32px]">
            Notre maison
          </h2>
        </Reveal>

        <div className="mx-auto mt-8 grid max-w-6xl lg:mt-10 items-center gap-y-14 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-12">
          <Reveal className="order-2 lg:order-1 lg:text-right">
            <p className="engraved text-[17px] font-normal leading-[1.5] tracking-[0.1em] text-gold sm:text-[21px]">
              Un bon cocktail change
              <br />
              la tenue d&apos;une soirée
            </p>
          </Reveal>

          <Reveal delay={0.12} className="order-1 lg:order-2">
            <figure className="relative mx-auto w-[17rem] sm:w-[21rem] lg:w-[24rem]">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgb(var(--gold) / 0.16), transparent 62%)",
                }}
              />
              <Image
                src="/images/maison-verre.webp"
                alt="Un cocktail signature Moonlight"
                width={847}
                height={749}
                sizes="(max-width: 1024px) 70vw, 24rem"
                className="float-slow relative h-auto w-full"
              />
            </figure>
          </Reveal>

          <Reveal delay={0.2} className="order-3">
            <p className="font-sans text-[15px] font-light leading-[2.1] text-muted">
              Le repas d&apos;une réception se prépare pendant des mois. Le bar,
              lui, n&apos;est presque jamais pensé. Moonlight est né de cet
              écart, et de l&apos;idée que le comptoir mérite le même soin que
              l&apos;assiette.
            </p>
            <Link
              href="/a-propos"
              className="group mt-9 inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-gold transition-opacity duration-500 hover:opacity-70"
            >
              Lire notre histoire
              <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Prestations ---------------- */}
      <section className="px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="engraved text-[24px] leading-tight text-fg sm:text-[32px]">
              Nos prestations
            </h2>
            <p className="engraved mt-3.5 text-[15px] leading-tight tracking-[0.16em] text-gold sm:text-[19px]">
              Pour chaque occasion
            </p>
          </Reveal>

          {/* Photo puis texte, sans filet ni numéro : la légende se pose
              simplement sous l'image. */}
          <div className="mt-12 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVITIES.map((a, i) => (
              <Reveal key={a.key} delay={i * 0.08}>
                <Link href="/nos-activites" className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                    <Image
                      src={ACTIVITY_SHOTS[i % ACTIVITY_SHOTS.length]}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-[1.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>

                  <h3 className="engraved mt-7 text-[16px] leading-snug text-fg transition-colors duration-500 group-hover:text-gold">
                    {a.title}
                  </h3>
                  <p className="mt-2.5 font-sans text-[13px] font-light leading-[1.85] text-muted">
                    {a.lead}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="mt-12 text-center">
            <Link
              href="/nos-activites"
              className="group inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-muted transition-colors duration-500 hover:text-gold"
            >
              Toutes nos prestations
              <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Cocktails ---------------- */}
      <section className="px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="engraved text-[24px] leading-tight text-fg sm:text-[32px]">
              La carte
            </h2>
            <p className="engraved mt-3.5 text-[15px] leading-tight tracking-[0.16em] text-gold sm:text-[19px]">
              Quelques signatures
            </p>
          </Reveal>

          <div className="mt-12 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {COCKTAILS.slice(0, 4).map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.07}>
                <Link href="/nos-cocktails" className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-[1.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>

                  <div className="mt-6 flex items-baseline justify-between gap-4">
                    <h3 className="engraved text-[15px] text-fg transition-colors duration-500 group-hover:text-gold">
                      {c.name}
                    </h3>
                    <span className="shrink-0 font-sans text-[9px] uppercase tracking-[0.2em] text-gold/70">
                      {c.family}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="mt-12 text-center">
            <Link
              href="/nos-cocktails"
              className="group inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-muted transition-colors duration-500 hover:text-gold"
            >
              Toute la carte
              <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <GlassDetail />

      {/* ---------------- Cérémonie ----------------
          Bande sombre pleine largeur : elle rappelle la bannière et découpe la
          page en deux respirations. */}
      <section className="relative overflow-hidden bg-band py-24 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-10">
          <Reveal>
            <p className="font-sans text-[10px] uppercase tracking-[0.42em] text-gold">
              Le soir du lancement
            </p>
            <h2 className="engraved mt-7 text-[26px] leading-[1.25] text-fg sm:text-[36px]">
              Revivez notre
              <br />
              cérémonie d&apos;ouverture
            </h2>
            <p className="mt-8 max-w-md font-sans text-[14px] font-light leading-[2] text-muted">
              43 invités, une carte servie sous le clair de lune et un dress code
              tenu jusqu&apos;au bout. C&apos;est là que tout a commencé.
            </p>
            <Link
              href="/galerie"
              className="group mt-9 inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-gold transition-opacity duration-500 hover:opacity-70"
            >
              Voir la galerie
              <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-3 gap-3">
              {GALLERY.slice(0, 3).map((g, i) => (
                <div
                  key={g.src}
                  className={`relative overflow-hidden rounded-2xl ${
                    i === 1 ? "aspect-[3/5] sm:-translate-y-7" : "aspect-[3/4]"
                  }`}
                >
                  <Image
                    src={g.src}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 33vw, 18vw"
                    className="object-cover transition-transform duration-[1.8s] hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Infolettre ----------------
          Bande sombre et lueur dorée qui respire : l'inscription devient un
          moment de la page, pas un encart de bas de site. */}
      <section className="relative overflow-hidden bg-band px-6 py-24 lg:px-10 lg:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 animate-shimmer rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--gold) / 0.16), transparent 62%)",
          }}
        />

        <div className="relative z-10">
          <Reveal>
            <Newsletter source="accueil" />
          </Reveal>

          <Reveal delay={0.12} className="mt-20 text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.42em] text-gold">
              Nous suivre
            </p>
            <Social className="mt-6 justify-center" />
          </Reveal>
        </div>
      </section>

      {/* Raccord : la bande noire de l'infolettre remonte vers le fond du
          thème. Sans lui, la lisière entre le noir pur et le bleu nuit se
          voyait comme un trait. */}
      <div
        aria-hidden
        className="h-24 bg-gradient-to-b from-band to-bg lg:h-32"
      />

      {/* ---------------- Appel final ---------------- */}
      <section className="px-6 pb-24 lg:px-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="engraved text-[28px] leading-[1.25] text-fg sm:text-[38px]">
            Votre date est peut-être
            <br />
            encore libre
          </h2>
          <p className="mx-auto mt-8 max-w-xl font-sans text-[15px] font-light leading-[2] text-muted">
            Consultez le calendrier, décrivez votre événement, et recevez notre
            réponse sous 24 heures.
          </p>
          <Link href="/reservation" className="btn-luxe mt-11 inline-block">
            Vérifier ma date
          </Link>
        </Reveal>
      </section>
    </>
  );
}
