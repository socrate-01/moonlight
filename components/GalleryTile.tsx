"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export default function GalleryTile({
  src,
  index = 0,
  className = "",
  ratio = "aspect-[3/4]",
}: {
  src: string;
  index?: number;
  className?: string;
  ratio?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <motion.figure
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 44, filter: "blur(14px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.05, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-[1.4rem] border border-fg/12 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className={`relative ${ratio} overflow-hidden`}>
        {/* oversized inner layer so the parallax shift never reveals edges */}
        <motion.div style={reduce ? undefined : { y }} className="absolute inset-[-8%]">
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.05]"
          />
        </motion.div>
        {/* hover sheen + gold frame */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-transparent transition-all duration-500 group-hover:ring-gold/50" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </motion.figure>
  );
}
