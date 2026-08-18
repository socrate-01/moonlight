import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import ProposalCard from "@/components/site/ProposalCard";
import { readQuoteToken } from "@/lib/server/booking-confirm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Votre proposition · Moonlight Cocktail Bar",
  robots: { index: false, follow: false },
};

/** Page de proposition, accessible par le seul lien reçu par courriel.
 *
 *  Elle ne fait qu'afficher : la confirmation part en POST, comme pour le
 *  désabonnement. Un aperçu de lien ou un antivirus de messagerie visitant
 *  l'adresse ne doit pas engager le client. */
export default async function PropositionPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  const quote = token ? await readQuoteToken(token).catch(() => null) : null;

  return (
    <>
      <PageHeader
        eyebrow="Votre demande"
        title="Notre"
        accent="proposition"
        lead={
          quote
            ? "Voici ce que nous vous proposons. Rien n'est engagé tant que vous n'avez pas confirmé."
            : undefined
        }
      />

      <section className="px-6 pb-32 lg:px-10">
        <div className="mx-auto max-w-2xl">
          {quote ? (
            <ProposalCard token={token} quote={quote} />
          ) : (
            <div className="rounded-2xl border border-fg/10 bg-surface p-10 text-center">
              <p className="engraved text-[20px] text-fg">Proposition introuvable</p>
              <p className="mx-auto mt-5 max-w-sm font-sans text-[14px] font-light leading-[1.9] text-muted">
                Ce lien n&apos;est plus valide, ou la proposition a été remplacée
                par une version plus récente. Vérifiez le dernier courriel reçu,
                ou écrivez-nous et nous vous la renvoyons.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-block font-sans text-[11px] uppercase tracking-[0.22em] text-gold underline-offset-4 hover:underline"
              >
                Nous écrire →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
