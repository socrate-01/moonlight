"use client";

import { useState } from "react";
import { addMailingContacts } from "@/lib/mailing";

/** Ajout d'adresses au carnet, une par une ou par paquet collé.
 *
 *  Le retour est immédiat et détaillé : combien sont entrées, lesquelles ont
 *  été refusées. Refuser tout le collage pour une seule faute de frappe est le
 *  comportement le plus agaçant qu'on puisse offrir ici. */
export default function AddContacts() {
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !raw.trim()) return;
    setBusy(true);
    setError("");
    setAdded(null);
    setRejected([]);
    try {
      const result = await addMailingContacts(raw);
      setAdded(result.added);
      setRejected(result.rejected);
      if (result.added > 0) setRaw("");
    } catch (err) {
      console.error(err);
      setError("Enregistrement impossible. Vérifiez les règles Firestore.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-fg/10 bg-surface p-6">
      <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">
        Ajouter des adresses
      </p>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={3}
        placeholder="une@exemple.com, deux@exemple.com&#10;trois@exemple.com"
        className="mt-4 w-full resize-y rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[11px] font-light text-muted">
          Séparées par des espaces, virgules, points-virgules ou retours à la ligne.
        </p>
        <button
          type="submit"
          disabled={busy || !raw.trim()}
          className="rounded-full bg-gold px-5 py-2 font-sans text-[11px] uppercase tracking-wide2 text-night transition disabled:opacity-40"
        >
          {busy ? "Ajout…" : "Ajouter"}
        </button>
      </div>

      {added !== null && (
        <p className="mt-4 font-sans text-[12px] text-fg">
          {added === 0
            ? "Aucune adresse ajoutée."
            : `${added} adresse${added > 1 ? "s" : ""} enregistrée${added > 1 ? "s" : ""}.`}
          {rejected.length > 0 && (
            <span className="mt-1 block text-terracotta">
              Refusée{rejected.length > 1 ? "s" : ""} : {rejected.join(", ")}
            </span>
          )}
        </p>
      )}

      {error && <p className="mt-4 font-sans text-[12px] text-terracotta">{error}</p>}
    </form>
  );
}
