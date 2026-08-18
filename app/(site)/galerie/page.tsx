import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import GalleryGrid from "@/components/site/GalleryGrid";
import GalleryPreview from "@/components/site/GalleryPreview";
import Reveal from "@/components/Reveal";
import { DRESSCODE } from "@/components/images";
import { PRESENTATION } from "@/lib/site";

export const metadata = {
  title: "Galerie · Moonlight Cocktail Bar",
  description:
    "Retour en images sur l'inauguration de Moonlight Cocktail Bar. Toutes les photos de la soirée, à voir et à télécharger.",
};

/* Repli de la carte de tête, le temps que la galerie réponde et tant qu'elle
   compte moins de trois photos. */
const APERCU = DRESSCODE.slice(0, 3);

export default function GaleriePage() {
  return (
    <>
      <PageHeader
        eyebrow="En images"
        title="Retour"
        accent="sur images"
        lead="La soirée qui a tout lancé, photo par photo. Toutes sont libres de téléchargement."
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

                  <a
                    href={PRESENTATION.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost mt-9 inline-flex"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M4 4h16v12H4z M9 20h6 M12 16v4" />
                    </svg>
                    {PRESENTATION.label}
                  </a>
                </div>

                <GalleryPreview album="inauguration" fallback={APERCU} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mosaïque complète, alimentée depuis l'admin */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-14 text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-gold">
              Retour sur images
            </p>
            <h2 className="engraved mt-6 text-[24px] leading-tight text-fg sm:text-[30px]">
              Inauguration de Moonlight Cocktail Bar
            </h2>
            <p className="mx-auto mt-6 max-w-lg font-sans text-[13px] font-light leading-[1.9] text-muted">
              Survolez une photo pour la télécharger, ou ouvrez-la en grand.
              Les images se chargent par vingt.
            </p>
          </Reveal>

          <GalleryGrid album="inauguration" />
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
