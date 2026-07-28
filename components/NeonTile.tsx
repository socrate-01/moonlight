"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function NeonTile({
  src,
  index = 0,
}: {
  src: string;
  index?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.figure
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 34, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="neon-tile group"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.08rem]">
        <Image
          src={src}
          alt="Cocktail signature Moonlight"
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </motion.figure>
  );
}
