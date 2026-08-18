"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  deleteMessage,
  setMessageHandled,
  watchMessages,
  type Message,
} from "@/lib/messages";

function when(ts?: { toDate: () => Date } | null) {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleString("fr-CA", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Les messages du formulaire de contact.
 *
 *  Le formulaire écrivait en base depuis le début, mais aucun écran ne les
 *  lisait : ils s'accumulaient sans destinataire. */
export default function MessagesAdmin() {
  const [items, setItems] = useState<Message[]>([]);
  const [showHandled, setShowHandled] = useState(false);

  useEffect(() => watchMessages(setItems), []);

  const shown = useMemo(
    () => (showHandled ? items : items.filter((m) => !m.handled)),
    [items, showHandled]
  );
  const pending = items.filter((m) => !m.handled).length;

  return (
    <AdminShell title="Messages">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <p className="font-sans text-[12px] uppercase tracking-wide2 text-fg">
            {pending} à traiter
            <span className="ml-2 font-light text-muted">· {items.length} au total</span>
          </p>
          <label className="ml-auto flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={showHandled}
              onChange={(e) => setShowHandled(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#c9a25e]"
            />
            <span className="font-sans text-[11px] text-muted">
              Afficher aussi les messages traités
            </span>
          </label>
        </div>

        {shown.length === 0 ? (
          <p className="py-24 text-center font-sans text-[13px] font-light text-muted">
            {items.length === 0
              ? "Aucun message reçu pour l'instant."
              : "Tout est traité."}
          </p>
        ) : (
          <div className="space-y-4">
            {shown.map((m) => (
              <article
                key={m.id}
                className={`rounded-2xl border p-6 transition ${
                  m.handled ? "border-fg/10 bg-surface/50 opacity-60" : "border-fg/15 bg-surface"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-sans text-[14px] text-fg">
                      {m.name}
                      {m.subject && (
                        <span className="ml-3 font-light text-muted">— {m.subject}</span>
                      )}
                    </p>
                    <p className="mt-1 font-sans text-[12px] font-light text-muted">
                      <a
                        href={`mailto:${m.email}`}
                        className="underline-offset-4 transition hover:text-gold hover:underline"
                      >
                        {m.email}
                      </a>
                      {m.phone && ` · ${m.phone}`}
                    </p>
                  </div>
                  <span className="font-sans text-[11px] tabular-nums text-muted">
                    {when(m.createdAt)}
                  </span>
                </div>

                <p className="mt-5 whitespace-pre-line font-sans text-[13px] font-light leading-[1.9] text-fg/90">
                  {m.body}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(
                      `Re : ${m.subject || "votre message"}`
                    )}`}
                    className="rounded-full bg-gold px-5 py-2 font-sans text-[11px] uppercase tracking-wide2 text-night transition hover:opacity-90"
                  >
                    Répondre
                  </a>
                  <button
                    onClick={() => setMessageHandled(m.id, !m.handled).catch(console.error)}
                    className="font-sans text-[11px] uppercase tracking-wide2 text-muted underline-offset-4 transition hover:text-fg hover:underline"
                  >
                    {m.handled ? "Rouvrir" : "Marquer traité"}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Supprimer définitivement ce message ?")) {
                        deleteMessage(m.id).catch(console.error);
                      }
                    }}
                    className="ml-auto font-sans text-[11px] uppercase tracking-wide2 text-terracotta/70 underline-offset-4 transition hover:text-terracotta hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
