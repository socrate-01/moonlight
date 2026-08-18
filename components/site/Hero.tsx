"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { scrollToElement } from "@/lib/scroll";

const ease = [0.22, 1, 0.36, 1] as const;

/** Bannière construite par soustraction : une photo plein cadre, un seul mot
 *  posé dessus, et de la micro-typographie en marge. Pas de voile sombre
 *  généralisé ni de cartes — c'est le vide autour du mot qui donne la force. */
export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* Photo plein cadre, très lentement agrandie pour qu'elle respire. */}
      <motion.div
        aria-hidden
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/images/banner-cocktail.avif"
          alt=""
          fill
          priority
          sizes="100vw"
          /* En portrait, le cadrage rogne les côtés : on décale légèrement à
             droite pour garder le verre dans le champ. */
          className="object-cover object-[64%_center] sm:object-center"
        />
      </motion.div>

      {/* Deux voiles seulement : en haut pour que la navigation reste lisible,
          en bas pour asseoir le mot. Le centre de l'image reste intact. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black/65 to-transparent"
      />
      {/* Le bas vire au noir opaque : la section suivante démarre sur la même
          valeur, si bien que la photo se dissout dans la page au lieu de s'y
          interrompre net. */}
      {/* Sur téléphone le cadrage remonte le verre, si bien que le titre tombe
          sur la zone la plus claire de la photo et s'y délavait. Le voile y
          monte plus haut et plus dense ; au-delà, le cadrage large redonne du
          sombre sous le texte et l'ancien réglage suffit. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-black via-black/60 to-transparent sm:h-2/3 sm:via-black/45"
      />

      {/* Sur téléphone, le repère de défilement est masqué (voir plus bas) :
          la marge basse n'a donc plus à le dégager et redevient normale. La
          gonfler pour éviter la collision remontait tout le bloc et laissait
          une bande vide sous le texte — le contenu paraissait tassé en haut.
          Au-delà de 640 px le repère réapparaît, et la marge le dégage. */}
      <div className="relative z-10 mx-auto w-full max-w-[110rem] px-6 pb-16 sm:pb-28 lg:px-10 lg:pb-24">
        {/* Nom complet sur deux lignes, dimensionnées pour aboutir à la même
            largeur : le bloc se lit comme un pavé plein, pas comme un titre
            suivi d'un sous-titre. Chaque ligne se lève de sa propre fenêtre. */}
        <h1 className="engraved w-full text-white">
          {[
            { text: "Moonlight", size: "clamp(2.5rem,11.6vw,12.2rem)", delay: 0.3 },
            { text: "Cocktail Bar", size: "clamp(1.85rem,8.6vw,9rem)", delay: 0.44 },
          ].map((l) => (
            <span key={l.text} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                initial={{ y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.5, delay: l.delay, ease }}
                style={{ fontSize: l.size }}
                className="block whitespace-nowrap font-normal leading-[1.06] tracking-[0.02em] sm:leading-[0.98]"
              >
                {l.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          /* Respiration plus large sur téléphone : c'est la seule largeur où
             les deux blocs s'empilent, et où le manque d'air se voit. */
          className="mt-11 flex flex-col gap-10 border-t border-white/15 pt-9 sm:mt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pt-7"
        >
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.36em] text-white/60">
              Bar à cocktails mobile · Montréal
            </p>
            <p className="mt-4 max-w-sm font-sans text-[14px] font-light leading-[2] text-white/70 sm:mt-3 sm:text-[13px] sm:leading-[1.9]">
              Comptoir, verrerie, glace et équipe, installés là où vous célébrez.
            </p>
          </div>

          {/* Empilés et pleine largeur sur téléphone : côte à côte, le bouton
             et le lien se repliaient sur deux lignes désalignées. */}
          <div className="flex w-full flex-col items-stretch gap-5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-4">
            <Link href="/reservation" className="btn-luxe w-full sm:w-auto">
              Réserver une date
            </Link>
            <Link
              href="/nos-cocktails"
              className="group inline-flex items-center justify-center gap-2.5 font-sans text-[11px] uppercase tracking-[0.22em] text-white/80 transition-colors duration-500 hover:text-white sm:justify-start"
            >
              Voir la carte
              <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Repère de défilement : cercle flottant qui glisse jusqu'à la section
          suivante. Le mouvement vertical continu signale qu'il est actionnable
          sans avoir à l'écrire. */}
      {/* Le recentrage vit sur un conteneur, pas sur l'élément animé :
          framer-motion écrit sa propre valeur `transform` pour animer, ce qui
          écraserait un `-translate-x-1/2` posé par une classe. */}
      {/* Masqué sur téléphone : l'écran y est trop court pour loger à la fois
          le titre, les actions et ce repère sans que rien ne se chevauche —
          et sur mobile on fait défiler d'instinct, l'indication ne manque à
          personne. */}
      <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 sm:block">
      <motion.button
        type="button"
        onClick={() => scrollToElement("suite", 1700, 110)}
        aria-label="Aller à la section suivante"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.4 }}
        className="group flex flex-col items-center gap-3"
      >
        {/* Capsule verticale à la manière d'une souris, avec la molette qui
            descend en boucle à l'intérieur. */}
        {/* Le trait est centré explicitement : en position absolue, il ne suit
            pas le centrage flex du parent et se décalait sur la gauche. */}
        <span className="relative block h-11 w-[26px] rounded-full border border-white/45 backdrop-blur-sm transition-colors duration-500 group-hover:border-white">
          <span className="mouse-wheel absolute left-1/2 top-[9px] h-[6px] w-[2px] -translate-x-1/2 rounded-full bg-white/85" />
        </span>
        <span className="font-sans text-[9px] uppercase tracking-[0.28em] text-white/50 transition-colors duration-500 group-hover:text-white/85">
          Découvrir
        </span>
      </motion.button>
      </div>
    </section>
  );
}
