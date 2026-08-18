"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** Transition entre deux sections.
 *
 *  Plutôt qu'un trait posé là, le filet se **dessine** du centre vers les
 *  bords à l'entrée dans le champ, et un losange s'ouvre au milieu. Le geste
 *  dure près de deux secondes : c'est ce qui le rend élégant plutôt que
 *  décoratif. */
export default function SectionDivider() {
  return (
    <div className="relative mx-auto flex h-px max-w-6xl items-center justify-center px-6 lg:px-10">
      <motion.span
        aria-hidden
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.8, ease }}
        className="rule-draw block w-full origin-center"
      />

      <motion.span
        aria-hidden
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 45, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.4, delay: 0.5, ease }}
        className="absolute h-[7px] w-[7px] border border-gold/60 bg-bg"
      />
    </div>
  );
}
