"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type Place = {
  label: string;
  road: string;
  city: string;
  postcode: string;
  lat: number | null;
  lon: number | null;
};

type Hit = {
  display_name: string;
  lat: string;
  lon: string;
  address: Record<string, string>;
};

/** Autocomplétion d'adresse via Nominatim (OpenStreetMap) : gratuit et sans
 *  clé d'API, contrairement à Google Places. La politique d'usage impose de
 *  rester sous une requête par seconde — d'où le délai de 700 ms — et la
 *  saisie manuelle reste toujours possible si le service ne répond pas. */
export default function AddressField({
  value,
  onChange,
}: {
  value: Place;
  onChange: (p: Place) => void;
}) {
  const [q, setQ] = useState(value.label);
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 4 || q === value.label) {
      setHits([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const url =
          "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=ca&q=" +
          encodeURIComponent(q);
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Hit[];
        setHits(data);
        setOpen(true);
      } catch {
        setFailed(true);
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [q, value.label]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (h: Hit) => {
    const a = h.address || {};
    const road = [a.house_number, a.road].filter(Boolean).join(" ");
    onChange({
      label: h.display_name,
      road: road || h.display_name.split(",")[0],
      city: a.city || a.town || a.village || a.municipality || "",
      postcode: a.postcode || "",
      lat: Number(h.lat),
      lon: Number(h.lon),
    });
    setQ(h.display_name);
    setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <label htmlFor="address" className="block">
        <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
          Adresse de l&apos;événement
        </span>
        <input
          id="address"
          type="text"
          required
          autoComplete="off"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onChange({ ...value, label: e.target.value, lat: null, lon: null });
          }}
          onFocus={() => hits.length && setOpen(true)}
          placeholder="Commencez à taper, puis choisissez dans la liste…"
          className="field-luxe"
        />
      </label>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-sans text-[10px] text-muted/70">
          {loading
            ? "Recherche…"
            : failed
            ? "Recherche indisponible. Saisissez l'adresse à la main."
            : value.lat
            ? "✓ Adresse localisée"
            : "Suggestions fournies par OpenStreetMap"}
        </span>
      </div>

      <AnimatePresence>
        {open && hits.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl bg-surface/50 absolute z-30 mt-2 max-h-64 w-full overflow-auto p-2"
          >
            {hits.map((h) => (
              <li key={`${h.lat}-${h.lon}`}>
                <button
                  type="button"
                  onClick={() => pick(h)}
                  className="w-full rounded-xl px-4 py-3 text-left font-sans text-[13px] font-light leading-snug text-muted transition-colors duration-300 hover:bg-gold/10 hover:text-fg"
                >
                  {h.display_name}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
