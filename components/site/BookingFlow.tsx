"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AddressField, { type Place } from "./AddressField";
import {
  createBooking,
  getAvailability,
  getTakenDates,
  simulateDeposit,
  DEFAULT_AVAILABILITY,
  type Availability,
} from "@/lib/bookings";
import { EVENT_TYPES, PACKAGES, PRICING, money } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;
const STEPS = ["Date", "Votre événement", "Vos coordonnées", "Récapitulatif"];

const key = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const longDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DOW = ["L", "M", "M", "J", "V", "S", "D"];

export default function BookingFlow() {
  const [step, setStep] = useState(0);
  const [avail, setAvail] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [taken, setTaken] = useState<string[]>([]);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState(DEFAULT_AVAILABILITY.defaultStart);
  const [endTime, setEndTime] = useState(DEFAULT_AVAILABILITY.defaultEnd);
  const [eventType, setEventType] = useState("");
  const [eventTypeOther, setEventTypeOther] = useState("");
  const [guests, setGuests] = useState(60);
  const [packageKey, setPackageKey] = useState("signature");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState<Place>({
    label: "", road: "", city: "", postcode: "", lat: null, lon: null,
  });
  const [addressNote, setAddressNote] = useState("");
  const [notes, setNotes] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [depositDone, setDepositDone] = useState(false);

  useEffect(() => {
    getAvailability().then((a) => {
      setAvail(a);
      setStartTime(a.defaultStart);
      setEndTime(a.defaultEnd);
    });
    getTakenDates().then(setTaken);
  }, []);

  /* ---------------- Calendrier ---------------- */

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + avail.leadTimeDays);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [avail.leadTimeDays]);

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    // Lundi comme premier jour de la semaine.
    const lead = (first.getDay() + 6) % 7;
    const cells: (Date | null)[] = Array(lead).fill(null);
    for (let i = 1; i <= last.getDate(); i++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    }
    return cells;
  }, [cursor]);

  const dayState = (d: Date) => {
    const k = key(d);
    if (d < minDate) return "past";
    if (taken.includes(k)) return "taken";
    if (avail.closedDates.includes(k)) return "closed";
    if (avail.closedWeekdays.includes(d.getDay())) return "closed";
    return "open";
  };

  /* ---------------- Estimation ---------------- */

  const pkg = PACKAGES.find((p) => p.key === packageKey) ?? PACKAGES[1];

  const estimate = useMemo(() => {
    // Barème indicatif : le forfait couvre un effectif, chaque invité au-delà
    // se facture à l'unité. À CONFIRMER avec vos vrais tarifs.
    const included = Number(pkg.guests.replace(/\D/g, "")) || 50;
    const extra = Math.max(0, guests - included);
    return Math.max(PRICING.startingAt, pkg.from + extra * 12);
  }, [pkg, guests]);

  /* ---------------- Validation par étape ---------------- */

  const stepValid = [
    Boolean(date),
    Boolean(
      startTime && endTime && eventType &&
      (eventType !== "autre" || eventTypeOther.trim()) &&
      guests > 0
    ),
    Boolean(name.trim() && email.trim() && phone.trim() && place.label.trim()),
    true,
  ];

  const submit = async () => {
    if (sending) return;
    setError("");
    setSending(true);
    try {
      const id = await createBooking({
        date, startTime, endTime,
        eventType,
        eventTypeOther: eventType === "autre" ? eventTypeOther.trim() : "",
        guests,
        packageKey,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: place.road || place.label,
        city: place.city,
        postalCode: place.postcode,
        addressNote: addressNote.trim(),
        lat: place.lat,
        lon: place.lon,
        notes: notes.trim(),
        estimate,
      });
      setBookingId(id);
    } catch (err) {
      console.error(err);
      setError("Envoi impossible pour le moment. Réessayez dans un instant.");
    } finally {
      setSending(false);
    }
  };

  /* ---------------- Confirmation ---------------- */

  if (bookingId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="mx-auto max-w-2xl rounded-2xl bg-surface/50 p-8 text-center sm:p-12"
      >
        <span className="text-5xl">🌙</span>
        <h2 className="engraved mt-7 text-[24px] leading-tight text-fg sm:text-[30px]">
          Demande envoyée
        </h2>
        <div className="rule mx-auto my-8 max-w-[6rem]" />
        <p className="mx-auto max-w-md font-sans text-[14px] font-light leading-[2] text-muted">
          Votre demande pour le <span className="text-fg">{longDate(date)}</span>{" "}
          est enregistrée. Nous l&apos;étudions et vous répondons{" "}
          <span className="text-fg">sous 24 heures</span>. Si elle est acceptée,
          vous recevrez une confirmation par email à {email}.
        </p>

        <div className="mt-10 rounded-2xl border border-fg/10 bg-fg/[0.02] p-6 text-left">
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
            Acompte
          </p>
          <p className="mt-3 font-sans text-[13px] font-light leading-[1.9] text-muted">
            Un acompte de {money(PRICING.deposit)} confirmera et bloquera la
            date. Il vous sera demandé une fois la demande acceptée, et se
            déduira du montant final.
          </p>

          {depositDone ? (
            <p className="mt-5 rounded-full bg-emerald-500/15 py-3 text-center font-sans text-[11px] uppercase tracking-[0.2em] text-emerald-400">
              ✓ Acompte simulé, aucun paiement réel
            </p>
          ) : (
            <button
              onClick={async () => {
                await simulateDeposit(bookingId);
                setDepositDone(true);
              }}
              className="btn-ghost mt-5 w-full justify-center"
            >
              Simuler le paiement de l&apos;acompte
            </button>
          )}
          <p className="mt-3 text-center font-sans text-[10px] leading-relaxed text-muted/70">
            Démonstration : aucune coordonnée bancaire n&apos;est demandée ni
            enregistrée. Le paiement réel passera par Stripe.
          </p>
        </div>
      </motion.div>
    );
  }

  /* ---------------- Parcours ---------------- */

  return (
    <div className="mx-auto max-w-3xl">
      {/* Fil des étapes */}
      <div className="sticky top-4 z-20 mb-10 rounded-full bg-bg/85 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.6)] px-5 py-3 backdrop-blur-xl">
        <ol className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-sans text-[10px] tabular-nums transition-all duration-500 ${
                  i < step
                    ? "bg-fg text-bg"
                    : i === step
                    ? "border border-gold text-gold"
                    : "border border-fg/20 text-muted"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span
                className={`hidden truncate font-sans text-[10px] uppercase tracking-[0.16em] sm:block ${
                  i === step ? "text-fg" : "text-muted"
                }`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <span className="hidden h-px flex-1 bg-fg/15 sm:block" />
              )}
            </li>
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait">
        {/* ---------- Étape 1 : date ---------- */}
        {step === 0 && (
          <motion.section
            key="date"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease }}
            className="rounded-2xl bg-surface/50 p-5 sm:p-8"
          >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14">
          <div>
            <div className="mb-7 flex items-center justify-between gap-4">
              <button
                onClick={() =>
                  setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
                }
                aria-label="Mois précédent"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-fg/20 text-fg transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                ‹
              </button>
              <p className="engraved text-[17px] text-fg">
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </p>
              <button
                onClick={() =>
                  setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
                }
                aria-label="Mois suivant"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-fg/20 text-fg transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DOW.map((d, i) => (
                <span
                  key={i}
                  className="pb-2 text-center font-sans text-[10px] uppercase tracking-[0.12em] text-muted/70"
                >
                  {d}
                </span>
              ))}
              {days.map((d, i) => {
                if (!d) return <span key={`e${i}`} />;
                const k = key(d);
                const state = dayState(d);
                const selected = date === k;
                return (
                  <button
                    key={k}
                    disabled={state !== "open"}
                    onClick={() => setDate(k)}
                    title={
                      state === "taken"
                        ? "Date déjà réservée"
                        : state === "closed"
                        ? "Fermé"
                        : undefined
                    }
                    className={`flex h-11 items-center justify-center rounded-xl font-sans text-[13px] tabular-nums transition-all duration-400 ${
                      selected
                        ? "bg-fg text-bg ring-2 ring-gold/70 ring-offset-2 ring-offset-bg"
                        : state === "open"
                        ? "border border-fg/15 text-fg hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold"
                        : state === "taken"
                        ? "border border-terracotta/30 text-terracotta/60 line-through"
                        : "text-muted/40"
                    }`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Colonne d'appoint : la date retenue, les repères de lecture et
              les conditions. Elle occupe la largeur au lieu de la laisser vide
              et répond aux questions avant qu'on les pose. */}
          <div className="flex flex-col justify-center gap-8">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-gold">
                Date retenue
              </p>
              <p className="engraved mt-4 text-[19px] leading-snug text-fg sm:text-[23px]">
                {date ? longDate(date) : "Aucune pour l'instant"}
              </p>
              {!date && (
                <p className="mt-3 font-sans text-[12px] font-light leading-relaxed text-muted">
                  Choisissez un soir dans le calendrier. Les dates barrées sont
                  déjà retenues par d'autres réceptions.
                </p>
              )}
            </div>

            <ul className="flex flex-col gap-3 border-t border-fg/12 pt-7 font-sans text-[10px] uppercase tracking-[0.14em] text-muted">
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded border border-fg/30" /> Libre
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded border border-terracotta/40" /> Déjà réservé
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded bg-fg ring-1 ring-gold/70" /> Votre choix
              </li>
            </ul>

            <p className="border-t border-fg/12 pt-7 font-sans text-[12px] font-light leading-[1.9] text-muted">
              Réservation possible à partir de {avail.leadTimeDays} jours.
              Un acompte de {money(PRICING.deposit)} confirmera la date une fois
              votre demande acceptée.
            </p>
          </div>
          </div>
          </motion.section>
        )}

        {/* ---------- Étape 2 : événement ---------- */}
        {step === 1 && (
          <motion.section
            key="event"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease }}
            className="space-y-5"
          >
            <div className="rounded-2xl bg-surface/50 p-5 sm:p-7">
              <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                Horaires du service
              </p>
              <div className="grid grid-cols-2 gap-5">
                {([
                  ["Début", startTime, setStartTime],
                  ["Fin", endTime, setEndTime],
                ] as const).map(([label, val, set]) => (
                  <label key={label} className="block">
                    <span className="mb-2 block font-sans text-[11px] font-light text-muted">
                      {label}
                    </span>
                    <input
                      type="time"
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      className="field-luxe"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-surface/50 p-5 sm:p-7">
              <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                Type d&apos;événement
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {EVENT_TYPES.map((t) => {
                  const active = eventType === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setEventType(t.value)}
                      className={`chip ${active ? "chip-on" : ""}`}
                    >
                      <span className="chip-emoji">{t.emoji}</span>
                      <span
                        className={`font-sans text-[9px] uppercase leading-tight tracking-[0.1em] ${
                          active ? "text-gold" : "text-muted"
                        }`}
                      >
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {eventType === "autre" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="overflow-hidden"
                  >
                    <label className="mt-6 block">
                      <span className="mb-2 block font-sans text-[10px] uppercase tracking-[0.24em] text-gold">
                        Précisez
                      </span>
                      <input
                        type="text"
                        value={eventTypeOther}
                        onChange={(e) => setEventTypeOther(e.target.value)}
                        placeholder="De quel événement s'agit-il ?"
                        className="field-luxe"
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="rounded-2xl bg-surface/50 p-5 sm:p-7">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                  Nombre d&apos;invités
                </p>
                <span className="engraved text-[22px] text-fg">{guests}</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-5 w-full accent-[#c9a25e]"
              />

              <p className="mb-4 mt-8 font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                Forfait
              </p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {PACKAGES.map((p) => {
                  const active = packageKey === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setPackageKey(p.key)}
                      className={`rounded-2xl border p-4 text-left transition-all duration-500 ${
                        active
                          ? "border-gold bg-gold/12"
                          : "border-fg/15 hover:border-gold/50"
                      }`}
                    >
                      <span className="block font-sans text-[13px] text-fg">
                        {p.name}
                      </span>
                      <span className="mt-1 block font-sans text-[11px] font-light text-muted">
                        dès {money(p.from)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl border border-gold/25 bg-gold/[0.06] p-5">
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-gold">
                  Estimation indicative
                </p>
                <p className="engraved mt-2 text-[26px] text-fg">
                  {money(estimate)}
                </p>
                <p className="mt-2 font-sans text-[11px] font-light leading-relaxed text-muted">
                  Hors déplacement au-delà de {PRICING.freeRadiusKm} km. Le devis
                  définitif vous est transmis avec notre réponse.
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* ---------- Étape 3 : coordonnées ---------- */}
        {step === 2 && (
          <motion.section
            key="contact"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease }}
            className="space-y-7 rounded-2xl bg-surface/50 p-5 sm:p-8"
          >
            <div className="grid gap-7 sm:grid-cols-2">
              {([
                ["Nom complet", name, setName, "text", "name"],
                ["Email", email, setEmail, "email", "email"],
                ["Téléphone", phone, setPhone, "tel", "tel"],
              ] as const).map(([label, val, set, type, ac]) => (
                <label key={label} className="block">
                  <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                    {label}
                  </span>
                  <input
                    type={type}
                    required
                    autoComplete={ac}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="field-luxe"
                  />
                </label>
              ))}
            </div>

            <AddressField value={place} onChange={setPlace} />

            <label className="block">
              <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                Précisions d&apos;accès (facultatif)
              </span>
              <input
                type="text"
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                placeholder="Étage, code, stationnement, accès par la cour…"
                className="field-luxe"
              />
            </label>

            <label className="block">
              <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
                Votre projet (facultatif)
              </span>
              <textarea
                rows={4}
                maxLength={2000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ambiance recherchée, contraintes, envies particulières…"
                className="area-luxe"
              />
            </label>
          </motion.section>
        )}

        {/* ---------- Étape 4 : récapitulatif ---------- */}
        {step === 3 && (
          <motion.section
            key="recap"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease }}
            className="rounded-2xl bg-surface/50 p-5 sm:p-8"
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
              Récapitulatif
            </p>

            <dl className="mt-7 space-y-4">
              {[
                ["Date", longDate(date)],
                ["Horaires", `${startTime} → ${endTime}`],
                [
                  "Événement",
                  eventType === "autre"
                    ? eventTypeOther
                    : EVENT_TYPES.find((t) => t.value === eventType)?.label ?? "",
                ],
                ["Invités", String(guests)],
                ["Forfait", pkg.name],
                ["Adresse", place.label],
                ["Contact", `${name} · ${email} · ${phone}`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-fg/8 pb-3"
                >
                  <dt className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">
                    {k}
                  </dt>
                  <dd className="max-w-md text-right font-sans text-[13px] font-light text-fg">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex items-baseline justify-between">
              <span className="font-sans text-[12px] uppercase tracking-[0.2em] text-muted">
                Estimation
              </span>
              <span className="engraved text-[26px] text-fg">{money(estimate)}</span>
            </div>

            <p className="mt-7 rounded-2xl border border-fg/10 bg-fg/[0.02] p-5 font-sans text-[12px] font-light leading-[1.9] text-muted">
              En envoyant cette demande, vous ne payez rien. Nous l&apos;étudions
              et vous répondons sous 24 heures. Si elle est acceptée, un acompte
              de {money(PRICING.deposit)} confirmera et bloquera la date.
            </p>

            {error && (
              <p className="mt-4 text-center font-sans text-[12px] font-light text-terracotta">
                {error}
              </p>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-ghost disabled:pointer-events-none disabled:opacity-0"
        >
          Retour
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!stepValid[step]}
            className="btn-luxe disabled:cursor-not-allowed disabled:opacity-45"
          >
            Continuer
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={sending}
            className="btn-luxe disabled:cursor-not-allowed disabled:opacity-45"
          >
            {sending ? "Envoi…" : "Envoyer ma demande"}
          </button>
        )}
      </div>

      {!stepValid[step] && step < STEPS.length - 1 && (
        <p className="mt-4 text-center font-sans text-[11px] font-light text-muted">
          {step === 0
            ? "Choisissez une date disponible pour continuer."
            : "Complétez les champs requis pour continuer."}
        </p>
      )}
    </div>
  );
}
