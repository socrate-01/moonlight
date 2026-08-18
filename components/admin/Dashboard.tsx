"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminShell from "@/components/admin/AdminShell";
import { deleteReservation, setPresent, type Reservation } from "@/lib/reservations";
import { countAttendees, syncAttendees, TEST_EMAILS } from "@/lib/attendees";

function fmt(ts?: { toDate: () => Date } | null) {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Date complète (avec année) pour l'export. */
function fmtFull(ts?: { toDate: () => Date } | null) {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleString("fr-FR");
  } catch {
    return "";
  }
}

/** Échappe une valeur CSV. Le formulaire étant public, on neutralise aussi les
 *  formules (=, +, -, @) qu'Excel exécuterait à l'ouverture. */
function csvCell(value: unknown) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Export de la liste complète, séparateur « ; » et BOM UTF-8 pour qu'Excel
 *  ouvre le fichier avec les accents intacts. */
function toCsv(rows: Reservation[]) {
  const headers = [
    "Nom",
    "Email",
    "Téléphone",
    "Référence",
    "Alcool",
    "Allergies",
    "Détail allergies",
    "Présent",
    "Heure d'arrivée",
    "Date d'inscription",
  ];
  const lines = rows.map((r) =>
    [
      r.name,
      r.email,
      r.phone,
      r.ref,
      r.alcohol === "oui" ? "Oui" : "Non",
      r.allergies === "oui" ? "Oui" : "Non",
      r.allergies === "oui" ? r.allergyDetails || "" : "",
      r.present ? "Oui" : "Non",
      fmtFull(r.presentAt),
      fmtFull(r.createdAt),
    ]
      .map(csvCell)
      .join(";")
  );
  return "﻿" + [headers.map(csvCell).join(";"), ...lines].join("\r\n");
}

export default function Dashboard() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<"all" | "present">("all");
  const [q, setQ] = useState("");
  const [alcoholOnly, setAlcoholOnly] = useState(false);
  const [allergyOnly, setAllergyOnly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    const qy = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    return onSnapshot(qy, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as Reservation)));
    });
  }, []);

  useEffect(() => {
    countAttendees().then(setAllowed).catch(() => setAllowed(null));
  }, []);

  /** Recalcule la liste blanche des avis à partir des inscrits actuels (plus
   *  les adresses de test). À relancer après de nouvelles inscriptions. */
  const sync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const emails = [...items.map((i) => i.email), ...TEST_EMAILS];
      const { total, added, removed } = await syncAttendees(emails);
      setAllowed(total);
      setSyncMsg(
        added || removed
          ? `${total} adresses autorisées (${added} ajoutée(s), ${removed} retirée(s)).`
          : `${total} adresses autorisées — déjà à jour.`
      );
    } catch (err) {
      console.error(err);
      setSyncMsg("Échec de la synchronisation. Vérifiez les règles Firestore.");
    } finally {
      setSyncing(false);
    }
  };

  const presentCount = useMemo(() => items.filter((i) => i.present).length, [items]);
  const alcoholCount = useMemo(
    () => items.filter((i) => i.alcohol === "oui").length,
    [items]
  );
  const allergyCount = useMemo(
    () => items.filter((i) => i.allergies === "oui").length,
    [items]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .filter((i) => (tab === "present" ? i.present : true))
      .filter((i) => (alcoholOnly ? i.alcohol === "oui" : true))
      .filter((i) => (allergyOnly ? i.allergies === "oui" : true))
      .filter((i) =>
        !term
          ? true
          : `${i.name} ${i.email} ${i.phone} ${i.ref}`.toLowerCase().includes(term)
      );
  }, [items, tab, q, alcoholOnly, allergyOnly]);

  const toggle = async (r: Reservation) => {
    setBusy(r.id);
    try {
      await setPresent(r.id, !r.present);
    } finally {
      setBusy(null);
    }
  };

  /** Télécharge la liste complète (toutes les réservations, sans tenir compte
   *  des filtres affichés). */
  const exportCsv = () => {
    if (items.length === 0) return;
    const blob = new Blob([toCsv(items)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moonlight-reservations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const remove = async (r: Reservation) => {
    if (
      !window.confirm(
        `Supprimer définitivement la réservation de ${r.name} ? Cette action est irréversible.`
      )
    )
      return;
    setBusy(r.id);
    try {
      await deleteReservation(r.id);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell
      title="Réservations"
      /* La navigation est passée dans le menu latéral ; seule l'action propre
         à cet écran reste en haut de page. */
      actions={
        <button
          onClick={exportCsv}
          disabled={items.length === 0}
          title="Télécharger la liste complète au format CSV"
          className="flex items-center gap-2 rounded-full border border-fg/25 px-4 py-2 font-sans text-[11px] uppercase tracking-wide2 text-fg transition hover:bg-fg hover:text-bg disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          Exporter · {items.length}
        </button>
      }
    >
      <div className="mx-auto max-w-5xl">
        {/* tabs + counts */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setTab("all")}
            className={`rounded-full px-5 py-2 font-sans text-[12px] uppercase tracking-wide2 transition ${
              tab === "all" ? "bg-gold text-night" : "border border-fg/25 text-fg"
            }`}
          >
            Réservations · {items.length}
          </button>
          <button
            onClick={() => setTab("present")}
            className={`rounded-full px-5 py-2 font-sans text-[12px] uppercase tracking-wide2 transition ${
              tab === "present" ? "bg-gold text-night" : "border border-fg/25 text-fg"
            }`}
          >
            Présents · {presentCount}
          </button>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un nom, email, référence…"
            className="ml-auto min-w-0 flex-1 rounded-full border border-fg/20 bg-surface px-5 py-2 font-sans text-sm text-fg placeholder:text-fg/30 outline-none transition focus:border-gold sm:max-w-xs"
          />
        </div>

        {/* filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="font-sans text-[10px] uppercase tracking-luxe text-muted">
            Filtres
          </span>
          <button
            onClick={() => setAlcoholOnly((v) => !v)}
            className={`rounded-full px-4 py-1.5 font-sans text-[11px] uppercase tracking-wide2 transition ${
              alcoholOnly
                ? "bg-gold text-night"
                : "border border-fg/25 text-fg hover:border-gold"
            }`}
          >
            Alcool · {alcoholCount}
          </button>
          <button
            onClick={() => setAllergyOnly((v) => !v)}
            className={`rounded-full px-4 py-1.5 font-sans text-[11px] uppercase tracking-wide2 transition ${
              allergyOnly
                ? "bg-terracotta text-white"
                : "border border-fg/25 text-fg hover:border-terracotta"
            }`}
          >
            Allergies · {allergyCount}
          </button>
          {(alcoholOnly || allergyOnly) && (
            <button
              onClick={() => {
                setAlcoholOnly(false);
                setAllergyOnly(false);
              }}
              className="font-sans text-[11px] uppercase tracking-wide2 text-muted underline-offset-4 transition hover:text-fg hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* liste blanche du formulaire d'avis */}
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-fg/10 bg-surface px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[11px] uppercase tracking-wide2 text-gold">
              Accès au formulaire d&apos;avis
            </p>
            <p className="mt-1 font-sans text-[12px] text-muted">
              {allowed === null
                ? "Liste blanche non initialisée — synchronisez pour ouvrir /feedback."
                : `${allowed} adresse${allowed > 1 ? "s" : ""} autorisée${
                    allowed > 1 ? "s" : ""
                  }. À relancer après de nouvelles inscriptions.`}
              {syncMsg && <span className="ml-2 text-fg">{syncMsg}</span>}
            </p>
          </div>
          <button
            onClick={sync}
            disabled={syncing || items.length === 0}
            className="shrink-0 rounded-full border border-gold/50 px-4 py-2 font-sans text-[11px] uppercase tracking-wide2 text-gold transition hover:bg-gold hover:text-night disabled:opacity-40"
          >
            {syncing ? "Synchronisation…" : "Synchroniser"}
          </button>
        </div>

        {/* list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="py-16 text-center font-sans text-sm text-muted">
              Aucune réservation.
            </p>
          )}

          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-4 rounded-xl border border-fg/10 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl text-fg">{r.name}</span>
                  {r.present && (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-wide2 text-emerald-400">
                      Présent {fmt(r.presentAt)}
                    </span>
                  )}
                </div>
                <div className="mt-1 truncate font-sans text-[13px] text-muted">
                  {r.email} · {r.phone}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 font-sans text-[10px] uppercase tracking-wide2">
                  <span className="rounded border border-fg/15 px-2 py-0.5 text-muted">
                    {r.ref}
                  </span>
                  <span className="rounded border border-fg/15 px-2 py-0.5 text-muted">
                    Alcool : {r.alcohol === "oui" ? "Oui" : "Non"}
                  </span>
                  <span
                    className={`rounded border px-2 py-0.5 ${
                      r.allergies === "oui"
                        ? "border-terracotta/50 text-terracotta"
                        : "border-fg/15 text-muted"
                    }`}
                  >
                    Allergies : {r.allergies === "oui" ? r.allergyDetails || "Oui" : "Non"}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => toggle(r)}
                  disabled={busy === r.id}
                  className={`rounded-full px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide2 transition disabled:opacity-60 ${
                    r.present
                      ? "border border-fg/25 text-fg hover:bg-fg hover:text-bg"
                      : "bg-gold text-night hover:brightness-110"
                  }`}
                >
                  {busy === r.id
                    ? "…"
                    : r.present
                    ? "Annuler"
                    : "Marquer présent"}
                </button>
                <button
                  onClick={() => remove(r)}
                  disabled={busy === r.id}
                  aria-label={`Supprimer ${r.name}`}
                  title="Supprimer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-terracotta/40 text-terracotta transition hover:bg-terracotta hover:text-white disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
