"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { uploadImage } from "@/lib/media";
import { prepareImage } from "@/lib/image";
import {
  deleteCocktail,
  saveCocktail,
  slugify,
  watchCocktails,
  type DbCocktail,
} from "@/lib/cocktails";
import { COCKTAIL_FAMILIES, type Cocktail } from "@/lib/site";

type Draft = {
  id?: string;
  name: string;
  description: string;
  family: Cocktail["family"];
  imageUrl: string;
  pathname: string;
};

const EMPTY: Draft = {
  name: "",
  description: "",
  family: "Signature",
  imageUrl: "",
  pathname: "",
};

export default function CocktailsAdmin() {
  const [items, setItems] = useState<DbCocktail[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => watchCocktails(setItems), []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      // Même redimensionnement que la galerie : un original d'appareil
      // dépasserait la limite de la requête, et une fiche de cocktail n'a
      // pas besoin de six mille pixels de large.
      const prepared = await prepareImage(file);
      const up = await uploadImage(prepared.file, "cocktails");
      setDraft((d) => ({ ...d, imageUrl: up.url, pathname: up.pathname }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Téléversement refusé.");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const reset = () => {
    setDraft(EMPTY);
    if (input.current) input.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !draft.name.trim() || !draft.imageUrl) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveCocktail({
        id: draft.id,
        slug: draft.id ?? slugify(draft.name),
        name: draft.name.trim(),
        description: draft.description.trim(),
        family: draft.family,
        imageUrl: draft.imageUrl,
        pathname: draft.pathname,
        // Rang décroissant : la dernière création passe en tête de carte.
        order: (items[0]?.order ?? 0) + 1,
      });
      setNotice(draft.id ? "Cocktail mis à jour." : "Cocktail ajouté à la carte.");
      reset();
    } catch (err) {
      console.error(err);
      setError("Enregistrement impossible. Vérifiez les règles Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (c: DbCocktail) => {
    setDraft({
      id: c.id,
      name: c.name,
      description: c.description,
      family: c.family,
      imageUrl: c.imageUrl,
      pathname: c.pathname,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (c: DbCocktail) => {
    if (!window.confirm(`Retirer « ${c.name} » de la carte ?`)) return;
    try {
      await deleteCocktail(c);
      if (draft.id === c.id) reset();
    } catch (err) {
      console.error(err);
      setError("Suppression impossible.");
    }
  };

  const ready = draft.name.trim() && draft.imageUrl && !uploading;

  return (
    <AdminShell title="Cocktails">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Formulaire */}
        <form onSubmit={submit} className="rounded-2xl border border-fg/10 bg-surface p-6">
          <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">
            {draft.id ? "Modifier le cocktail" : "Nouveau cocktail"}
          </p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Nom
              </span>
              <input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Clair de Lune"
                className="w-full rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Catégorie
              </span>
              <div className="flex flex-wrap gap-2">
                {COCKTAIL_FAMILIES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => set("family", f)}
                    className={`rounded-full px-4 py-2 font-sans text-[11px] uppercase tracking-wide2 transition ${
                      draft.family === f
                        ? "bg-gold text-night"
                        : "border border-fg/25 text-fg hover:border-gold"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Description
              </span>
              <textarea
                rows={4}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Gin infusé à la fleur de sureau, citron vert, blanc d'œuf…"
                className="w-full resize-y rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm leading-[1.8] text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
              />
            </label>

            <div>
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Photo
              </span>
              {draft.imageUrl ? (
                <div className="relative aspect-[4/5] w-full max-w-[14rem] overflow-hidden rounded-xl">
                  <Image
                    src={draft.imageUrl}
                    alt={draft.name || "Aperçu"}
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, imageUrl: "", pathname: "" }))}
                    className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 font-sans text-[10px] uppercase tracking-wide2 text-white backdrop-blur"
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <input
                  ref={input}
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => pickImage(e.target.files?.[0])}
                  className="block w-full cursor-pointer font-sans text-[12px] text-muted file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gold file:px-5 file:py-2.5 file:font-sans file:text-[11px] file:uppercase file:tracking-wide2 file:text-night disabled:opacity-50"
                />
              )}
              {uploading && (
                <p className="mt-2 font-sans text-[12px] text-muted">Téléversement…</p>
              )}
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <button
              type="submit"
              disabled={!ready || saving}
              className="rounded-full bg-gold px-6 py-2.5 font-sans text-[11px] uppercase tracking-wide2 text-night transition disabled:opacity-40"
            >
              {saving ? "Enregistrement…" : draft.id ? "Mettre à jour" : "Ajouter"}
            </button>
            {draft.id && (
              <button
                type="button"
                onClick={reset}
                className="font-sans text-[11px] uppercase tracking-wide2 text-muted underline-offset-4 transition hover:text-fg hover:underline"
              >
                Annuler
              </button>
            )}
          </div>

          {notice && <p className="mt-4 font-sans text-[12px] text-fg">{notice}</p>}
          {error && <p className="mt-4 font-sans text-[12px] text-terracotta">{error}</p>}
        </form>

        {/* Carte enregistrée */}
        <section>
          <p className="mb-5 font-sans text-[10px] uppercase tracking-luxe text-gold">
            Sur la carte · {items.length}
          </p>

          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-fg/15 py-16 text-center font-sans text-[13px] font-light text-muted">
              Aucun cocktail saisi. La carte de référence du site reste affichée
              tant que rien n&apos;est ajouté ici.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((c) => (
                <article
                  key={c.id}
                  className="overflow-hidden rounded-2xl border border-fg/10 bg-surface"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={c.imageUrl}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 font-sans text-[9px] uppercase tracking-wide2 text-white backdrop-blur">
                      {c.family}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="engraved text-[15px] text-fg">{c.name}</h3>
                    <p className="mt-2 line-clamp-3 font-sans text-[12px] font-light leading-[1.8] text-muted">
                      {c.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => edit(c)}
                        className="font-sans text-[10px] uppercase tracking-wide2 text-gold underline-offset-4 transition hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => remove(c)}
                        className="font-sans text-[10px] uppercase tracking-wide2 text-terracotta/70 underline-offset-4 transition hover:text-terracotta hover:underline"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
