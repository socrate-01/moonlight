import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Merci · Moonlight Cocktail Bar",
  robots: { index: false, follow: false },
};

/** Page de retour après le paiement Square.
 *
 *  Elle remercie, elle n'enregistre rien : c'est le webhook signé par Square
 *  qui fait foi. Une redirection de retour se fabrique à la main dans une
 *  barre d'adresse, et marquer la réservation payée ici reviendrait à offrir
 *  une soirée à qui sait recopier une URL. */
export default function MerciPage() {
  return (
    <>
      <PageHeader
        eyebrow="C'est confirmé"
        title="Votre date"
        accent="est à vous"
        lead="Merci. Nous avons bien reçu votre confirmation."
      />

      <section className="px-6 pb-32 lg:px-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-surface/50 p-10 text-center">
          <span className="text-5xl">🥂</span>
          <p className="engraved mt-7 text-[22px] text-fg">
            Nous préparons votre soirée
          </p>
          <p className="mx-auto mt-6 max-w-md font-sans text-[14px] font-light leading-[2] text-muted">
            Un reçu vous parvient directement de Square, et nous revenons vers
            vous très vite pour caler les derniers détails : la carte, les
            horaires précis et l&apos;accès au lieu.
          </p>
          <p className="mx-auto mt-6 max-w-md font-sans text-[12px] font-light leading-[1.9] text-muted/80">
            Si votre relevé bancaire met quelques minutes à se mettre à jour,
            c&apos;est normal. En cas de doute, écrivez-nous.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/" className="btn-luxe">
              Retour au site
            </Link>
            <Link
              href="/contact"
              className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
            >
              Nous écrire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
