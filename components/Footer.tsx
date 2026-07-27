import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night px-6 py-20 lg:px-10">
      {/* warm glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-terracotta/15 blur-[120px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-9 text-center">
        <Image
          src="/images/logo-mark-orange.png"
          alt="Moonlight Cocktail Bar"
          width={2836}
          height={2569}
          className="h-auto w-56 sm:w-64"
        />

        <div className="mx-auto h-px w-40 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-sans text-[12px] uppercase tracking-wide2 text-[#f1efe6]/70">
          <span>Samedi XX Mois 2026 · 20 h 00</span>
          <span>[ Adresse du lieu ]</span>
          <a href="mailto:contact@moonlight.bar" className="transition hover:text-gold">
            contact@moonlight.bar
          </a>
        </div>

        <div className="flex items-center gap-6 font-sans text-[11px] uppercase tracking-wide2 text-[#f1efe6]/55">
          <a href="#" className="transition hover:text-gold">Instagram</a>
          <span className="h-3 w-px bg-white/15" />
          <a href="#" className="transition hover:text-gold">Facebook</a>
          <span className="h-3 w-px bg-white/15" />
          <a href="#reservation" className="transition hover:text-gold">Réserver</a>
        </div>

        <p className="font-sans text-[10px] uppercase tracking-luxe text-[#f1efe6]/35">
          © 2026 Moonlight Cocktail Bar · Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
