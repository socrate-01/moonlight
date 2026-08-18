"use client";

import Link from "next/link";
import { useState } from "react";

/** Le bouton qui agit réellement.
 *
 *  Il envoie un POST vers la même route que celle visée par l'en-tête
 *  `List-Unsubscribe` : une seule mécanique de retrait, qu'elle soit
 *  déclenchée par Gmail ou par un clic sur cette page. */
export default function UnsubscribeConfirm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const confirm = async () => {
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-fg/10 bg-surface p-10">
        <span className="text-4xl">🌙</span>
        <p className="engraved mt-6 text-[20px] text-fg">C&apos;est fait</p>
        <p className="mx-auto mt-5 max-w-sm font-sans text-[14px] font-light leading-[1.9] text-muted">
          <span className="text-fg">{email}</span> ne recevra plus nos envois.
          Merci de nous avoir lus jusqu&apos;ici.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block font-sans text-[11px] uppercase tracking-[0.22em] text-gold underline-offset-4 hover:underline"
        >
          Retour au site →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-fg/10 bg-surface p-10">
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
        Adresse concernée
      </p>
      <p className="mt-3 break-all font-sans text-[15px] text-fg">{email}</p>

      <p className="mx-auto mt-7 max-w-sm font-sans text-[14px] font-light leading-[1.9] text-muted">
        Vous êtes sur le point de vous retirer de nos envois. Rien n&apos;est
        encore fait : confirmez pour que le retrait prenne effet.
      </p>

      <button
        onClick={confirm}
        disabled={state === "sending"}
        className="btn-luxe mt-9 w-full disabled:opacity-70"
      >
        {state === "sending" ? "Retrait en cours…" : "Confirmer le désabonnement"}
      </button>

      {state === "error" && (
        <p className="mt-5 font-sans text-[12px] text-terracotta">
          Le retrait a échoué. Réessayez, ou écrivez-nous.
        </p>
      )}

      <Link
        href="/"
        className="mt-6 inline-block font-sans text-[11px] uppercase tracking-[0.22em] text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
      >
        Annuler et revenir au site
      </Link>
    </div>
  );
}
