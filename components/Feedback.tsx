"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  DRESS_CODE_SCALE,
  RATING_QUESTIONS,
  RATING_SCALE,
  RETURN_OPTIONS,
  saveFeedback,
  type RatingKey,
  type ReturnAnswer,
} from "@/lib/feedback";

type Step = "gate" | "form" | "done";

const ease = [0.22, 1, 0.36, 1] as const;

/** Décalage de départ du point lumineux qui parcourt le contour, pour que les
 *  cartes ne soient pas synchronisées. Valeur négative : l'animation démarre
 *  déjà entamée plutôt qu'au même point pour toutes. */
const edgeDelay = (seconds: number) =>
  ({ "--edge-delay": `${seconds.toFixed(2)}s` } as unknown as React.CSSProperties);

function Aurora() {
  return (
    <div className="aurora" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

function EmojiScale({
  scale,
  value,
  onChange,
  name,
}: {
  scale: ReadonlyArray<{ value: number; emoji: string; label: string }>;
  value: number | undefined;
  onChange: (v: number) => void;
  name: string;
}) {
  const selected = scale.find((s) => s.value === value);

  return (
    <div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {scale.map((o, i) => {
          const active = value === o.value;
          return (
            <motion.label
              key={o.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.045, ease }}
              whileTap={{ scale: 0.94 }}
              // Sur mobile la pastille se réduit à l'emoji : cinq libellés
              // côte à côte y seraient illisibles. Le libellé choisi s'affiche
              // sous la rangée à la place.
              title={o.label}
              aria-label={o.label}
              className={`chip px-1 py-3 sm:px-2 sm:py-4 ${active ? "chip-on" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={active}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className="chip-emoji">{o.emoji}</span>
              <span
                className={`hidden font-sans text-[9px] uppercase leading-tight tracking-[0.12em] transition-colors duration-500 sm:block ${
                  active ? "text-gold" : "text-muted"
                }`}
              >
                {o.label}
              </span>
            </motion.label>
          );
        })}
      </div>

      {/* Repère de lecture, mobile uniquement */}
      <div className="mt-3 sm:hidden">
        {selected ? (
          <motion.p
            key={selected.value}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="text-center font-sans text-[11px] uppercase tracking-[0.18em] text-gold"
          >
            {selected.label}
          </motion.p>
        ) : (
          <p className="flex justify-between font-sans text-[9px] uppercase tracking-[0.14em] text-muted/70">
            <span>{scale[0].label}</span>
            <span>{scale[scale.length - 1].label}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function Feedback() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>("gate");
  const [email, setEmail] = useState("");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [ratings, setRatings] = useState<Partial<Record<RatingKey, number>>>({});
  const [returning, setReturning] = useState<ReturnAnswer | "">("");
  const [comment, setComment] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [favouriteGift, setFavouriteGift] = useState("");

  const answered = useMemo(
    () =>
      RATING_QUESTIONS.filter((q) => ratings[q.key]).length +
      (returning ? 1 : 0),
    [ratings, returning]
  );
  const totalQuestions = RATING_QUESTIONS.length + 1;
  const progress = Math.round((answered / totalQuestions) * 100);
  const canSubmit = answered === totalQuestions;

  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/feedback/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Vérification impossible.");
        return;
      }
      setHash(data.hash);
      setStep("form");
    } catch {
      setError("Vérification impossible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await saveFeedback(hash, {
        email: email.trim().toLowerCase(),
        ratings: ratings as Record<RatingKey, number>,
        returning: returning as ReturnAnswer,
        comment: comment.trim(),
        suggestions: suggestions.trim(),
        favouriteGift: favouriteGift.trim(),
      });
      setStep("done");
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer votre avis. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-prestige relative min-h-screen overflow-hidden bg-bg">
      <Aurora />

      <div className="relative z-10">
        <header>
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
            <Link
              href="/"
              className="group flex items-center gap-3 transition-opacity duration-500 hover:opacity-80"
            >
              {/* Marque à l'encre en thème clair, orangée en thème sombre */}
              <span className="relative block h-8 w-[19px] shrink-0">
                <Image
                  src="/images/logo-icon-ink.png"
                  alt=""
                  fill
                  sizes="19px"
                  className="object-contain dark:opacity-0"
                />
                <Image
                  src="/images/logo-icon-orange.png"
                  alt=""
                  fill
                  sizes="19px"
                  className="object-contain opacity-0 dark:opacity-100"
                />
              </span>
              <span className="engraved text-[15px] text-fg transition-colors duration-500 group-hover:text-gold">
                Moonlight
              </span>
            </Link>
            <span className="font-sans text-[10px] uppercase tracking-[0.32em] text-gold">
              Vos impressions
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 pb-24 pt-14">
          <AnimatePresence mode="wait">
            {step === "gate" && (
              <motion.div
                key="gate"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6, ease }}
              >
                <div className="mb-12 text-center">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold"
                  >
                    Cérémonie d&apos;ouverture
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16, duration: 0.7, ease }}
                    className="engraved mt-6 text-[30px] font-normal leading-[1.25] text-fg sm:text-[42px]"
                  >
                    Merci d&apos;avoir
                    <br />
                    <span className="text-gradient">partagé la nuit</span>
                  </motion.h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.8, ease }}
                    className="rule mx-auto my-8 max-w-[8rem]"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="mx-auto max-w-md font-sans text-[15px] font-light leading-[1.95] text-muted"
                  >
                    Votre regard sur la soirée nous aide à préparer la suite.
                    Saisissez l&apos;adresse utilisée lors de votre inscription —
                    deux minutes, pas davantage.
                  </motion.p>
                </div>

                {/* La carte surgit du coin bas droite, fait un tour complet sur
                    elle-même et se pose au centre — d'un seul trait.
                    Surtout pas d'images-clés intermédiaires : chaque segment
                    d'une courbe de Bézier se termine à vitesse nulle, ce qui
                    marque un arrêt visible à chaque jonction. Une interpolation
                    unique garantit un mouvement continu, qui ne décélère qu'à
                    l'approche de sa position finale. */}
                <motion.div
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          x: "48vw",
                          y: "46vh",
                          rotate: 385,
                          rotateY: 195,
                          rotateX: 30,
                          scale: 0.28,
                        }
                  }
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    rotateY: 0,
                    rotateX: 0,
                    scale: 1,
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0.4 }
                      : {
                          duration: 3,
                          delay: 0.5,
                          // Décélération douce et continue de bout en bout.
                          ease: [0.19, 0.66, 0.3, 1],
                          // Seule l'opacité est traitée à part : la carte doit
                          // être visible dès le début du vol.
                          opacity: { duration: 0.85, delay: 0.5, ease: "easeOut" },
                        }
                  }
                  style={{ transformPerspective: 1400, originX: 0.5, originY: 0.5 }}
                  className="liquid-glass neon-edge mx-auto max-w-md p-8 sm:p-10"
                >
                  <span className="liquid-sheen" aria-hidden />
                  <form onSubmit={checkEmail} className="relative z-10 space-y-8">
                    <label htmlFor="email" className="block">
                      <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                        Votre adresse email
                      </span>
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@exemple.com"
                        className="field-luxe"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="btn-luxe w-full disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {loading ? "Vérification…" : "Accéder au questionnaire"}
                    </button>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-center font-sans text-[12px] font-light leading-relaxed text-terracotta"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              </motion.div>
            )}

            {step === "form" && (
              <motion.form
                key="form"
                onSubmit={submit}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6, ease }}
              >
                <div className="mb-10 text-center">
                  <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
                    Questionnaire
                  </p>
                  <h1 className="engraved mt-5 text-[24px] font-normal leading-tight text-fg sm:text-[34px]">
                    Comment avez-vous
                    {/* césure choisie seulement quand la largeur le permet */}
                    <br className="hidden sm:block" />{" "}
                    vécu la soirée ?
                  </h1>
                </div>

                {/* progression — carte flottante à bords arrondis */}
                <div className="glass-card sticky top-4 z-20 mb-10 rounded-full px-6 py-3.5">
                  <div className="flex items-center gap-4">
                    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-fg/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg,#4b2e8c,#e0632a 55%,#c9a25e)",
                        }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease }}
                      />
                    </div>
                    <span className="shrink-0 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                      {answered}/{totalQuestions}
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* La carte est portée par un div : sur un <fieldset>, un
                      pseudo-élément en inset:0 se cale sur la boîte de contenu
                      située sous la légende, d'où un second liseré parasite. */}
                  {RATING_QUESTIONS.map((q, i) => (
                    <motion.div
                      key={q.key}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.55, ease }}
                      style={edgeDelay(-i * 0.95)}
                      className="glass-card neon-travel p-6 sm:p-7"
                    >
                      <fieldset>
                        <legend className="mb-5 flex items-center gap-3 px-1">
                          <span className="font-sans text-[10px] tabular-nums text-gold/60">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-sans text-[13px] font-light tracking-wide text-fg">
                            {q.label}
                          </span>
                        </legend>
                        <EmojiScale
                          name={q.key}
                          scale={q.key === "dressCode" ? DRESS_CODE_SCALE : RATING_SCALE}
                          value={ratings[q.key]}
                          onChange={(v) => setRatings((r) => ({ ...r, [q.key]: v }))}
                        />
                      </fieldset>

                      {/* Question de relance, rattachée à la notation des
                          cadeaux plutôt qu'isolée en bas de page. */}
                      {q.key === "gifts" && (
                        <label
                          htmlFor="favouriteGift"
                          className="mt-6 block border-t border-fg/10 pt-5"
                        >
                          <span className="mb-2 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                            Lequel avez-vous préféré ?
                          </span>
                          <input
                            id="favouriteGift"
                            type="text"
                            maxLength={140}
                            value={favouriteGift}
                            onChange={(e) => setFavouriteGift(e.target.value)}
                            placeholder="Le cadeau qui vous a le plus plu…"
                            className="field-luxe"
                          />
                        </label>
                      )}
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.55, ease }}
                    style={edgeDelay(-3.35)}
                    className="glass-card neon-travel p-6 sm:p-7"
                  >
                    <fieldset>
                    <legend className="mb-5 flex items-center gap-3 px-1">
                      <span className="font-sans text-[10px] tabular-nums text-gold/60">
                        {String(RATING_QUESTIONS.length + 1).padStart(2, "0")}
                      </span>
                      <span className="font-sans text-[13px] font-light tracking-wide text-fg">
                        Reviendriez-vous à un prochain événement ?
                      </span>
                    </legend>
                    {/* Libellés longs : empilés en ligne sur mobile, en
                        colonnes seulement à partir du format tablette. */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                      {RETURN_OPTIONS.map((o) => {
                        const active = returning === o.value;
                        return (
                          <motion.label
                            key={o.value}
                            whileTap={{ scale: 0.94 }}
                            className={`chip flex-row justify-start gap-3 px-5 sm:flex-col sm:justify-center sm:gap-1.5 sm:px-2 ${
                              active ? "chip-on" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="returning"
                              value={o.value}
                              checked={active}
                              onChange={() => setReturning(o.value)}
                              className="sr-only"
                            />
                            <span className="chip-emoji">{o.emoji}</span>
                            <span
                              className={`font-sans text-[10px] uppercase leading-tight tracking-[0.12em] transition-colors duration-500 sm:text-[9px] ${
                                active ? "text-gold" : "text-muted"
                              }`}
                            >
                              {o.label}
                            </span>
                          </motion.label>
                        );
                      })}
                    </div>
                    </fieldset>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.52, duration: 0.55, ease }}
                    style={edgeDelay(-2.4)}
                    className="glass-card neon-travel space-y-7 p-6 sm:p-7"
                  >
                    <label htmlFor="comment" className="block">
                      <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                        Un mot libre
                      </span>
                      <textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={2000}
                        placeholder="Ce que vous avez préféré, un souvenir de la soirée…"
                        className="area-luxe"
                      />
                      <span className="mt-1.5 block text-right font-sans text-[10px] text-muted/70">
                        {comment.length}/2000
                      </span>
                    </label>

                    <label htmlFor="suggestions" className="block">
                      <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                        Suggestions et pistes d&apos;amélioration
                      </span>
                      <textarea
                        id="suggestions"
                        rows={4}
                        value={suggestions}
                        onChange={(e) => setSuggestions(e.target.value)}
                        maxLength={2000}
                        placeholder="Ce qu&apos;on pourrait faire autrement la prochaine fois…"
                        className="area-luxe"
                      />
                      <span className="mt-1.5 block text-right font-sans text-[10px] text-muted/70">
                        {suggestions.length}/2000
                      </span>
                    </label>
                  </motion.div>
                </div>

                <div className="mt-10">
                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="btn-luxe w-full disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {loading ? "Envoi…" : "Envoyer mon avis"}
                  </button>
                  {!canSubmit && (
                    <p className="mt-4 text-center font-sans text-[11px] font-light tracking-wide text-muted">
                      Il reste {totalQuestions - answered} question
                      {totalQuestions - answered > 1 ? "s" : ""} à noter.
                    </p>
                  )}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 text-center font-sans text-[12px] font-light text-terracotta"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.form>
            )}

            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
                className="glass-card neon-edge mx-auto max-w-lg px-8 py-16 text-center sm:px-12"
              >
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.8, ease }}
                  className="block text-[52px]"
                >
                  🥂
                </motion.span>
                <h1 className="engraved mt-7 text-[28px] font-normal text-fg">
                  Merci infiniment
                </h1>
                <div className="rule mx-auto my-7 max-w-[6rem]" />
                <p className="mx-auto max-w-sm font-sans text-[14px] font-light leading-[1.95] text-muted">
                  Votre avis est enregistré. Il comptera pour le prochain
                  rendez-vous sous le clair de lune.
                </p>
                <Link href="/" className="btn-luxe mt-10 inline-block">
                  Retour au site
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
