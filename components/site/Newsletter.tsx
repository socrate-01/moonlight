"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribe } from "@/lib/newsletter";

export default function Newsletter({ source = "site" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "already">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending" || !consent) return;
    setError("");
    setState("sending");
    try {
      const res = await subscribe(email.trim(), source);
      setState(res.already ? "already" : "done");
    } catch (err) {
      console.error(err);
      setError("Inscription impossible pour le moment. Réessayez.");
      setState("idle");
    }
  };

  return (
    <div className="mx-auto max-w-xl text-center">
      <AnimatePresence mode="wait">
        {state === "done" || state === "already" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 text-center"
          >
            <span className="text-4xl">🥂</span>
            <p className="engraved mt-6 text-[22px] text-fg">
              {state === "already" ? "Vous y êtes déjà" : "Bienvenue dans le cercle"}
            </p>
            <p className="mx-auto mt-4 max-w-sm font-sans text-[13px] font-light leading-[1.9] text-muted">
              {state === "already"
                ? "Cette adresse figure déjà parmi nos abonnés. Rien de plus à faire."
                : "Vous recevrez nos annonces, nos nouvelles cartes et nos dates. Jamais plus que nécessaire, et vous pourrez vous désabonner d'un clic."}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="engraved text-[24px] leading-tight text-fg sm:text-[32px]">
                Le cercle Moonlight
              </h3>
              <p className="engraved mx-auto mt-3.5 max-w-md text-[15px] leading-tight tracking-[0.16em] text-gold sm:text-[19px]">
                Les dates ouvertes, avant tout le monde
              </p>
              <p className="mx-auto mt-7 max-w-sm font-sans text-[14px] font-light leading-[2] text-muted">
                Nos samedis partent vite. Nos abonnés les reçoivent en premier.
              </p>
            </div>

            {/* Trois promesses courtes : ce qu'on reçoit vraiment, plutôt
                qu'une invitation vague à s'abonner. */}
            <ul className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-9 gap-y-3">
              {[
                "Dates en avant-première",
                "Nouvelles créations",
                "Deux envois par mois",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 font-sans text-[11px] uppercase tracking-[0.16em] text-muted"
                >
                  <span className="h-[3px] w-[3px] rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Champ souligné et bouton sur la même ligne : la saisie ressemble
                à une signature plutôt qu'à un formulaire. */}
            <div className="mx-auto mt-10 flex max-w-md items-end gap-4 border-b border-fg/25 pb-1 transition-colors duration-500 focus-within:border-gold">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                aria-label="Votre adresse email"
                className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-[15px] text-fg placeholder:text-fg/25 outline-none"
              />
              <button
                type="submit"
                disabled={state === "sending" || !consent || !email.trim()}
                className="group shrink-0 pb-2 font-sans text-[11px] uppercase tracking-[0.22em] text-gold transition-opacity duration-500 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {state === "sending" ? "Envoi…" : "Rejoindre"}
                <span className="ml-2.5 inline-block transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>

            {/* Consentement explicite : sans case cochée volontairement, un
                envoi commercial est illégal au Canada (LCAP). */}
            <label className="mx-auto flex max-w-md cursor-pointer items-start gap-3 pt-1 text-left">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#c9a25e]"
              />
              <span className="font-sans text-[11px] font-light leading-relaxed text-muted">
                J&apos;accepte de recevoir les communications de Moonlight
                Cocktail Bar et je peux me désabonner à tout moment.
              </span>
            </label>

            {error && (
              <p className="font-sans text-[12px] font-light text-terracotta">
                {error}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
