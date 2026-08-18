"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { uploadImage } from "@/lib/media";
import { formatBytes, prepareImage } from "@/lib/image";
import {
  addGalleryPhoto,
  deleteGalleryPhoto,
  listAllGallery,
  updateGalleryPhoto,
  type GalleryAlbum,
  type GalleryPhoto,
} from "@/lib/gallery";

const ALBUMS: { value: GalleryAlbum; label: string }[] = [
  { value: "inauguration", label: "Inauguration" },
  { value: "creations", label: "Créations" },
];

export default function GalleryAdmin() {
  const [album, setAlbum] = useState<GalleryAlbum>("inauguration");
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setPhotos(await listAllGallery(album));
    } catch (err) {
      console.error(err);
      setError("Lecture impossible. Vérifiez les règles Firestore.");
    } finally {
      setLoading(false);
    }
  }, [album]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Dépôt multiple.
   *
   *  Chaque photo est redimensionnée dans le navigateur avant de partir : les
   *  originaux d'appareil dépassent régulièrement la limite de la requête, et
   *  imposeraient de toute façon leur poids à chaque visiteur.
   *
   *  Les fichiers partent l'un après l'autre. En parallèle, une sélection de
   *  trente photos saturerait la connexion et l'on perdrait le fil de ce qui a
   *  réussi. */
  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || busy) return;
    setBusy(true);
    setError("");
    setSaved("");
    setProgress({ done: 0, total: files.length });

    // Le rang décroissant place les nouveaux dépôts en tête de galerie.
    let rank = (photos[0]?.order ?? 0) + 1;
    const failures: string[] = [];
    let bytesBefore = 0;
    let bytesAfter = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const prepared = await prepareImage(file);
        const up = await uploadImage(prepared.file, "galerie");
        await addGalleryPhoto({
          url: up.url,
          pathname: up.pathname,
          caption: "",
          album,
          width: prepared.width,
          height: prepared.height,
          order: rank++,
        });
        bytesBefore += prepared.originalBytes;
        bytesAfter += prepared.file.size;
      } catch (err) {
        console.error(err);
        // On remonte la raison, pas seulement le nom : « refusé » sans motif
        // ne dit pas s'il faut réexporter le fichier ou se reconnecter.
        const reason = err instanceof Error ? err.message : "erreur inconnue";
        failures.push(`${file.name} — ${reason}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }

    if (failures.length) setError(failures.join(" · "));
    if (bytesAfter > 0 && bytesBefore > bytesAfter) {
      setSaved(
        `${formatBytes(bytesBefore)} réduits à ${formatBytes(bytesAfter)} avant envoi.`
      );
    }
    if (input.current) input.current.value = "";
    setBusy(false);
    refresh();
  };

  const remove = async (p: GalleryPhoto) => {
    if (!window.confirm("Supprimer définitivement cette photo ?")) return;
    try {
      await deleteGalleryPhoto(p);
      setPhotos((list) => list.filter((x) => x.id !== p.id));
    } catch (err) {
      console.error(err);
      setError("Suppression impossible.");
    }
  };

  /** Échange les rangs de deux photos : c'est l'ordre d'accrochage. */
  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= photos.length) return;
    const a = photos[index];
    const b = photos[target];
    const next = [...photos];
    next[index] = { ...b, order: a.order };
    next[target] = { ...a, order: b.order };
    setPhotos(next);
    await Promise.all([
      updateGalleryPhoto(a.id, { order: b.order }, a),
      updateGalleryPhoto(b.id, { order: a.order }, b),
    ]);
  };

  return (
    <AdminShell title="Galerie">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {ALBUMS.map((a) => (
            <button
              key={a.value}
              onClick={() => setAlbum(a.value)}
              className={`rounded-full px-5 py-2 font-sans text-[12px] uppercase tracking-wide2 transition ${
                album === a.value
                  ? "bg-gold text-night"
                  : "border border-fg/25 text-fg hover:border-gold"
              }`}
            >
              {a.label}
            </button>
          ))}
          <span className="ml-auto font-sans text-[11px] uppercase tracking-wide2 text-muted">
            {photos.length} photo{photos.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="rounded-2xl border border-dashed border-fg/20 bg-surface p-8 text-center">
          <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">
            Ajouter des photos
          </p>
          <p className="mx-auto mt-3 max-w-md font-sans text-[12px] font-light leading-[1.8] text-muted">
            JPEG, PNG, WebP ou AVIF. Sélection multiple acceptée : les photos
            sont redimensionnées ici même avant l&apos;envoi, vous pouvez donc
            déposer vos originaux sans les préparer.
          </p>
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            onChange={(e) => onFiles(e.target.files)}
            className="mx-auto mt-6 block w-full max-w-sm cursor-pointer font-sans text-[12px] text-muted file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gold file:px-5 file:py-2.5 file:font-sans file:text-[11px] file:uppercase file:tracking-wide2 file:text-night disabled:opacity-50"
          />
          {busy && (
            <p className="mt-4 font-sans text-[12px] text-fg">
              Envoi {progress.done} / {progress.total}…
            </p>
          )}
          {saved && (
            <p className="mt-4 font-sans text-[12px] text-fg">{saved}</p>
          )}
          {error && (
            <p className="mx-auto mt-4 max-w-lg font-sans text-[12px] leading-relaxed text-terracotta">
              {error}
            </p>
          )}
        </div>

        {loading ? (
          <p className="py-20 text-center font-sans text-[13px] text-muted">
            Chargement…
          </p>
        ) : photos.length === 0 ? (
          <p className="py-20 text-center font-sans text-[13px] font-light text-muted">
            Aucune photo dans cet album.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p, i) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-fg/10 bg-surface"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={p.url}
                    alt={p.caption || "Photo"}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <input
                    defaultValue={p.caption}
                    placeholder="Légende (facultatif)"
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== p.caption) {
                        updateGalleryPhoto(p.id, { caption: v }).catch(console.error);
                      }
                    }}
                    className="w-full rounded-xl border border-fg/20 bg-bg px-3 py-2 font-sans text-[12px] text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        title="Avancer"
                        className="rounded-full border border-fg/20 px-3 py-1 font-sans text-[11px] text-fg transition hover:border-gold disabled:opacity-25"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === photos.length - 1}
                        title="Reculer"
                        className="rounded-full border border-fg/20 px-3 py-1 font-sans text-[11px] text-fg transition hover:border-gold disabled:opacity-25"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      onClick={() => remove(p)}
                      className="font-sans text-[10px] uppercase tracking-wide2 text-terracotta/70 underline-offset-4 transition hover:text-terracotta hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
