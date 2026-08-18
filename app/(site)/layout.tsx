import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

/** Gabarit des pages publiques.
 *
 *  `theme-prestige` est posé ici et non sur le body : l'admin conserve ainsi
 *  son habillage actuel tant qu'il n'a pas été repris. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-prestige min-h-screen bg-bg">
      <SiteNav />
      <main>{children}</main>
      {/* Raccord vers le pied de page : sans lui, la lisière entre le fond et
          la surface se lisait comme un trait, dans les deux thèmes. */}
      <div aria-hidden className="h-24 bg-gradient-to-b from-bg to-surface lg:h-32" />
      <SiteFooter />
    </div>
  );
}
