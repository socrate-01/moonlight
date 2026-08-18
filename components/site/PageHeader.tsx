"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** En-tête commun aux pages intérieures : halos animés, filet doré, titre
 *  gravé qui se révèle. Donne au site une entrée de page reconnaissable. */
export default function PageHeader({
  eyebrow,
  title,
  accent,
  lead,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
}) {
  return (
    <header className="relative overflow-hidden px-6 pb-16 pt-36 lg:px-10 lg:pb-24 lg:pt-44">
      {/* Une seule lueur dorée, diffuse — les halos violets et orangés
          juraient avec la photographie ambrée de la bannière. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--gold) / 0.14), transparent 62%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="font-sans text-[10px] uppercase tracking-[0.42em] text-gold"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease }}
          className="engraved mt-7 text-[30px] font-normal leading-[1.2] text-fg sm:text-[44px] lg:text-[54px]"
        >
          {title}
          {accent && (
            <>
              <br />
              <span className="text-gradient">{accent}</span>
            </>
          )}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.9, ease }}
          className="rule mx-auto my-9 max-w-[7rem]"
        />

        {lead && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.9 }}
            className="mx-auto max-w-2xl font-sans text-[15px] font-light leading-[2] text-muted"
          >
            {lead}
          </motion.p>
        )}
      </div>
    </header>
  );
}
