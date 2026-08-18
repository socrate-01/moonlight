import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import UnsubscribeConfirm from "@/components/site/UnsubscribeConfirm";
import { resolveToken } from "@/lib/server/unsubscribe";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Se désabonner · Moonlight Cocktail Bar",
  robots: { index: false, follow: false },
};

/** Page humaine du désabonnement.
 *
 *  Elle CONFIRME, elle ne désabonne pas. Le retrait n'a lieu qu'après une
 *  action explicite, qui part en POST. Un lien de courriel est visité par les
 *  antivirus de messagerie et les aperçus avant même que le destinataire ne
 *  l'ouvre : agir dès l'affichage retirerait des gens qui n'ont rien demandé. */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  const resolved = token ? await resolveToken(token).catch(() => null) : null;

  return (
    <>
      <PageHeader
        eyebrow="Vos préférences"
        title="Se désabonner"
        accent="de nos envois"
        lead={
          resolved
            ? "Confirmez ci-dessous et nous cessons immédiatement de vous écrire."
            : undefined
        }
      />

      <section className="px-6 pb-32 lg:px-10">
        <div className="mx-auto max-w-xl text-center">
          {resolved ? (
            <UnsubscribeConfirm token={token} email={resolved.email} />
          ) : (
            <div className="rounded-2xl border border-fg/10 bg-surface p-10">
              <p className="engraved text-[20px] text-fg">Lien introuvable</p>
              <p className="mx-auto mt-5 max-w-sm font-sans text-[14px] font-light leading-[1.9] text-muted">
                Ce lien de désabonnement n&apos;est plus valide, ou l&apos;adresse
                a déjà été retirée de nos listes. Si vous recevez encore nos
                messages, écrivez-nous et nous nous en occupons.
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
