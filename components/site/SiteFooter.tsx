import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, SITE, money, PRICING } from "@/lib/site";
import Social from "./Social";

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-surface px-6 pb-20 pt-10 lg:px-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="relative h-10 w-6">
                <Image
                  src="/images/logo-icon-ink.png"
                  alt=""
                  fill
                  sizes="24px"
                  className="object-contain dark:opacity-0"
                />
                <Image
                  src="/images/logo-icon-orange.png"
                  alt="Moonlight"
                  fill
                  sizes="24px"
                  className="object-contain opacity-0 dark:opacity-100"
                />
              </span>
              <span className="engraved text-[17px] text-fg">Moonlight</span>
            </Link>
            <p className="mt-5 max-w-xs font-sans text-[13px] font-light leading-[1.9] text-muted">
              {SITE.tagline}. Nous apportons le bar, la carte et l&apos;équipe
              là où vous célébrez.
            </p>
            <Social className="mt-7" />
          </div>

          <nav>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
              Explorer
            </p>
            <ul className="mt-5 space-y-3">
              {[...NAV_LINKS, { href: "/reservation", label: "Réservation" }].map(
                (l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-sans text-[13px] font-light text-muted transition-colors duration-500 hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
              Nous joindre
            </p>
            <ul className="mt-5 space-y-3 font-sans text-[13px] font-light text-muted">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="transition-colors duration-500 hover:text-gold"
                >
                  {SITE.email}
                </a>
              </li>
              <li>{SITE.city}</li>
              <li className="pt-2 text-[12px]">
                Prestations à partir de{" "}
                <span className="text-fg">{money(PRICING.startingAt)}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rule my-12" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-muted/70">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-muted/70">
            Montréal · Québec
          </p>
        </div>
      </div>
    </footer>
  );
}
