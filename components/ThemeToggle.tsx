"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle({ overHero = false }: { overHero?: boolean }) {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Passer en mode clair" : "Passer en mode nuit"}
      className={`relative flex h-9 w-16 items-center rounded-full border px-1 backdrop-blur transition-colors ${
        overHero ? "border-white/40 bg-white/10" : "border-fg/20 bg-fg/5"
      }`}
    >
      <motion.span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-plum to-terracotta text-white shadow"
        animate={{ x: mounted && dark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        {dark ? (
          // moon
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          </svg>
        ) : (
          // sun
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </motion.span>
    </button>
  );
}
