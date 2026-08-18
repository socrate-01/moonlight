"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type Shot = { src: string; w: number; h: number; caption?: string };

const ease = [0.22, 1, 0.36, 1] as const;

/** Mosaïque cliquable avec visionneuse plein écran, navigable au clavier. */
export default function Lightbox({ shots }: { shots: Shot[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) =>
      setOpen((i) => (i === null ? i : (i + d + shots.length) % shots.length)),
    [shots.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <>
      {/* Mosaïque en colonnes : les hauteurs varient, le rythme reste naturel */}
      <div className="columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
        {shots.map((s, i) => (
          <motion.button
            key={s.src}
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: Math.min(i * 0.04, 0.35), ease }}
            className="group relative block w-full overflow-hidden rounded-2xl"
            aria-label={s.caption || "Agrandir la photo"}
          >
            <Image
              src={s.src}
              alt={s.caption || ""}
              width={s.w}
              height={s.h}
              sizes="(max-width: 640px) 50vw, 33vw"
              className="h-auto w-full transition-transform duration-[1.4s] ease-out group-hover:scale-[1.07]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            {s.caption && (
              <span className="absolute inset-x-0 bottom-0 translate-y-3 p-4 text-left font-sans text-[11px] uppercase tracking-[0.16em] text-white opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                {s.caption}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-night/95 backdrop-blur-xl"
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Fermer"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white hover:text-night"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                onClick={(e) => {
                  e.stopPropagation();
                  step(dir === "next" ? 1 : -1);
                }}
                aria-label={dir === "next" ? "Photo suivante" : "Photo précédente"}
                className={`absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white hover:text-night ${
                  dir === "next" ? "right-4" : "left-4"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={dir === "next" ? "M9 6l6 6-6 6" : "M15 18l-6-6 6-6"} />
                </svg>
              </button>
            ))}

            <motion.div
              key={open}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
              className="relative max-h-[86vh] w-[min(92vw,60rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={shots[open].src}
                alt={shots[open].caption || ""}
                width={shots[open].w}
                height={shots[open].h}
                sizes="92vw"
                className="mx-auto h-auto max-h-[86vh] w-auto rounded-2xl object-contain"
                priority
              />
              {shots[open].caption && (
                <p className="mt-5 text-center font-sans text-[12px] uppercase tracking-[0.2em] text-white/70">
                  {shots[open].caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
