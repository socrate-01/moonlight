"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { IMAGES } from "./images";
import CocktailIcon from "./CocktailIcon";

const fade = {
  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, delay: 0.16 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Slow, elegant eased scroll down to "La Maison".
  const glideToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("about");
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollIntoView();
      return;
    }

    const startY = window.scrollY;
    const targetY = el.getBoundingClientRect().top + startY;
    const distance = targetY - startY;
    const duration = 1500;
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Disable native smooth-scroll so our per-frame easing has full control.
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    let start: number | undefined;
    const step = (ts: number) => {
      if (start === undefined) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(p));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        root.style.scrollBehavior = prev;
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Banner image layer — day / night crossfade */}
      <motion.div style={{ y: imgY }} className="absolute inset-0 scale-100 sm:scale-110">
        <Image
          src={IMAGES.heroDay}
          alt="Terrasse cocktail au coucher du soleil"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[46%_center] transition-opacity duration-1000 dark:opacity-0 sm:object-center sm:animate-kenburns"
        />
        <Image
          src={IMAGES.heroNight}
          alt="Bar à cocktails feutré, ambiance nocturne"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-0 transition-opacity duration-1000 dark:opacity-100 sm:animate-kenburns"
        />
      </motion.div>

      {/* Overlays — fixed warm-dark scrim so the cream lettering reads in both themes */}
      <div className="absolute inset-0 bg-night/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-night/10 to-night/50" />

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <motion.div variants={fade} custom={0} initial="hidden" animate="show">
          <span className="relative mx-auto mb-7 block h-16 w-16">
            <Image
              src="/images/logo-icon-ink.png"
              alt="Moonlight"
              fill
              className="animate-floaty object-contain dark:opacity-0"
            />
            <Image
              src="/images/logo-icon-orange.png"
              alt=""
              fill
              className="animate-floaty object-contain opacity-0 dark:opacity-100"
            />
          </span>
        </motion.div>

        <motion.p
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
          className="mb-6 font-sans text-[11px] font-medium uppercase tracking-luxe text-[#e6cf97]"
        >
          Cérémonie d'ouverture officielle
        </motion.p>

        <motion.h1
          variants={fade}
          custom={2}
          initial="hidden"
          animate="show"
          className="font-display text-6xl font-light leading-[0.94] tracking-[0.01em] text-[#f6f3ea] drop-shadow-[0_2px_40px_rgba(0,0,0,0.65)] sm:text-8xl md:text-[8.5rem]"
        >
          Moonlight
        </motion.h1>

        <motion.p
          variants={fade}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-4 font-sans text-sm uppercase tracking-luxe text-[#e6cf97] sm:text-base"
        >
          Cocktail Bar
        </motion.p>

        <motion.div
          variants={fade}
          custom={4}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-col items-center gap-6"
        >
          <CocktailIcon className="h-7 w-7 animate-floaty text-[#e6cf97]" />
          <p className="max-w-xl font-display text-2xl font-light italic leading-relaxed text-[#f6f3ea]/90 sm:text-[1.7rem]">
            Une soirée sous le clair de lune. Élégance, mixologie d'exception et les
            premières lueurs d'un lieu pas comme les autres.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-[12px] uppercase tracking-wide2 text-[#f6f3ea]/80">
            <span>Samedi 8 Août 2026</span>
            <CocktailIcon className="h-4 w-4 text-[#e6cf97]" />
            <span>18 h 00</span>
            <CocktailIcon className="h-4 w-4 text-[#e6cf97]" />
            <span>7300 Rue Saint-Jacques</span>
          </div>
        </motion.div>

        <motion.p
          variants={fade}
          custom={5}
          initial="hidden"
          animate="show"
          className="mt-9 max-w-md rounded-full border border-[#e6cf97]/40 bg-black/20 px-6 py-2.5 text-center font-sans text-[11px] uppercase tracking-wide2 text-[#f6f3ea] backdrop-blur-sm"
        >
          Merci d'arriver avant 18 h 30 · au-delà, les entrées ne seront plus
          autorisées
        </motion.p>

        <motion.div
          variants={fade}
          custom={6}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a href="#reservation" className="btn-luxe">
            Réserver ma place
            <span aria-hidden>→</span>
          </a>
          <a
            href="#about"
            className="rounded-full border border-[#f6f3ea]/40 px-7 py-3.5 font-sans text-[11px] uppercase tracking-wide2 text-[#f6f3ea] backdrop-blur-sm transition-all duration-300 hover:border-[#f6f3ea] hover:bg-[#f6f3ea] hover:text-night"
          >
            Découvrir la maison
          </a>
        </motion.div>
      </motion.div>

      {/* scroll cue — floating, clickable arrow that glides to La Maison */}
      <motion.a
        href="#about"
        onClick={glideToAbout}
        aria-label="Découvrir la maison"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 1 }}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[#f6f3ea]/65 transition-colors duration-300 hover:text-[#f6f3ea]"
      >
        <span className="font-sans text-[10px] uppercase tracking-luxe">
          Découvrir
        </span>
        <motion.svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.a>
    </section>
  );
}
