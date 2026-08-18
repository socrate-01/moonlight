"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuoteToken } from "@/lib/bookings";

const money = (n: number, currency = "CAD") =>
  new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

const longDate = (iso: string) => {
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
};

/** Le client lit sa proposition et, s'il l'accepte, part régler l'acompte.
 *
 *  Le bouton n'envoie que le jeton : le montant est relu côté serveur depuis
 *  la fiche écrite par l'admin, jamais pris dans la requête. */
export default function ProposalCard({
  token,
  quote,
}: {
  token: string;
  quote: QuoteToken;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Paiement indisponible.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paiement indisponible.");
      setBusy(false);
    }
  };

  const currency = quote.currency || "CAD";

  return (
    <div className="rounded-2xl bg-surface/50 p-7 sm:p-10">
      <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-gold">
        Pour {quote.name}
      </p>

      {quote.message && (
        <div className="mt-6 space-y-4">
          {quote.message
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((block, i) => (
              <p
                key={i}
                className="font-sans text-[14px] font-light leading-[2] text-muted"
              >
                {block}
              </p>
            ))}
        </div>
      )}

      <div className="mt-9 space-y-2">
        <div className="rounded-2xl bg-fg/[0.03] p-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-gold/70">
            La soirée
          </p>
          <dl className="mt-4 space-y-3.5">
            {[
              ["Date", longDate(quote.date)],
              ["Événement", quote.eventLabel],
              ["Invités", String(quote.guests)],
              ...(quote.needLabels ? [["Prestations", quote.needLabels]] : []),
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"
              >
                <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-muted">
                  {k}
                </dt>
                <dd className="max-w-sm text-right font-sans text-[13px] font-light text-fg">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div aria-hidden className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
          <span className="h-1 w-1 rotate-45 bg-gold/50" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
        </div>

        <div className="rounded-2xl border border-gold/25 bg-gold/[0.06] p-6 text-center">
          <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-gold">
            Devis total
          </p>
          <p className="engraved mt-3 text-[34px] text-fg">
            {money(quote.amount, currency)}
          </p>
          <p className="mt-4 font-sans text-[13px] font-light leading-[1.9] text-muted">
            Acompte à régler maintenant :{" "}
            <span className="text-gold">{money(quote.depositAmount, currency)}</span>
            <br />
            soit 50 % du devis, déduits du montant final.
          </p>
        </div>
      </div>

      <button
        onClick={confirm}
        disabled={busy}
        className="btn-luxe mt-9 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Ouverture du paiement…" : "Confirmer et régler l'acompte"}
      </button>

      {error && (
        <p className="mt-5 text-center font-sans text-[12px] text-terracotta">{error}</p>
      )}

      <p className="mt-6 text-center font-sans text-[11px] font-light leading-relaxed text-muted/80">
        Paiement sécurisé par Square. Nous ne voyons ni ne conservons vos
        coordonnées bancaires. La date est bloquée dès l&apos;acompte reçu.
      </p>

      <Link
        href="/contact"
        className="mx-auto mt-5 block text-center font-sans text-[11px] uppercase tracking-[0.2em] text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
      >
        Une question avant de confirmer ?
      </Link>
    </div>
  );
}
