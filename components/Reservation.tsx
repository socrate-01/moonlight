"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import FauxQR from "./FauxQR";

type FormState = { name: string; email: string; phone: string };
const empty: FormState = { name: "", email: "", phone: "" };

function Field({
  id, label, type = "text", value, onChange, placeholder, autoComplete,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block font-sans text-[11px] uppercase tracking-wide2 text-gold">
        {label}
      </span>
      <input
        id={id}
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-fg/25 bg-transparent px-1 py-3 font-sans text-fg placeholder:text-fg/30 outline-none transition-colors duration-300 focus:border-gold"
      />
    </label>
  );
}

export default function Reservation() {
  const [form, setForm] = useState<FormState>(empty);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI-only for now — email + QR + PDF generation to be wired later.
    setSubmitted(true);
  };

  const ref =
    "ML-" +
    (form.name || "invite").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6).padEnd(6, "X") +
    "-2026";

  return (
    <section id="reservation" className="relative overflow-hidden bg-surface py-28 lg:py-40">
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 flex items-baseline justify-center gap-4">
          <span className="numeral">IV</span>
          <span className="eyebrow-plain">Réservation · RSVP</span>
        </div>

        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Left copy */}
          <div className="lg:pt-4">
            <Reveal>
              <h2 className="font-display text-4xl font-light leading-tight text-fg sm:text-5xl md:text-6xl">
                Recevez votre
                <span className="italic text-gradient"> invitation</span>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rule my-8 max-w-[9rem]" />
            </Reveal>
            <Reveal delay={0.12}>
              <p className="max-w-md font-sans text-[15px] font-light leading-[1.9] text-muted">
                Réservez votre place pour la cérémonie d'ouverture. Vous recevrez par
                email votre invitation nominative accompagnée d'un QR code personnel, à
                présenter à l'entrée le soir de l'événement.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <ul className="mt-10 space-y-6">
                {[
                  ["01", "Complétez le formulaire"],
                  ["02", "Recevez invitation & QR code par email"],
                  ["03", "Présentez votre QR code à l'entrée"],
                ].map(([n, t]) => (
                  <li key={n} className="flex items-center gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/45 font-display text-sm text-gold shadow-[0_0_16px_-2px_rgba(201,162,94,0.45)]">
                      {n}
                    </span>
                    <span className="font-sans text-sm font-light text-muted">{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Right card */}
          <Reveal delay={0.1}>
            <div className="neon-frame">
              <div className="rounded-[1.55rem] bg-surface2/80 p-8 backdrop-blur-md sm:p-12">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-8"
                    >
                      <div className="space-y-8">
                        <Field id="name" label="Nom complet" value={form.name} onChange={set("name")} placeholder="Prénom & nom" autoComplete="name" />
                        <Field id="email" label="Adresse email" type="email" value={form.email} onChange={set("email")} placeholder="vous@exemple.com" autoComplete="email" />
                        <Field id="phone" label="Téléphone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+33 6 00 00 00 00" autoComplete="tel" />
                      </div>

                      <button type="submit" className="btn-luxe w-full">
                        Recevoir mon invitation par mail
                      </button>

                      <p className="text-center font-sans text-[11px] font-light leading-relaxed text-muted">
                        Vos informations restent confidentielles et ne servent qu'à
                        l'organisation de la soirée.
                      </p>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="ticket"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="mb-6 text-center">
                        <span className="relative mx-auto mb-3 block h-10 w-10">
                          <Image src="/images/logo-icon-ink.png" alt="Moonlight" fill className="object-contain dark:opacity-0" />
                          <Image src="/images/logo-icon-orange.png" alt="" fill className="object-contain opacity-0 dark:opacity-100" />
                        </span>
                        <p className="eyebrow-plain text-[10px]">Invitation confirmée</p>
                        <h3 className="mt-2 font-display text-3xl text-fg">
                          À très bientôt, {form.name.split(" ")[0] || "cher invité"}
                        </h3>
                      </div>

                      {/* Engraved invitation card */}
                      <div className="rounded-xl border border-gold/50 bg-bg p-1">
                        <div className="rounded-lg border border-gold/25">
                          <div className="flex items-center justify-between border-b border-dashed border-fg/20 px-6 py-4">
                            <span className="font-display text-lg tracking-[0.16em] text-fg">MOONLIGHT</span>
                            <span className="font-sans text-[9px] uppercase tracking-luxe text-gold">Grand Opening</span>
                          </div>

                          <div className="flex items-center gap-4 px-5 py-6 sm:gap-5 sm:px-6">
                            <div className="shrink-0 rounded-md border border-fg/15 bg-[#f5f2ea] p-2">
                              <FauxQR seed={ref} className="h-20 w-20 text-night sm:h-24 sm:w-24" />
                            </div>
                            <dl className="min-w-0 space-y-2.5 text-left">
                              <div>
                                <dt className="font-sans text-[9px] uppercase tracking-wide2 text-gold">Invité</dt>
                                <dd className="truncate font-display text-lg leading-tight text-fg">{form.name || "·"}</dd>
                              </div>
                              <div>
                                <dt className="font-sans text-[9px] uppercase tracking-wide2 text-gold">Email</dt>
                                <dd className="truncate font-sans text-xs text-muted">{form.email || "·"}</dd>
                              </div>
                              <div>
                                <dt className="font-sans text-[9px] uppercase tracking-wide2 text-gold">Référence</dt>
                                <dd className="font-sans text-xs tracking-wide2 text-muted">{ref}</dd>
                              </div>
                            </dl>
                          </div>

                          <div className="flex items-center justify-between border-t border-dashed border-fg/20 px-6 py-4 font-sans text-[10px] uppercase tracking-wide2 text-muted">
                            <span>Samedi XX Mois 2026</span>
                            <span>20 h 00</span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-6 text-center font-sans text-[12px] font-light leading-relaxed text-muted">
                        Un aperçu de votre invitation. La version définitive, avec votre
                        QR code personnel, vous sera envoyée par email.
                      </p>

                      <button
                        onClick={() => { setSubmitted(false); setForm(empty); }}
                        className="mx-auto mt-6 block font-sans text-[11px] uppercase tracking-wide2 text-gold underline-offset-4 transition hover:underline"
                      >
                        Nouvelle réservation
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
