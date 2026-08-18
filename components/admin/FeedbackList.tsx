"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import AdminShell from "@/components/admin/AdminShell";
import {
  deleteFeedback,
  DRESS_CODE_SCALE,
  RATING_QUESTIONS,
  RATING_SCALE,
  RETURN_OPTIONS,
  watchFeedbacks,
  type Feedback,
} from "@/lib/feedback";
import type { Reservation } from "@/lib/reservations";

const ease = [0.22, 1, 0.36, 1] as const;

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

const scaleFor = (key: string) =>
  key === "dressCode" ? DRESS_CODE_SCALE : RATING_SCALE;

const emojiFor = (key: string, value: number) =>
  scaleFor(key).find((s) => s.value === value)?.emoji ?? "";

const labelFor = (key: string, value: number) =>
  scaleFor(key).find((s) => s.value === value)?.label ?? "";

export default function FeedbackList() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [guests, setGuests] = useState<Reservation[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => watchFeedbacks(setItems), []);

  useEffect(
    () =>
      onSnapshot(collection(db, "reservations"), (snap) => {
        setGuests(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as Reservation))
        );
      }),
    []
  );

  /** email normalisé -> nom. Deux inscrits ont saisi « .con » : on indexe aussi
   *  la variante « .com », sinon leur avis s'afficherait sans nom. */
  const namesByEmail = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of guests) {
      const e = (g.email || "").trim().toLowerCase();
      if (!e) continue;
      map.set(e, g.name);
      if (e.endsWith(".con")) map.set(e.slice(0, -4) + ".com", g.name);
    }
    return map;
  }, [guests]);

  const averages = useMemo(() => {
    if (items.length === 0) return null;
    return RATING_QUESTIONS.map((q) => {
      const values = items
        .map((i) => i.ratings?.[q.key])
        .filter((v): v is number => typeof v === "number");
      const avg =
        values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return { ...q, avg };
    });
  }, [items]);

  const returnCounts = useMemo(
    () =>
      RETURN_OPTIONS.map((o) => ({
        ...o,
        count: items.filter((i) => i.returning === o.value).length,
      })),
    [items]
  );

  const remove = async (f: Feedback) => {
    const who = namesByEmail.get((f.email || "").trim().toLowerCase()) || f.email;
    if (
      !window.confirm(
        `Supprimer définitivement l'avis de ${who} ? Cette action est irréversible.`
      )
    )
      return;
    setBusy(f.id);
    try {
      await deleteFeedback(f.id);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell title="Avis">
      {/* L'habillage « prestige » et ses halos restent propres à cet écran ;
          ils vivent maintenant dans le contenu plutôt qu'autour de la page. */}
      <div className="theme-prestige relative -mx-5 -my-8 overflow-hidden px-5 py-8 sm:-mx-8 sm:px-8">
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        <div className="relative z-10">
          <div className="mx-auto max-w-5xl pb-16">
          <div className="mb-9 flex items-baseline gap-3">
            <span className="engraved text-[34px] text-fg">{items.length}</span>
            <span className="font-sans text-[11px] uppercase tracking-[0.24em] text-muted">
              {items.length > 1 ? "avis reçus" : "avis reçu"}
            </span>
          </div>

          {/* synthèse */}
          {averages && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="glass-card neon-edge mb-10 p-7"
            >
              <p className="mb-6 font-sans text-[10px] uppercase tracking-[0.32em] text-gold">
                Moyennes
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {averages.map((a, i) => (
                  <div key={a.key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-sans text-[11px] font-light text-muted">
                        {a.label}
                      </span>
                      <span className="shrink-0 font-sans text-[15px] font-medium tabular-nums text-fg">
                        {a.avg.toFixed(1)}
                        <span className="text-[10px] text-muted">/5</span>
                      </span>
                    </div>
                    <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-fg/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg,#4b2e8c,#e0632a 55%,#c9a25e)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(a.avg / 5) * 100}%` }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.9, ease }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-fg/10 pt-6">
                <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.32em] text-gold">
                  Reviendraient à un prochain événement
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {returnCounts.map((r) => (
                    <span
                      key={r.value}
                      className="rounded-full border border-fg/15 px-4 py-2 font-sans text-[11px] font-light text-fg transition-colors duration-500 hover:border-gold/60"
                    >
                      <span className="mr-1.5">{r.emoji}</span>
                      {r.label} · {r.count}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* liste */}
          <div className="space-y-4">
            {items.length === 0 && (
              <p className="py-20 text-center font-sans text-[13px] font-light text-muted">
                Aucun avis pour le moment.
              </p>
            )}

            {items.map((f, idx) => {
              const name = namesByEmail.get((f.email || "").trim().toLowerCase());
              const ret = RETURN_OPTIONS.find((o) => o.value === f.returning);
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.4), duration: 0.55, ease }}
                  className="glass-card neon-edge p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="engraved text-[17px] text-fg">
                        {name || <span className="text-muted">Nom introuvable</span>}
                      </div>
                      <div className="mt-1.5 truncate font-sans text-[12px] font-light text-muted">
                        {f.email}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                        {fmt(f.createdAt)}
                      </span>
                      <button
                        onClick={() => remove(f)}
                        disabled={busy === f.id}
                        aria-label={`Supprimer l'avis de ${name || f.email}`}
                        title="Supprimer cet avis"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-terracotta/40 text-terracotta transition-all duration-500 hover:bg-terracotta hover:text-white disabled:opacity-50"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 border-t border-fg/10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                    {RATING_QUESTIONS.map((q) => {
                      const v = f.ratings?.[q.key];
                      return (
                        <div key={q.key} className="flex items-center gap-3">
                          <span className="text-[22px] leading-none">
                            {v ? emojiFor(q.key, v) : "—"}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-sans text-[9px] uppercase tracking-[0.16em] text-gold">
                              {q.label}
                            </span>
                            <span className="block font-sans text-[11px] font-light text-muted">
                              {v ? `${v}/5 · ${labelFor(q.key, v)}` : "Sans réponse"}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-fg/10 pt-5">
                    <span>
                      <span className="font-sans text-[9px] uppercase tracking-[0.24em] text-gold">
                        Reviendrait
                      </span>
                      <span className="ml-3 font-sans text-[13px] font-light text-fg">
                        {ret ? `${ret.emoji} ${ret.label}` : "—"}
                      </span>
                    </span>
                    {f.favouriteGift && (
                      <span>
                        <span className="font-sans text-[9px] uppercase tracking-[0.24em] text-gold">
                          Cadeau préféré
                        </span>
                        <span className="ml-3 font-sans text-[13px] font-light text-fg">
                          {f.favouriteGift}
                        </span>
                      </span>
                    )}
                  </div>

                  {(f.comment || f.suggestions) && (
                    <div className="mt-5 space-y-4">
                      {f.comment && (
                        <div className="rounded-2xl border-l-2 border-gold/60 bg-fg/[0.03] px-5 py-4">
                          <p className="mb-2 font-sans text-[9px] uppercase tracking-[0.24em] text-gold">
                            Mot libre
                          </p>
                          <p className="whitespace-pre-wrap font-sans text-[13px] font-light leading-[1.8] text-fg">
                            {f.comment}
                          </p>
                        </div>
                      )}
                      {f.suggestions && (
                        <div className="rounded-2xl border-l-2 border-accent/60 bg-fg/[0.03] px-5 py-4">
                          <p className="mb-2 font-sans text-[9px] uppercase tracking-[0.24em] text-gold">
                            Suggestions et pistes d&apos;amélioration
                          </p>
                          <p className="whitespace-pre-wrap font-sans text-[13px] font-light leading-[1.8] text-fg">
                            {f.suggestions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </AdminShell>
  );
}
