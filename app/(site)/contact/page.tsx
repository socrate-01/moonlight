import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import ContactForm from "@/components/site/ContactForm";
import Social from "@/components/site/Social";
import Reveal from "@/components/Reveal";
import { SITE, money, PRICING } from "@/lib/site";

export const metadata = {
  title: "Contact · Moonlight Cocktail Bar",
  description:
    "Écrivez-nous pour votre mariage, votre réception ou votre événement d'entreprise. Réponse sous 24 heures.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nous joindre"
        title="Dites-nous"
        accent="ce que vous préparez"
        lead="Une question, un projet, une date à vérifier. Nous répondons sous 24 heures."
      />

      <section className="px-6 pb-28 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="space-y-10">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
                  Par email
                </p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-3 block font-sans text-[15px] text-fg transition-colors duration-500 hover:text-gold"
                >
                  {SITE.email}
                </a>
              </div>

              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
                  Zone d&apos;intervention
                </p>
                <p className="mt-3 font-sans text-[14px] font-light leading-[1.9] text-muted">
                  {SITE.city} et sa région. Au-delà de {PRICING.freeRadiusKm} km,
                  un forfait de déplacement s&apos;ajoute et vous est indiqué
                  avant toute confirmation.
                </p>
              </div>

              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
                  Budget
                </p>
                <p className="mt-3 font-sans text-[14px] font-light leading-[1.9] text-muted">
                  Nos prestations démarrent à{" "}
                  <span className="text-fg">{money(PRICING.startingAt)}</span>. Un
                  acompte de {money(PRICING.deposit)} confirme et bloque la date.
                </p>
              </div>

              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
                  Nous suivre
                </p>
                <Social className="mt-4" />
              </div>

              <div className="rounded-2xl bg-surface/50 p-6">
                <p className="font-sans text-[13px] font-light leading-[1.9] text-muted">
                  Vous connaissez déjà votre date ?{" "}
                  <Link
                    href="/reservation"
                    className="text-gold underline-offset-4 hover:underline"
                  >
                    Passez directement par la réservation
                  </Link>
                  . C&apos;est plus rapide qu&apos;un échange d&apos;emails.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
