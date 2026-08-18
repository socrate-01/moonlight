"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchGalleryPage, type GalleryAlbum } from "@/lib/gallery";

type Shot = { src: string; alt: string };

/** Triptyque d'aperçu de la carte « Revivez notre cérémonie ».
 *
 *  Il tire ses trois images de la galerie réelle plutôt que d'un jeu figé dans
 *  le code : ce que l'on met en avant suit alors ce qui a été déposé depuis
 *  l'admin, sans redéploiement.
 *
 *  Les visuels passés en `fallback` tiennent la place pendant le chargement et
 *  restent affichés si la galerie est encore vide — la carte ne doit jamais
 *  apparaître trouée. */
export default function GalleryPreview({
  album = "inauguration",
  fallback,
}: {
  album?: GalleryAlbum;
  fallback: string[];
}) {
  const [shots, setShots] = useState<Shot[]>(
    fallback.slice(0, 3).map((src) => ({ src, alt: "Cérémonie de lancement Moonlight" }))
  );

  useEffect(() => {
    let cancelled = false;
    fetchGalleryPage(album)
      .then((page) => {
        const picked = page.photos.slice(0, 3);
        // Moins de trois photos déposées : on garde les visuels de repli
        // plutôt que d'afficher une grille incomplète.
        if (cancelled || picked.length < 3) return;
        setShots(
          picked.map((p) => ({
            src: p.url,
            alt: p.caption || "Cérémonie de lancement Moonlight",
          }))
        );
      })
      .catch(() => {
        /* galerie indisponible : les visuels de repli font l'affaire */
      });
    return () => {
      cancelled = true;
    };
  }, [album]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {shots.map((shot, i) => (
        <div
          key={`${shot.src}-${i}`}
          className={`relative overflow-hidden rounded-2xl ${
            i === 1 ? "aspect-[3/5] sm:-translate-y-5" : "aspect-[3/4]"
          }`}
        >
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            sizes="(max-width: 1024px) 33vw, 18vw"
            className="object-cover transition-transform duration-[1.6s] hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
}
