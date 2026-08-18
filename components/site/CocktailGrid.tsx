"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COCKTAILS, COCKTAIL_FAMILIES, money } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;
type Filter = "Tous" | (typeof COCKTAIL_FAMILIES)[number];

export default function CocktailGrid() {
  const [filter, setFilter] = useState<Filter>("Tous");
  const shown =
    filter === "Tous" ? COCKTAILS : COCKTAILS.filter((c) => c.family === filter);

  return (
    <div>
      <div className="mb-14 flex flex-wrap items-center justify-center gap-2.5">
        {(["Tous", ...COCKTAIL_FAMILIES] as Filter[]).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.2em] transition-all duration-500 ${
                active
                  ? "border-transparent bg-gold text-bg shadow-[0_0_24px_-8px_rgba(201,162,94,0.95)]"
                  : "border-fg/20 text-muted hover:border-gold/60 hover:text-fg"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((c, i) => (
            <motion.article
              key={c.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.6, ease }}
              className="group rounded-2xl bg-surface/50 overflow-hidden"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
                {/* Voile qui se lève au survol pour révéler la photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-60" />
                <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/25 px-3 py-1 font-sans text-[9px] uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                  {c.family}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="engraved text-[17px] leading-tight text-fg">
                    {c.name}
                  </h3>
                  <span className="shrink-0 font-sans text-[14px] tabular-nums text-gold">
                    {money(c.price)}
                  </span>
                </div>
                <p className="mt-3 font-sans text-[13px] font-light leading-[1.9] text-muted">
                  {c.description}
                </p>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
