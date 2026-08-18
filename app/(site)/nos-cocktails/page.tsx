import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import CocktailGrid from "@/components/site/CocktailGrid";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Nos cocktails · Moonlight Cocktail Bar",
  description:
    "Nos créations signature, nos classiques revisités et nos cocktails sans alcool, avec leurs prix et leurs descriptions.",
};

export default function CocktailsPage() {
  return (
    <>
      <PageHeader
        eyebrow="La carte"
        title="Huit façons"
        accent="de commencer la nuit"
        lead="Des créations qui nous appartiennent, des classiques traités avec respect, et des mocktails qui n'ont rien d'une consolation. La carte s'adapte à votre événement."
      />

      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <CocktailGrid />
        </div>
      </section>

      <section className="px-6 pb-28 lg:px-10">
        <Reveal className="rounded-2xl bg-surface/50 mx-auto max-w-3xl p-10 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-gold">
            Sur mesure
          </p>
          <h2 className="engraved mt-6 text-[22px] leading-tight text-fg sm:text-[27px]">
            Votre cocktail, à votre nom
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-sans text-[14px] font-light leading-[2] text-muted">
            Dites-le nous dans votre demande et nous créons avec vous des
            cocktails qui n&apos;existent que pour votre soirée : vos goûts, vos
            couleurs, et le nom que vous choisissez. Avec ou sans alcool, comme
            vous préférez.
          </p>
          <Link href="/reservation" className="btn-luxe mt-9 inline-block">
            Composer ma carte
          </Link>
        </Reveal>
      </section>
    </>
  );
}
