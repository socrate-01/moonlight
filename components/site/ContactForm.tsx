"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sendMessage } from "@/lib/messages";

const empty = { name: "", email: "", phone: "", subject: "", body: "" };

export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof empty) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.email.trim() && form.body.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !valid) return;
    setError("");
    setSending(true);
    try {
      await sendMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        body: form.body.trim(),
      });
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Envoi impossible pour le moment. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl bg-surface/50 p-8 sm:p-10">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 text-center"
          >
            <span className="text-4xl">📮</span>
            <p className="engraved mt-6 text-[20px] text-fg">Message envoyé</p>
            <p className="mx-auto mt-4 max-w-sm font-sans text-[13px] font-light leading-[1.9] text-muted">
              Nous vous répondons sous 24 heures. Pensez à vérifier vos
              indésirables, notre réponse s&apos;y égare parfois.
            </p>
            <button
              onClick={() => {
                setForm(empty);
                setSent(false);
              }}
              className="mx-auto mt-8 block font-sans text-[11px] uppercase tracking-[0.2em] text-gold underline-offset-4 transition hover:underline"
            >
              Écrire un autre message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-7"
          >
            <div className="grid gap-7 sm:grid-cols-2">
              <Field id="name" label="Nom complet" value={form.name} onChange={set("name")} required />
              <Field id="email" label="Email" type="email" value={form.email} onChange={set("email")} required />
              <Field id="phone" label="Téléphone (facultatif)" type="tel" value={form.phone} onChange={set("phone")} />
              <Field id="subject" label="Sujet" value={form.subject} onChange={set("subject")} />
            </div>

            <label htmlFor="body" className="block">
              <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                Votre message
              </span>
              <textarea
                id="body"
                required
                rows={6}
                maxLength={4000}
                value={form.body}
                onChange={(e) => set("body")(e.target.value)}
                placeholder="Dites-nous tout : la date, le lieu, le nombre d'invités…"
                className="area-luxe"
              />
            </label>

            <button
              type="submit"
              disabled={sending || !valid}
              className="btn-luxe w-full disabled:cursor-not-allowed disabled:opacity-45"
            >
              {sending ? "Envoi…" : "Envoyer"}
            </button>

            {error && (
              <p className="text-center font-sans text-[12px] font-light text-terracotta">
                {error}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
        {label}
      </span>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-luxe"
      />
    </label>
  );
}
