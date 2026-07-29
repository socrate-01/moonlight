"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about", label: "La Maison" },
  { href: "#theme", label: "Dress code" },
  { href: "#gallery", label: "Galerie" },
  { href: "#programme", label: "Programme" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // At the top the nav sits over the hero photo → use light text.
  // Once scrolled, the nav gets a themed backdrop → use theme colors.
  const overHero = !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-fg/10 bg-bg/70 py-3 backdrop-blur-xl"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
        <a href="#top" className="flex items-center gap-3 group">
          <span className="relative h-9 w-9">
            <Image
              src="/images/logo-icon-ink.png"
              alt="Moonlight"
              fill
              sizes="36px"
              className="object-contain transition-transform duration-500 group-hover:-rotate-6 dark:opacity-0"
            />
            <Image
              src="/images/logo-icon-orange.png"
              alt=""
              fill
              sizes="36px"
              className="object-contain opacity-0 transition-transform duration-500 group-hover:-rotate-6 dark:opacity-100"
            />
          </span>
          <span
            className={`font-display text-xl font-medium tracking-[0.14em] transition-colors duration-500 ${
              overHero ? "text-white drop-shadow" : "text-fg"
            }`}
          >
            MOONLIGHT
          </span>
        </a>

        <div className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`group relative font-sans text-[12px] uppercase tracking-wide2 transition-colors duration-300 ${
                overHero
                  ? "text-white/80 hover:text-white"
                  : "text-muted hover:text-fg"
              }`}
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle overHero={overHero} />
          <a
            href="#reservation"
            className={`hidden rounded-full border px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide2 transition-all duration-300 sm:inline-block ${
              overHero
                ? "border-white/50 text-white hover:bg-white hover:text-night"
                : "border-fg/30 text-fg hover:bg-fg hover:text-bg"
            }`}
          >
            Réserver
          </a>
        </div>
      </nav>
    </header>
  );
}
