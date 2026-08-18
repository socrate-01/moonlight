"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/site";
import ThemeSwitch from "./ThemeSwitch";

export default function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Un changement de page ferme le menu, sinon il resterait ouvert par-dessus
  // la nouvelle vue.
  useEffect(() => setOpen(false), [pathname]);

  // Menu ouvert : on bloque le défilement de l'arrière-plan.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Sur l'accueil, la barre repose sur la photo plein cadre tant qu'on n'a pas
     défilé : le texte doit y rester clair, sans quoi il devient illisible en
     thème clair. */
  const overHero = pathname === "/" && !scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-fg/10 bg-bg/70 py-3 backdrop-blur-2xl"
            : "border-b border-transparent py-5"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 lg:px-10">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <span className="relative h-9 w-[22px]">
              <Image
                src="/images/logo-icon-ink.png"
                alt=""
                fill
                sizes="22px"
                className={`object-contain transition-transform duration-700 group-hover:-rotate-12 ${
                  overHero ? "opacity-0" : "dark:opacity-0"
                }`}
              />
              <Image
                src="/images/logo-icon-orange.png"
                alt="Moonlight"
                fill
                sizes="22px"
                className={`object-contain transition-transform duration-700 group-hover:-rotate-12 ${
                  overHero ? "opacity-100" : "opacity-0 dark:opacity-100"
                }`}
              />
            </span>
            <span
              className={`engraved text-[15px] transition-colors duration-500 sm:text-[17px] ${
                overHero ? "text-white" : "text-fg group-hover:text-gold"
              }`}
            >
              Moonlight
            </span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative font-sans text-[11px] uppercase tracking-[0.22em] transition-colors duration-500 ${
                    overHero
                      ? "text-white/75 hover:text-white"
                      : active
                      ? "text-gold"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-2 left-0 h-px bg-gold transition-all duration-500 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <ThemeSwitch light={overHero} />
            <Link
              href="/reservation"
              className={`hidden rounded-full border px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.2em] transition-all duration-500 sm:inline-block ${
                overHero
                  ? "border-white/50 text-white hover:bg-white hover:text-night"
                  : "border-gold/50 text-gold hover:bg-gold hover:text-bg"
              }`}
            >
              Réserver
            </Link>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              className={`flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border transition-colors duration-500 lg:hidden ${
                overHero ? "border-white/40" : "border-fg/20"
              }`}
            >
              <span
                className={`block h-px w-4 transition-all duration-300 ${
                  overHero ? "bg-white" : "bg-fg"
                } ${open ? "translate-y-[3px] rotate-45" : ""}`}
              />
              <span
                className={`block h-px w-4 transition-all duration-300 ${
                  overHero ? "bg-white" : "bg-fg"
                } ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 px-8">
              {[...NAV_LINKS, { href: "/reservation", label: "Réserver" }].map(
                (l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={l.href}
                      className={`engraved block py-3 text-center text-[22px] transition-colors duration-500 ${
                        pathname === l.href ? "text-gold" : "text-fg hover:text-gold"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
