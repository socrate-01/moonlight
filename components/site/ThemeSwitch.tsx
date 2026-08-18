"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/** Couleurs de fond des deux thèmes (--bg de globals.css). Le calque doit
 *  arriver dans la couleur de destination, sinon on voit un flash. */
const BG = { dark: "rgb(9,11,30)", light: "rgb(241,239,230)" };

export default function ThemeSwitch({ light = false }: { light?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const apply = (next: boolean) => {
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* navigation privée : la préférence ne vaut que pour la session */
    }
  };

  const toggle = () => {
    if (busy.current) return; // un double clic pendant l'animation la casserait
    const next = !dark;
    setDark(next);

    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = ref.current?.getBoundingClientRect();

    if (reduce || !r || typeof document.body.animate !== "function") {
      apply(next);
      return;
    }

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const { innerWidth: w, innerHeight: h } = window;
    // Rayon nécessaire pour couvrir le coin le plus éloigné du bouton.
    const radius = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(w - cx, cy),
      Math.hypot(cx, h - cy),
      Math.hypot(w - cx, h - cy)
    );

    busy.current = true;
    root.classList.add("theme-swapping");

    // Le thème bascule tout de suite : l'attente venait de ce qu'il était
    // appliqué en fin d'animation. Le calque n'est plus qu'une onde décorative
    // qui passe par-dessus une page déjà changée.
    apply(next);

    const layer = document.createElement("div");
    layer.className = "theme-sweep-layer";
    layer.style.background = next ? BG.dark : BG.light;
    document.body.appendChild(layer);

    layer
      .animate(
        [
          { clipPath: `circle(0px at ${cx}px ${cy}px)`, opacity: 0.9 },
          { clipPath: `circle(${radius}px at ${cx}px ${cy}px)`, opacity: 0 },
        ],
        { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
      )
      .finished.catch(() => {})
      .finally(() => {
        layer.remove();
        root.classList.remove("theme-swapping");
        busy.current = false;
      });
  };

  return (
    <button
      ref={ref}
      onClick={toggle}
      aria-label={dark ? "Passer en thème clair" : "Passer en thème sombre"}
      className={`relative flex h-9 w-16 shrink-0 items-center rounded-full border px-1 backdrop-blur transition-colors duration-500 ${
        light ? "border-white/40 bg-white/10" : "border-fg/20 bg-fg/5"
      }`}
    >
      <motion.span
        className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-lg"
        style={{
          backgroundImage: "linear-gradient(135deg,#4b2e8c,#e0632a 60%,#c9a25e)",
        }}
        animate={{ x: mounted && dark ? 28 : 0 }}
        /* Calé sur la durée du balayage pour que bouton et fond ne fassent
           qu'un seul geste. */
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        {dark ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </motion.span>
    </button>
  );
}
