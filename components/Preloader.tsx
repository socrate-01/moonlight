"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Preloader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setOpen(true), 1700);
    return () => clearTimeout(t);
  }, []);

  const restore = () => {
    document.body.style.overflow = "";
  };

  return (
    <AnimatePresence onExitComplete={restore}>
      {!open && (
        <motion.div
          key="preloader"
          aria-hidden
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-bg"
          initial={{ opacity: 1 }}
          exit={{
            scale: 1.7,
            opacity: 0,
            filter: "blur(6px)",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* soft glow behind the mark */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[90px]" />

          {/* cocktail mark */}
          <motion.span
            className="relative mb-6 block h-20 w-20"
            initial={{ opacity: 0, scale: 0.7, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/images/logo-icon-ink.png"
              alt="Moonlight"
              fill
              priority
              className="object-contain dark:opacity-0"
            />
            <Image
              src="/images/logo-icon-orange.png"
              alt=""
              fill
              priority
              className="object-contain opacity-0 dark:opacity-100"
            />
          </motion.span>

          <motion.span
            className="font-display text-3xl font-light tracking-[0.22em] text-fg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            MOONLIGHT
          </motion.span>
          <motion.span
            className="mt-2 font-sans text-[10px] uppercase tracking-luxe text-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Cocktail Bar
          </motion.span>

          {/* thin loading line */}
          <div className="mt-7 h-px w-40 overflow-hidden bg-fg/15">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-plum via-terracotta to-gold"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.5, delay: 0.15, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
