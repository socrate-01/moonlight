"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import {
  fetchGalleryPage,
  PAGE_SIZE,
  type GalleryAlbum,
  type GalleryPhoto,
} from "@/lib/gallery";
import { downloadUrl } from "@/lib/media";

const ease = [0.22, 1, 0.36, 1] as const;
type Snap = QueryDocumentSnapshot<DocumentData>;

/** Mosaïque paginée des photos déposées depuis l'admin.
 *
 *  Vingt clichés par page. Charger toute une soirée d'un coup ferait peser
 *  plusieurs centaines d'images sur le premier rendu, pour un visiteur qui en
 *  regardera dix. La pagination avance par curseur Firestore ; « Précédent »
 *  s'appuie sur une pile de curseurs, la base ne sachant pas reculer seule. */
export default function GalleryGrid({
  album = "inauguration",
}: {
  album?: GalleryAlbum;
}) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  /** cursors[n] = curseur à passer pour obtenir la page n. cursors[0] = null. */
  const cursors = useRef<(Snap | null)[]>([null]);
  const top = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (target: number) => {
      setLoading(true);
      setFailed(false);
      try {
        const res = await fetchGalleryPage(album, cursors.current[target] ?? null);
        setPhotos(res.photos);
        setHasMore(res.hasMore);
        cursors.current[target + 1] = res.cursor;
        setPage(target);
      } catch (err) {
        console.error("[galerie] chargement impossible", err);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [album]
  );

  useEffect(() => {
    cursors.current = [null];
    load(0);
  }, [load]);

  const go = (target: number) => {
    load(target);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---------------- Visionneuse ---------------- */

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) =>
      setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  /* ---------------- Rendus d'attente ---------------- */

  if (loading && photos.length === 0) {
    return (
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-fg/[0.06]"
            style={{ height: `${180 + ((i * 47) % 140)}px` }}
          />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <p className="rounded-2xl border border-fg/10 bg-surface/50 py-16 text-center font-sans text-[13px] font-light text-muted">
        Les photos n&apos;ont pas pu être chargées. Réessayez dans un instant.
      </p>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-fg/15 bg-surface/30 py-20 text-center">
        <span className="text-4xl">🌙</span>
        <p className="engraved mt-6 text-[18px] text-fg">Les photos arrivent</p>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[13px] font-light leading-[1.9] text-muted">
          Les clichés de la soirée sont en cours de sélection. Revenez très
          bientôt, ils seront tous ici.
        </p>
      </div>
    );
  }

  const first = page * PAGE_SIZE + 1;
  const last = page * PAGE_SIZE + photos.length;

  return (
    <>
      <div ref={top} className="scroll-mt-28" />

      {/* Mosaïque en colonnes : les hauteurs varient d'elles-mêmes et le
          rythme reste naturel, sans recadrage brutal. */}
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {photos.map((p, i) => (
          <motion.figure
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.035, 0.4), duration: 0.6, ease }}
            className="group relative block break-inside-avoid overflow-hidden rounded-2xl bg-surface/50"
          >
            <button
              onClick={() => setOpen(i)}
              aria-label={p.caption || `Photo ${first + i}`}
              className="block w-full"
            >
              <Image
                src={p.url}
                alt={p.caption || "Soirée Moonlight Cocktail Bar"}
                width={p.width}
                height={p.height}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-auto w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.07]"
              />
              {/* Voile qui monte au survol : la légende et l'action n'existent
                  que quand on s'intéresse à la photo. */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>

            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <span className="font-sans text-[11px] font-light leading-snug text-white/90 drop-shadow">
                {p.caption}
              </span>
              <a
                href={downloadUrl(p.url)}
                download
                onClick={(e) => e.stopPropagation()}
                title="Télécharger cette photo"
                aria-label="Télécharger cette photo"
                className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition-colors duration-300 hover:bg-gold hover:text-night"
              >
                <DownloadIcon />
              </a>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-14 flex flex-col items-center gap-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-muted">
          {first}–{last} · page {page + 1}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => go(page - 1)}
            disabled={page === 0 || loading}
            className="flex items-center gap-2 rounded-full border border-fg/20 px-6 py-3 font-sans text-[11px] uppercase tracking-[0.2em] text-fg transition-all duration-500 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-fg/20 disabled:hover:text-fg"
          >
            <span aria-hidden>←</span> Précédent
          </button>
          <button
            onClick={() => go(page + 1)}
            disabled={!hasMore || loading}
            className="flex items-center gap-2 rounded-full border border-fg/20 px-6 py-3 font-sans text-[11px] uppercase tracking-[0.2em] text-fg transition-all duration-500 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-fg/20 disabled:hover:text-fg"
          >
            Suivant <span aria-hidden>→</span>
          </button>
        </div>
        {loading && (
          <p className="font-sans text-[11px] font-light text-muted">Chargement…</p>
        )}
      </div>

      {/* Visionneuse plein écran */}
      <AnimatePresence>
        {open !== null && photos[open] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={close}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-xl sm:p-10"
          >
            <button
              onClick={close}
              aria-label="Fermer"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white hover:text-black"
            >
              ✕
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Photo précédente"
              className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-2xl text-white/70 transition-colors hover:bg-white hover:text-black sm:left-8"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Photo suivante"
              className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-2xl text-white/70 transition-colors hover:bg-white hover:text-black sm:right-8"
            >
              ›
            </button>

            <motion.figure
              key={photos[open].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-full w-full max-w-5xl flex-col items-center gap-5"
            >
              <Image
                src={photos[open].url}
                alt={photos[open].caption || "Soirée Moonlight Cocktail Bar"}
                width={photos[open].width}
                height={photos[open].height}
                sizes="100vw"
                priority
                className="max-h-[74vh] w-auto rounded-2xl object-contain"
              />
              <figcaption className="flex flex-wrap items-center justify-center gap-5 text-center">
                {photos[open].caption && (
                  <span className="font-sans text-[12px] font-light text-white/70">
                    {photos[open].caption}
                  </span>
                )}
                <a
                  href={downloadUrl(photos[open].url)}
                  download
                  className="flex items-center gap-2.5 rounded-full border border-white/30 px-6 py-2.5 font-sans text-[11px] uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:bg-gold hover:text-night"
                >
                  <DownloadIcon /> Télécharger
                </a>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
