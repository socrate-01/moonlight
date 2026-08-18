"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  backfillNewsletterTokens,
  deleteMailingContact,
  setMailingContactStatus,
  watchMailingContacts,
  type MailingContact,
} from "@/lib/mailing";
import AddContacts from "./AddContacts";

type Config = {
  senders: string[];
  defaultSender: string;
  replyTo: string;
  appUrl: string;
  configured: boolean;
};

type SendResult = { sent: number; failed: number; simulated: boolean };

function fmt(ts?: { toDate: () => Date } | null) {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Sélection des destinataires et rédaction sur le même écran.
 *
 *  Choisir à qui l'on écrit est la décision la plus lourde de l'envoi : trois
 *  partenaires ou tout le carnet n'ont pas la même conséquence. Séparer les
 *  deux écrans laisserait cliquer « Envoyer » sans voir à qui. Deux colonnes
 *  sous grand écran, empilées sur téléphone. */
export default function MailingConsole() {
  const [contacts, setContacts] = useState<MailingContact[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [showUnsubscribed, setShowUnsubscribed] = useState(false);

  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [from, setFrom] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [testTo, setTestTo] = useState("");

  const [busy, setBusy] = useState<"" | "test" | "send" | "repair">("");
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => watchMailingContacts(setContacts), []);

  /** Jeton d'identité Firebase : c'est lui que les routes serveur revérifient.
   *  Le récupérer à chaque appel évite d'en garder un périmé en mémoire. */
  const authHeaders = useCallback(async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Session expirée. Reconnectez-vous.");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mailing/config", { headers: await authHeaders() });
        if (!res.ok) return;
        const data = (await res.json()) as Config;
        setConfig(data);
        setFrom(data.defaultSender);
        setReplyTo(data.replyTo);
        setTestTo(auth.currentUser?.email ?? "");
      } catch {
        /* La console reste utilisable ; l'envoi rapportera l'erreur. */
      }
    })();
  }, [authHeaders]);

  const active = useMemo(
    () => contacts.filter((c) => c.status === "subscribed"),
    [contacts]
  );

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return contacts
      .filter((c) => (showUnsubscribed ? true : c.status === "subscribed"))
      .filter((c) => (!term ? true : `${c.email} ${c.firstName ?? ""}`.toLowerCase().includes(term)));
  }, [contacts, q, showUnsubscribed]);

  /** Une sélection vide vaut « tout le monde » : c'est l'état de départ de
   *  l'écran, et le cas le plus courant. Obliger à tout cocher pour un envoi
   *  général en ferait une corvée. Le nombre exact reste affiché sur le bouton
   *  et répété dans la confirmation. */
  const recipients = useMemo(() => {
    if (selected.size === 0) return active;
    return active.filter((c) => selected.has(c.id));
  }, [active, selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/mailing/send", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as SendResult & { error?: string };
    if (!res.ok) throw new Error(data.error || "Envoi refusé.");
    return data;
  };

  const draft = () => ({
    subject,
    heading: heading || subject,
    body,
    ctaLabel: ctaLabel || undefined,
    ctaUrl: ctaUrl || undefined,
    from,
    replyTo: replyTo || undefined,
  });

  const sendTest = async () => {
    if (busy) return;
    setError("");
    setResult(null);
    setBusy("test");
    try {
      setResult(await post({ ...draft(), testTo, recipients: [] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi refusé.");
    } finally {
      setBusy("");
    }
  };

  const sendAll = async () => {
    if (busy || recipients.length === 0) return;
    const label =
      selected.size === 0
        ? `tout le carnet actif (${recipients.length} adresse${recipients.length > 1 ? "s" : ""})`
        : `${recipients.length} adresse${recipients.length > 1 ? "s" : ""} sélectionnée${recipients.length > 1 ? "s" : ""}`;
    if (!window.confirm(`Envoyer « ${subject || "sans objet"} » à ${label} ?`)) return;

    setError("");
    setResult(null);
    setBusy("send");
    try {
      setResult(
        await post({
          ...draft(),
          recipients: recipients.map((c) => ({
            email: c.email,
            unsubscribeToken: c.unsubscribeToken,
            firstName: c.firstName,
          })),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi refusé.");
    } finally {
      setBusy("");
    }
  };

  const repair = async () => {
    if (busy) return;
    setBusy("repair");
    setNotice("");
    try {
      const { total, created } = await backfillNewsletterTokens();
      setNotice(
        created === 0
          ? `${total} abonné(s) à l'infolettre — tous les liens de désabonnement sont déjà résolus.`
          : `${created} lien(s) de désabonnement recréé(s) sur ${total} abonné(s).`
      );
    } catch (err) {
      console.error(err);
      setNotice("Réparation impossible. Vérifiez les règles Firestore.");
    } finally {
      setBusy("");
    }
  };

  const ready = subject.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 border-b border-fg/10 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <span className="font-display text-xl tracking-[0.14em] text-fg">MOONLIGHT</span>
            <span className="ml-3 font-sans text-[10px] uppercase tracking-luxe text-gold">
              Mailing
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-fg/25 px-4 py-2 font-sans text-[11px] uppercase tracking-wide2 text-fg transition hover:bg-fg hover:text-bg"
            >
              Réservations
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

      {config && !config.configured && (
        <div className="border-b border-gold/30 bg-gold/10 px-6 py-3 text-center font-sans text-[12px] text-fg">
          Aucune clé Resend configurée — les envois sont simulés et journalisés
          côté serveur. Tout le parcours reste testable.
        </div>
      )}

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ---------------- Colonne gauche : le carnet ---------------- */}
        <section className="space-y-6">
          <AddContacts />

          <div className="rounded-2xl border border-fg/10 bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">
                Carnet · {active.length} actif{active.length > 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setSelected(new Set())}
                disabled={selected.size === 0}
                className="font-sans text-[11px] uppercase tracking-wide2 text-muted underline-offset-4 transition hover:text-fg hover:underline disabled:opacity-30 disabled:no-underline"
              >
                Tout décocher
              </button>
            </div>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une adresse…"
              className="mt-4 w-full rounded-full border border-fg/20 bg-bg px-5 py-2 font-sans text-sm text-fg placeholder:text-fg/30 outline-none transition focus:border-gold"
            />

            <label className="mt-4 flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={showUnsubscribed}
                onChange={(e) => setShowUnsubscribed(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#c9a25e]"
              />
              <span className="font-sans text-[11px] text-muted">
                Afficher aussi les désabonnés
              </span>
            </label>

            <ul className="mt-5 max-h-[26rem] divide-y divide-fg/10 overflow-y-auto">
              {visible.length === 0 && (
                <li className="py-8 text-center font-sans text-[13px] font-light text-muted">
                  Aucune adresse. Collez-en ci-dessus pour commencer.
                </li>
              )}
              {visible.map((c) => {
                const off = c.status === "unsubscribed";
                return (
                  <li key={c.id} className="flex items-center gap-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      disabled={off}
                      className="h-3.5 w-3.5 shrink-0 accent-[#c9a25e] disabled:opacity-30"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-sans text-[13px] ${
                          off ? "text-muted line-through" : "text-fg"
                        }`}
                      >
                        {c.email}
                      </p>
                      <p className="font-sans text-[10px] uppercase tracking-wide2 text-muted">
                        {c.source} · {fmt(c.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setMailingContactStatus(c.id, off ? "subscribed" : "unsubscribed")
                      }
                      title={off ? "Réabonner" : "Désabonner"}
                      className="shrink-0 font-sans text-[10px] uppercase tracking-wide2 text-muted underline-offset-4 transition hover:text-fg hover:underline"
                    >
                      {off ? "Réabonner" : "Retirer"}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Effacer définitivement ${c.email} ?`)) {
                          deleteMailingContact(c).catch(console.error);
                        }
                      }}
                      title="Suppression définitive — réservée aux demandes d'effacement"
                      className="shrink-0 font-sans text-[10px] uppercase tracking-wide2 text-terracotta/70 underline-offset-4 transition hover:text-terracotta hover:underline"
                    >
                      Effacer
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-fg/10 bg-surface p-6">
            <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">
              Infolettre
            </p>
            <p className="mt-3 font-sans text-[12px] font-light leading-[1.8] text-muted">
              Les abonnés inscrits avant ce module portent un jeton sans entrée
              d&apos;index : leur lien de désabonnement ne résoudrait rien.
              Cette passe recrée ce qui manque, et peut être relancée sans risque.
            </p>
            <button
              onClick={repair}
              disabled={busy === "repair"}
              className="mt-4 rounded-full border border-fg/25 px-4 py-2 font-sans text-[11px] uppercase tracking-wide2 text-fg transition hover:bg-fg hover:text-bg disabled:opacity-40"
            >
              {busy === "repair" ? "Vérification…" : "Réparer les liens"}
            </button>
            {notice && <p className="mt-3 font-sans text-[12px] text-fg">{notice}</p>}
          </div>
        </section>

        {/* ---------------- Colonne droite : le message ---------------- */}
        <section className="rounded-2xl border border-fg/10 bg-surface p-6">
          <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">
            Le message
          </p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Expéditeur
              </span>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg outline-none transition focus:border-gold"
              >
                {(config?.senders ?? []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="mt-2 block font-sans text-[11px] font-light text-muted">
                Seuls les expéditeurs de la liste blanche sont acceptés, et
                chaque domaine doit être vérifié chez Resend.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Répondre à (facultatif)
              </span>
              <input
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="contact@moonlight-cocktailbar.ca"
                className="w-full rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
              />
              <span className="mt-2 block font-sans text-[11px] font-light text-muted">
                N&apos;exige aucune vérification : c&apos;est la solution
                immédiate pour recevoir les réponses ailleurs.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Objet
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Nos dates d'automne sont ouvertes"
                className="w-full rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Titre dans le message
              </span>
              <input
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Reprend l'objet si laissé vide"
                className="w-full rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                Message
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="Une ligne vide sépare deux paragraphes."
                className="w-full resize-y rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm leading-[1.8] text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                  Bouton — libellé
                </span>
                <input
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Réserver"
                  className="w-full rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
                  Bouton — adresse
                </span>
                <input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://moonlight-cocktailbar.ca/reservation"
                  className="w-full rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
                />
              </label>
            </div>
          </div>

          {/* Le test à soi, avant tout envoi de masse. */}
          <div className="mt-8 border-t border-fg/10 pt-6">
            <span className="mb-2 block font-sans text-[10px] uppercase tracking-wide2 text-muted">
              S&apos;envoyer un test
            </span>
            <div className="flex flex-wrap gap-3">
              <input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="vous@exemple.com"
                className="min-w-0 flex-1 rounded-xl border border-fg/20 bg-bg px-4 py-3 font-sans text-sm text-fg placeholder:text-fg/25 outline-none transition focus:border-gold"
              />
              <button
                onClick={sendTest}
                disabled={!ready || !testTo.trim() || busy !== ""}
                className="rounded-full border border-gold/50 px-5 py-2 font-sans text-[11px] uppercase tracking-wide2 text-gold transition hover:bg-gold hover:text-night disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gold"
              >
                {busy === "test" ? "Envoi…" : "Tester"}
              </button>
            </div>
            <p className="mt-2 font-sans text-[11px] font-light text-muted">
              L&apos;adresse n&apos;a pas besoin d&apos;être dans le carnet.
              Testez vers une adresse qui n&apos;est pas celle du compte Resend :
              sinon l&apos;essai passerait même mal configuré.
            </p>
          </div>

          <div className="mt-8 border-t border-fg/10 pt-6">
            <button
              onClick={sendAll}
              disabled={!ready || recipients.length === 0 || busy !== ""}
              className="btn-luxe w-full disabled:opacity-50"
            >
              {busy === "send"
                ? "Envoi en cours…"
                : `Envoyer à ${recipients.length} destinataire${recipients.length > 1 ? "s" : ""}`}
            </button>
            <p className="mt-3 text-center font-sans text-[11px] font-light text-muted">
              {selected.size === 0
                ? "Aucune case cochée : l'envoi part à tout le carnet actif."
                : `${selected.size} adresse${selected.size > 1 ? "s" : ""} cochée${selected.size > 1 ? "s" : ""}.`}
            </p>

            {result && (
              <p className="mt-5 text-center font-sans text-[13px] text-fg">
                {result.simulated ? "Simulation — rien n'est parti. " : ""}
                {result.sent} envoyé{result.sent > 1 ? "s" : ""}
                {result.failed > 0 && (
                  <span className="text-terracotta">, {result.failed} en échec</span>
                )}
                .
              </p>
            )}
            {error && (
              <p className="mt-5 text-center font-sans text-[13px] text-terracotta">{error}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
