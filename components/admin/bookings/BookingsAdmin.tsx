"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { auth } from "@/lib/firebase";
import {
  makeQuoteToken,
  saveQuote,
  saveQuoteToken,
  setBookingStatus,
  watchBookings,
  type Booking,
} from "@/lib/bookings";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
  BUDGET_RANGES,
  EVENT_TYPES,
  PRICING,
  SERVICE_OPTIONS,
  money,
  type BookingStatus,
} from "@/lib/site";

const FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "À étudier" },
  { value: "quoted", label: "Devis envoyé" },
  { value: "confirmed", label: "Acceptées" },
  { value: "deposit_paid", label: "Acompte réglé" },
  { value: "declined", label: "Refusées" },
];

const TONES: Record<string, string> = {
  gold: "bg-gold/15 text-gold",
  emerald: "bg-emerald-500/15 text-emerald-400",
  terracotta: "bg-terracotta/15 text-terracotta",
  muted: "bg-fg/10 text-muted",
};

function longDate(iso: string) {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-CA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function label(list: readonly { value: string; label: string }[], v: string) {
  return list.find((x) => x.value === v)?.label ?? v;
}

export default function BookingsAdmin() {
  const [items, setItems] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("pending");
  const [openId, setOpenId] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => watchBookings(setItems), []);

  const shown = useMemo(
    () => (filter === "all" ? items : items.filter((b) => b.status === filter)),
    [items, filter]
  );

  const open = items.find((b) => b.id === openId) ?? null;

  /** Le devis saisi est la seule donnée chiffrée du parcours. L'acompte s'en
   *  déduit, il n'est jamais saisi à part : deux champs indépendants finissent
   *  toujours par diverger. */
  const parsed = Number(amount.replace(/[^\d.]/g, ""));
  const deposit = Number.isFinite(parsed) ? Math.round(parsed * PRICING.depositRate) : 0;

  const select = (b: Booking) => {
    setOpenId(b.id);
    setAmount(b.quoteAmount ? String(b.quoteAmount) : "");
    setMessage(
      b.quoteMessage ||
        `Merci pour votre demande. Après étude de ce que vous nous décrivez, voici ce que nous vous proposons pour votre soirée.\n\nNous restons disponibles pour ajuster la carte ou les horaires si besoin.`
    );
    setNotice("");
    setError("");
  };

  const eventLabel = (b: Booking) =>
    b.eventType === "autre"
      ? b.eventTypeOther
      : label(EVENT_TYPES as readonly { value: string; label: string }[], b.eventType);

  const needLabels = (b: Booking) =>
    (b.needs ?? [])
      .map((n) => label(SERVICE_OPTIONS as readonly { value: string; label: string }[], n))
      .join(" · ");

  const sendQuote = async () => {
    if (!open || busy) return;
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Indiquez un montant de devis valide.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");

    try {
      // Le jeton n'est créé qu'une fois : renvoyer un devis corrigé doit
      // laisser fonctionner le lien déjà reçu par le client.
      const token = open.quoteToken || makeQuoteToken();

      await saveQuoteToken(token, {
        bookingId: open.id,
        name: open.name,
        email: open.email,
        date: open.date,
        eventLabel: eventLabel(open),
        guests: open.guests,
        needLabels: needLabels(open),
        amount: parsed,
        depositAmount: deposit,
        message: message.trim(),
        currency: PRICING.currency,
      });

      await saveQuote(open.id, {
        quoteAmount: parsed,
        quoteMessage: message.trim(),
        depositAmount: deposit,
        quoteToken: token,
      });

      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/bookings/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: open.email,
          name: open.name,
          date: open.date,
          eventLabel: eventLabel(open),
          guests: open.guests,
          needLabels: needLabels(open),
          amount: parsed,
          depositAmount: deposit,
          message: message.trim(),
          token,
          currency: PRICING.currency,
        }),
      });
      const data = (await res.json()) as { simulated?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Envoi refusé.");

      setNotice(
        data.simulated
          ? "Devis enregistré. Aucune clé Resend : le courriel a été journalisé côté serveur, pas envoyé."
          : `Proposition envoyée à ${open.email}.`
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  };

  const decline = async (b: Booking) => {
    if (!window.confirm(`Refuser la demande de ${b.name} ?`)) return;
    await setBookingStatus(b.id, "declined").catch(console.error);
  };

  return (
    <AdminShell title="Demandes">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center gap-2.5">
          {FILTERS.map((f) => {
            const count =
              f.value === "all"
                ? items.length
                : items.filter((b) => b.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-5 py-2 font-sans text-[12px] uppercase tracking-wide2 transition ${
                  filter === f.value
                    ? "bg-gold text-night"
                    : "border border-fg/25 text-fg hover:border-gold"
                }`}
              >
                {f.label} · {count}
              </button>
            );
          })}
        </div>

        {shown.length === 0 ? (
          <p className="py-24 text-center font-sans text-[13px] font-light text-muted">
            Aucune demande dans cette vue.
          </p>
        ) : (
          <div className="space-y-4">
            {shown.map((b) => {
              const meta = BOOKING_STATUSES[b.status] ?? BOOKING_STATUSES.pending;
              const isOpen = openId === b.id;
              return (
                <article
                  key={b.id}
                  className="overflow-hidden rounded-2xl border border-fg/10 bg-surface"
                >
                  <button
                    onClick={() => (isOpen ? setOpenId(null) : select(b))}
                    className="flex w-full flex-wrap items-center gap-4 p-5 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[14px] text-fg">
                        {b.name}
                        <span className="ml-3 font-light text-muted">
                          {eventLabel(b)} · {b.guests} invités
                        </span>
                      </p>
                      <p className="mt-1 font-sans text-[12px] font-light text-muted">
                        {longDate(b.date)} · {b.startTime}–{b.endTime}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 font-sans text-[10px] uppercase tracking-wide2 ${
                        TONES[meta.tone] ?? TONES.muted
                      }`}
                    >
                      {meta.label}
                    </span>
                    {b.quoteAmount > 0 && (
                      <span className="shrink-0 font-sans text-[13px] tabular-nums text-gold">
                        {money(b.quoteAmount)}
                      </span>
                    )}
                    <span className="shrink-0 text-muted">{isOpen ? "−" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div className="grid gap-8 border-t border-fg/10 p-6 lg:grid-cols-2">
                      {/* Ce que la personne a demandé */}
                      <div className="space-y-5">
                        <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">
                          La demande
                        </p>
                        <dl className="space-y-3">
                          {[
                            ["Contact", `${b.email} · ${b.phone}`],
                            ["Adresse", [b.address, b.city, b.postalCode].filter(Boolean).join(", ")],
                            ...(b.addressNote ? [["Accès", b.addressNote]] : []),
                            ["Prestations", needLabels(b) || "—"],
                            [
                              "Budget annoncé",
                              label(BUDGET_RANGES as readonly { value: string; label: string }[], b.budget ?? "") || "—",
                            ],
                            [
                              "Nous a connus par",
                              b.source === "autre"
                                ? b.sourceOther
                                : label(BOOKING_SOURCES as readonly { value: string; label: string }[], b.source ?? "") || "—",
                            ],
                          ].map(([k, v]) => (
                            <div key={k} className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                              <dt className="font-sans text-[10px] uppercase tracking-wide2 text-muted">
                                {k}
                              </dt>
                              <dd className="max-w-sm text-right font-sans text-[13px] font-light text-fg">
                                {v}
                              </dd>
                            </div>
                          ))}
                        </dl>

                        {b.notes && (
                          <div className="rounded-xl bg-fg/[0.03] p-4">
                            <p className="font-sans text-[10px] uppercase tracking-wide2 text-gold">
                              Son projet
                            </p>
                            <p className="mt-2 whitespace-pre-line font-sans text-[13px] font-light leading-[1.9] text-muted">
                              {b.notes}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => decline(b)}
                          className="font-sans text-[11px] uppercase tracking-wide2 text-terracotta/70 underline-offset-4 transition hover:text-terracotta hover:underline"
                        >
                          Refuser cette demande
                        </button>
                      </div>

                      {/* Le devis */}
                      <div className="space-y-5">
                        <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">
                          Votre proposition
                        </p>

                        <label className="block">
                          <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                            Devis total ({PRICING.currency})
                          </span>
                          <input
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="2400"
                            className="w-full rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm tabular-nums text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
                          />
                        </label>

                        <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-4 text-center">
                          <p className="font-sans text-[10px] uppercase tracking-wide2 text-gold">
                            Acompte demandé · 50 %
                          </p>
                          <p className="engraved mt-2 text-[24px] text-fg">
                            {deposit > 0 ? money(deposit) : "—"}
                          </p>
                        </div>

                        <label className="block">
                          <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                            Le mot qui accompagne
                          </span>
                          <textarea
                            rows={7}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full resize-y rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm leading-[1.8] text-fg outline-none transition focus:border-gold"
                          />
                        </label>

                        <button
                          onClick={sendQuote}
                          disabled={busy || !amount.trim()}
                          className="w-full rounded-full bg-gold px-6 py-3 font-sans text-[11px] uppercase tracking-wide2 text-night transition disabled:opacity-40"
                        >
                          {busy
                            ? "Envoi…"
                            : b.status === "quoted"
                            ? "Renvoyer la proposition"
                            : "Envoyer la proposition"}
                        </button>

                        {b.quoteToken && (
                          <a
                            href={`/proposition?token=${encodeURIComponent(b.quoteToken)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-center font-sans text-[11px] uppercase tracking-wide2 text-muted underline-offset-4 transition hover:text-fg hover:underline"
                          >
                            Voir la page telle qu&apos;il la reçoit ↗
                          </a>
                        )}

                        {notice && (
                          <p className="font-sans text-[12px] leading-relaxed text-fg">
                            {notice}
                          </p>
                        )}
                        {error && (
                          <p className="font-sans text-[12px] text-terracotta">{error}</p>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
