"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import Reveal from "./Reveal";
import FauxQR from "./FauxQR";
import { createReservation } from "@/lib/reservations";

type FormState = {
  name: string;
  email: string;
  phone: string;
  alcohol: string; // "" | "oui" | "non"
  allergies: string; // "" | "oui" | "non"
  allergyDetails: string;
};
const empty: FormState = {
  name: "",
  email: "",
  phone: "",
  alcohol: "",
  allergies: "",
  allergyDetails: "",
};

function Choice({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { v: "oui", t: "Oui" },
    { v: "non", t: "Non" },
  ];
  return (
    <fieldset>
      <legend className="mb-2.5 block font-sans text-[11px] uppercase tracking-wide2 text-gold">
        {label}
      </legend>
      <div className="flex gap-3">
        {options.map((o) => {
          const active = value === o.v;
          return (
            <label
              key={o.v}
              className={`flex-1 cursor-pointer rounded-full border px-5 py-2.5 text-center font-sans text-[12px] uppercase tracking-wide2 transition-all duration-300 ${
                active
                  ? "border-transparent bg-gold text-night shadow-[0_0_18px_-4px_rgba(201,162,94,0.75)]"
                  : "border-fg/25 text-fg hover:border-fg/60"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.v}
                checked={active}
                onChange={() => onChange(o.v)}
                required
                className="sr-only"
              />
              {o.t}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ref, setRef] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const set = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { id, ref: newRef } = await createReservation({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        alcohol: form.alcohol,
        allergies: form.allergies,
        allergyDetails: form.allergies === "oui" ? form.allergyDetails.trim() : "",
      });
      setRef(newRef);

      // QR encodes the reservation id (scanner looks up live data). Generated
      // client-side so the ticket works without any email service.
      try {
        const url = await QRCode.toDataURL(id, {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 8,
          color: { dark: "#131732", light: "#f5f2ea" },
        });
        setQrUrl(url);
        // Trigger the ticket download straight away.
        await downloadTicket(url, newRef, form.name.trim());
      } catch {
        /* the reservation is already saved even if QR fails */
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const downloadTicket = async (
    qrSrc: string = qrUrl,
    refValue: string = ref,
    name: string = form.name
  ) => {
    if (!qrSrc) return;
    const scale = 2;
    const W = 900;
    const H = 1340;
    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    // background
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b0e26");
    g.addColorStop(1, "#14173a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // gold frame
    ctx.strokeStyle = "rgba(201,162,94,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    const center = (
      t: string,
      y: number,
      font: string,
      color: string,
      ls = 0
    ) => {
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      try {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          `${ls}px`;
      } catch {}
      ctx.fillText(t, W / 2, y);
    };

    try {
      const [logo, qr] = await Promise.all([
        loadImage("/images/logo-icon-orange.png"),
        loadImage(qrSrc),
      ]);

      const lw = 92;
      const lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, (W - lw) / 2, 78, lw, lh);

      let y = 78 + lh + 46;
      center("CÉRÉMONIE D'OUVERTURE OFFICIELLE", y, "600 13px Arial", "#c9a25e", 3);
      y += 62;
      center("MOONLIGHT", y, "400 60px Georgia", "#f2efe6", 6);
      y += 34;
      center("COCKTAIL BAR", y, "400 14px Arial", "#c9a25e", 6);

      // QR
      const q = 300;
      const qx = (W - q) / 2;
      const qy = y + 46;
      ctx.fillStyle = "#f5f2ea";
      const r = 16;
      const bx = qx - 16;
      const by = qy - 16;
      const bs = q + 32;
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.arcTo(bx + bs, by, bx + bs, by + bs, r);
      ctx.arcTo(bx + bs, by + bs, bx, by + bs, r);
      ctx.arcTo(bx, by + bs, bx, by, r);
      ctx.arcTo(bx, by, bx + bs, by, r);
      ctx.closePath();
      ctx.fill();
      ctx.drawImage(qr, qx, qy, q, q);

      y = qy + q + 52;
      center(refValue, y, "400 17px Arial", "#c9a25e", 3);

      // divider
      y += 34;
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.beginPath();
      ctx.moveTo(W / 2 - 120, y);
      ctx.lineTo(W / 2 + 120, y);
      ctx.stroke();

      y += 58;
      center(name || "Invité", y, "italic 42px Georgia", "#f2efe6", 0);
      y += 46;
      center("SAMEDI 8 AOÛT 2026 · 18 H 00", y, "400 14px Arial", "rgba(242,239,230,0.85)", 2);
      y += 26;
      center("7300 RUE SAINT-JACQUES", y, "400 13px Arial", "rgba(183,178,199,0.9)", 1);

      center(
        "Présentez ce billet à l'entrée",
        H - 70,
        "italic 16px Georgia",
        "rgba(183,178,199,0.9)",
        0
      );

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `billet-moonlight-${refValue || "invitation"}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error("ticket download failed", err);
    }
  };

  const isValid = Boolean(
    form.name.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.alcohol &&
      form.allergies &&
      (form.allergies !== "oui" || form.allergyDetails.trim())
  );

  return (
    <section id="reservation" className="relative overflow-hidden bg-surface py-28 lg:py-40">
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 flex items-baseline justify-center gap-4">
          <span className="numeral">V</span>
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
                Réservez votre place pour la cérémonie d'ouverture. Vous obtiendrez
                aussitôt votre billet nominatif avec un QR code personnel, à
                télécharger et à présenter à l'entrée le soir de l'événement.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <ul className="mt-10 space-y-6">
                {[
                  ["01", "Complétez le formulaire"],
                  ["02", "Téléchargez votre billet (QR code)"],
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

                        <Choice
                          name="alcohol"
                          label="Consommez-vous de l'alcool ?"
                          value={form.alcohol}
                          onChange={set("alcohol")}
                        />

                        <Choice
                          name="allergies"
                          label="Avez-vous des allergies ?"
                          value={form.allergies}
                          onChange={(v) =>
                            setForm((f) => ({
                              ...f,
                              allergies: v,
                              allergyDetails: v === "oui" ? f.allergyDetails : "",
                            }))
                          }
                        />

                        <AnimatePresence initial={false}>
                          {form.allergies === "oui" && (
                            <motion.div
                              key="allergy-details"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <label htmlFor="allergyDetails" className="block pt-1">
                                <span className="mb-2 block font-sans text-[11px] uppercase tracking-wide2 text-gold">
                                  Précisez vos allergies
                                </span>
                                <textarea
                                  id="allergyDetails"
                                  required
                                  rows={2}
                                  value={form.allergyDetails}
                                  onChange={(e) => set("allergyDetails")(e.target.value)}
                                  placeholder="Fruits à coque, gluten, lactose…"
                                  className="w-full resize-none border-b border-fg/25 bg-transparent px-1 py-3 font-sans text-fg placeholder:text-fg/30 outline-none transition-colors duration-300 focus:border-gold"
                                />
                              </label>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !isValid}
                        className="btn-luxe w-full disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? "Préparation du billet…" : "Télécharger mon billet"}
                      </button>

                      {error && (
                        <p className="text-center font-sans text-[12px] font-light text-terracotta">
                          {error}
                        </p>
                      )}

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
                              {qrUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={qrUrl}
                                  alt="QR code invitation"
                                  className="h-20 w-20 sm:h-24 sm:w-24"
                                />
                              ) : (
                                <FauxQR seed={ref} className="h-20 w-20 text-night sm:h-24 sm:w-24" />
                              )}
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
                            <span>Samedi 8 Août 2026</span>
                            <span>18 h 00</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => downloadTicket()}
                        disabled={!qrUrl}
                        className="btn-luxe mt-7 w-full disabled:opacity-60"
                      >
                        Télécharger à nouveau mon billet
                      </button>

                      <p className="mt-5 text-center font-sans text-[12px] font-light leading-relaxed text-muted">
                        Votre billet a été téléchargé. Conservez-le et présentez le QR
                        code à l'entrée le soir de l'événement.
                      </p>

                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setForm(empty);
                          setRef("");
                          setQrUrl("");
                          setError("");
                        }}
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
