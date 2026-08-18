"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

/** Gabarit commun des écrans d'administration : menu latéral fixe.
 *
 *  Les sections tenaient auparavant sur une rangée de pastilles en haut de
 *  page. Passé six entrées elles se repliaient sur deux lignes, poussaient le
 *  contenu vers le bas et changeaient de position d'un écran à l'autre. Un
 *  menu latéral garde la même place quoi qu'il arrive, et laisse la largeur
 *  du haut de page au titre et aux actions de l'écran.
 *
 *  Sous 1024 px il n'y a pas la place : le menu redevient un tiroir. */

type Section = { href: string; label: string; icon: JSX.Element };

const I = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);

const SECTIONS: Section[] = [
  { href: "/admin", label: "Réservations", icon: I("M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z") },
  { href: "/admin/demandes", label: "Demandes", icon: I("M4 4h16v12H8l-4 4V4Z") },
  { href: "/admin/messages", label: "Messages", icon: I("M3 6h18v12H3zM3 7l9 6 9-6") },
  { href: "/admin/cocktails", label: "Cocktails", icon: I("M4 4h16l-8 9v6M8 21h8M12 13v6") },
  { href: "/admin/galerie", label: "Galerie", icon: I("M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6") },
  { href: "/admin/mailing", label: "Mailing", icon: I("M3 5h18v14H3zM3 6l9 7 9-7") },
  { href: "/admin/feedback", label: "Avis", icon: I("M12 3l2.6 5.6 6.4.8-4.7 4.3 1.2 6.3L12 17l-5.5 3 1.2-6.3L3 9.4l6.4-.8Z") },
  { href: "/admin/scan", label: "Scanner", icon: I("M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16") },
];

/** `/admin` est le préfixe de toutes les autres routes : sans égalité stricte,
 *  il resterait allumé en permanence. */
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {SECTIONS.map((s) => {
        const active = isActive(pathname, s.href);
        return (
          <Link
            key={s.href}
            href={s.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-[12px] tracking-[0.08em] transition-all duration-300 ${
              active
                ? "bg-gold/15 text-gold"
                : "text-muted hover:bg-fg/[0.05] hover:text-fg"
            }`}
          >
            {/* Le filet doré tient lieu d'indicateur : plus discret qu'une
                pastille pleine, et il ne déplace rien. */}
            <span
              className={`h-5 w-px shrink-0 rounded transition-colors duration-300 ${
                active ? "bg-gold" : "bg-transparent"
              }`}
            />
            {s.icon}
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Foot() {
  return (
    <div className="mt-6 space-y-1 border-t border-fg/10 pt-4">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-[12px] tracking-[0.08em] text-muted transition-colors duration-300 hover:text-fg"
      >
        <span className="h-5 w-px shrink-0" />
        {I("M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5")}
        Voir le site
      </Link>
      <button
        onClick={() => signOut(auth)}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-[12px] tracking-[0.08em] text-muted transition-colors duration-300 hover:text-terracotta"
      >
        <span className="h-5 w-px shrink-0" />
        {I("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9")}
        Déconnexion
      </button>
    </div>
  );
}

export default function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  /** Boutons propres à l'écran, posés à droite du titre. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Le tiroir doit se refermer en changeant de page, sinon il masque l'écran
  // que l'on vient d'ouvrir.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Menu latéral — grand écran */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-fg/10 bg-surface/40 px-4 py-6 backdrop-blur-xl lg:flex">
        <Link href="/admin" className="mb-8 block px-3.5">
          <span className="font-display text-xl tracking-[0.14em] text-fg">
            MOONLIGHT
          </span>
          <span className="mt-1 block font-sans text-[9px] uppercase tracking-luxe text-gold">
            Administration
          </span>
        </Link>
        <Nav />
        <Foot />
      </aside>

      {/* Tiroir — petit écran */}
      {open && (
        <>
          <button
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-fg/10 bg-bg px-4 py-6 lg:hidden">
            <div className="mb-8 flex items-start justify-between px-3.5">
              <Link href="/admin">
                <span className="font-display text-xl tracking-[0.14em] text-fg">
                  MOONLIGHT
                </span>
                <span className="mt-1 block font-sans text-[9px] uppercase tracking-luxe text-gold">
                  Administration
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-lg text-muted"
              >
                ✕
              </button>
            </div>
            <Nav onNavigate={() => setOpen(false)} />
            <Foot />
          </aside>
        </>
      )}

      {/* Contenu */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-fg/10 bg-bg/80 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-8">
            <button
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-fg/20 text-fg lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            <h1 className="engraved text-[15px] text-fg">{title}</h1>

            {actions && (
              <div className="ml-auto flex flex-wrap items-center gap-2.5">
                {actions}
              </div>
            )}
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
