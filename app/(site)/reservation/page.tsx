import PageHeader from "@/components/site/PageHeader";
import BookingFlow from "@/components/site/BookingFlow";
import Reveal from "@/components/Reveal";
import { PRICING, money } from "@/lib/site";

export const metadata = {
  title: "Réservation · Moonlight Cocktail Bar",
  description:
    "Choisissez votre date, décrivez votre événement et recevez une réponse sous 24 heures.",
};

export default function ReservationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Réservation"
        title="Bloquons"
        accent="votre date"
        lead={`Prestations à partir de ${money(PRICING.startingAt)}. Réponse sous 24 heures, acompte de ${money(PRICING.deposit)} à la confirmation.`}
      />

      <section className="px-6 pb-28 lg:px-10">
        <BookingFlow />
      </section>

      <section className="px-6 pb-28 lg:px-10">
        <Reveal className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          {[
            ["24 h", "Délai de réponse", "Chaque demande est étudiée à la main, jamais automatiquement."],
            [money(PRICING.deposit), "Acompte", "Il confirme la date, la retire du calendrier et se déduit du total."],
            [`${PRICING.freeRadiusKm} km`, "Déplacement inclus", "Au-delà, un forfait vous est communiqué avant confirmation."],
          ].map(([big, label, body]) => (
            <div key={label} className="rounded-2xl bg-surface/50 p-7 text-center">
              <p className="engraved text-[24px] text-fg">{big}</p>
              <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.24em] text-gold">
                {label}
              </p>
              <p className="mt-4 font-sans text-[12px] font-light leading-[1.9] text-muted">
                {body}
              </p>
            </div>
          ))}
        </Reveal>
      </section>
    </>
  );
}
