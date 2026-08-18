"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/* Ce qu'on met en avant autour du verre. Deux repères de chaque côté :
   au-delà, la composition se charge et l'œil ne sait plus où se poser. */
const LEFT = [
  { title: "Glace taillée sur place", note: "Des blocs clairs qui fondent lentement" },
  { title: "Agrumes du matin même", note: "Zestés devant vous, jamais la veille" },
];
const RIGHT = [
  { title: "Verrerie fournie", note: "Nous arrivons avec, nous repartons avec" },
  { title: "Deux créations à vos noms", note: "Composées avec vous en amont" },
];

/** Présentation annotée : le verre au centre, les repères de part et d'autre,
 *  reliés par un filet qui se trace vers l'image à l'entrée dans le champ. */
export default function GlassDetail() {
  return (
    <section className="relative overflow-hidden px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease }}
          className="text-center"
        >
          <h2 className="engraved text-[24px] leading-tight text-fg sm:text-[32px]">
            Le soin du détail
          </h2>
          <p className="engraved mt-3.5 text-[15px] leading-tight tracking-[0.16em] text-gold sm:text-[19px]">
            Tout se joue dans le verre
          </p>
        </motion.div>

        <div className="mt-14 grid items-center gap-y-14 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-10">
          {/* Colonne gauche */}
          <ul className="order-2 space-y-12 lg:order-1">
            {LEFT.map((c, i) => (
              <Callout key={c.title} side="left" delay={0.5 + i * 0.18} {...c} />
            ))}
          </ul>

          {/* Le verre */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.6, ease }}
            className="relative order-1 mx-auto w-full max-w-[19rem] lg:order-2 lg:w-[19rem]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgb(var(--gold) / 0.18), transparent 62%)",
              }}
            />
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.6rem]">
              <Image
                src="/images/gallery/cocktail-02.jpg"
                alt="Un cocktail signature Moonlight"
                fill
                sizes="(max-width: 1024px) 100vw, 19rem"
                className="object-cover"
              />
            </div>
          </motion.figure>

          {/* Colonne droite */}
          <ul className="order-3 space-y-12">
            {RIGHT.map((c, i) => (
              <Callout key={c.title} side="right" delay={0.5 + i * 0.18} {...c} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Callout({
  title,
  note,
  side,
  delay,
}: {
  title: string;
  note: string;
  side: "left" | "right";
  delay: number;
}) {
  const isLeft = side === "left";
  return (
    <motion.li
      initial={{ opacity: 0, x: isLeft ? -18 : 18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay, ease }}
      className={`flex items-center gap-5 ${
        isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}
    >
      <div
        className={`min-w-0 flex-1 lg:flex-none lg:w-[15rem] ${
          isLeft ? "lg:text-right" : "lg:text-left"
        }`}
      >
        <h3 className="engraved text-[14px] leading-snug text-fg">{title}</h3>
        <p className="mt-2 font-sans text-[12px] font-light leading-[1.8] text-muted">
          {note}
        </p>
      </div>

      {/* Le filet occupe tout l'espace restant jusqu'au verre : à longueur
          fixe, il flottait dans le vide sans rien relier. Masqué en dessous du
          grand écran, où les colonnes disparaissent. */}
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.1, delay: delay + 0.25, ease }}
        className={`hidden h-px min-w-[2rem] flex-1 lg:block ${
          isLeft
            ? "origin-left bg-gradient-to-r from-gold/10 to-gold/70"
            : "origin-right bg-gradient-to-l from-gold/10 to-gold/70"
        }`}
      />
      <motion.span
        aria-hidden
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: delay + 0.9, ease }}
        className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-gold lg:block"
      />
    </motion.li>
  );
}
