import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import Lightbox, { type Shot } from "@/components/site/Lightbox";
import Reveal from "@/components/Reveal";
import { GALLERY, DRESSCODE } from "@/components/images";

export const metadata = {
  title: "Galerie · Moonlight Cocktail Bar",
  description:
    "Nos créations en images et le souvenir de notre cérémonie de lancement.",
};

const shots: Shot[] = GALLERY.map((g) => ({ ...g }));

/* ⚠️ À CONFIRMER — remplacer par les photos de la soirée du 8 août. En
   attendant, les visuels du dress code tiennent la place. */
const CEREMONIE: Shot[] = DRESSCODE.map((src, i) => ({
  src,
  w: 1200,
  h: 1600,
  caption: `Cérémonie de lancement · ${i + 1}`,
}));

export default function GaleriePage() {
  return (
    <>
      <PageHeader
        eyebrow="En images"
        title="Ce que ça donne,"
        accent="une fois servi"
        lead="Nos créations, nos installations, et le souvenir de la soirée qui a tout lancé."
      />

      {/* Revivez la cérémonie */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="rounded-2xl bg-surface/50 relative overflow-hidden p-8 sm:p-12">
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-gold">
                    8 août 2026 · 7300 rue Saint-Jacques
                  </p>
                  <h2 className="engraved mt-6 text-[26px] leading-tight text-fg sm:text-[34px]">
                    Revivez notre
                    <br />
                    <span className="text-gradient">cérémonie de lancement</span>
                  </h2>
                  <p className="mt-7 font-sans text-[14px] font-light leading-[2] text-muted">
                    Une soirée complète, 43 invités, un dress code tenu jusqu&apos;au
                    bout et une carte servie sous le clair de lune. C&apos;est là
                    que Moonlight a ouvert ses portes, et ces images en sont ce
                    qu&apos;il reste.
                  </p>

                  <dl className="mt-9 grid grid-cols-3 gap-6">
                    {[
                      ["43", "invités"],
                      ["8", "cocktails"],
                      ["1", "première"],
                    ].map(([n, l]) => (
                      <div key={l}>
                        <dt className="engraved text-[26px] text-fg">{n}</dt>
                        <dd className="mt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                          {l}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {CEREMONIE.map((c, i) => (
                    <div
                      key={c.src}
                      className={`relative overflow-hidden rounded-2xl ${
                        i === 1 ? "aspect-[3/5] sm:-translate-y-5" : "aspect-[3/4]"
                      }`}
                    >
                      <Image
                        src={c.src}
                        alt={c.caption || ""}
                        fill
                        sizes="(max-width: 1024px) 33vw, 18vw"
                        className="object-cover transition-transform duration-[1.6s] hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mosaïque */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-14 text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-gold">
              Nos créations
            </p>
            <h2 className="engraved mt-6 text-[24px] leading-tight text-fg sm:text-[30px]">
              La carte, en photo
            </h2>
          </Reveal>

          <Lightbox shots={shots} />
        </div>
      </section>

      <section className="px-6 pb-28 lg:px-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="engraved text-[24px] leading-tight text-fg sm:text-[30px]">
            La prochaine, c&apos;est peut-être la vôtre
          </h2>
          <Link href="/reservation" className="btn-luxe mt-9 inline-block">
            Réserver une date
          </Link>
        </Reveal>
      </section>
    </>
  );
}
