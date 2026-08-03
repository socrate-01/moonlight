"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { deleteReservation, setPresent, type Reservation } from "@/lib/reservations";

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

export default function Dashboard() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<"all" | "present">("all");
  const [q, setQ] = useState("");
  const [alcoholOnly, setAlcoholOnly] = useState(false);
  const [allergyOnly, setAllergyOnly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const qy = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    return onSnapshot(qy, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as Reservation)));
    });
  }, []);

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
    <div className="min-h-screen bg-bg">
      {/* header */}
      <header className="sticky top-0 z-10 border-b border-fg/10 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <span className="font-display text-xl tracking-[0.14em] text-fg">MOONLIGHT</span>
            <span className="ml-3 font-sans text-[10px] uppercase tracking-luxe text-gold">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/scan"
              className="rounded-full border border-gold/50 px-4 py-2 font-sans text-[11px] uppercase tracking-wide2 text-gold transition hover:bg-gold hover:text-night"
            >
              Scanner
            </Link>
            <button
              onClick={() => signOut(auth)}
              className="rounded-full border border-fg/25 px-4 py-2 font-sans text-[11px] uppercase tracking-wide2 text-fg transition hover:bg-fg hover:text-bg"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
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
      </main>
    </div>
  );
}
