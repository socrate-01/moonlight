"use client";

import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { getReservation, setPresent, type Reservation } from "@/lib/reservations";
import AdminShell from "@/components/admin/AdminShell";

type Result =
  | { kind: "found"; data: Reservation }
  | { kind: "notfound"; raw: string }
  | null;

function parseId(text: string): string {
  try {
    if (text.includes("id=")) return new URL(text).searchParams.get("id") || text;
  } catch {
    /* not a url */
  }
  return text.trim();
}

export default function Scanner() {
  const ref = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<Result>(null);
  const [camError, setCamError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const instance = new Html5Qrcode("qr-reader");
        ref.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decoded) => {
            if (cancelled) return;
            await handleDecoded(decoded);
          },
          () => {}
        );
      } catch {
        if (!cancelled) setCamError("Impossible d'accéder à la caméra.");
      }
    })();

    return () => {
      cancelled = true;
      const inst = ref.current;
      if (inst) {
        inst.stop().catch(() => {}).finally(() => inst.clear());
        ref.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const handleDecoded = async (text: string) => {
    const id = parseId(text);
    // stop the camera while showing the result
    const inst = ref.current;
    if (inst) {
      await inst.stop().catch(() => {});
      inst.clear();
      ref.current = null;
    }
    setScanning(false);
    const data = await getReservation(id);
    setResult(data ? { kind: "found", data } : { kind: "notfound", raw: id });
  };

  const confirm = async () => {
    if (result?.kind !== "found") return;
    setBusy(true);
    try {
      await setPresent(result.data.id, true);
      setResult({
        kind: "found",
        data: { ...result.data, present: true },
      });
    } finally {
      setBusy(false);
    }
  };

  const rescan = () => {
    setResult(null);
    setScanning(true);
  };

  return (
    <AdminShell title="Scanner">
      <div className="mx-auto max-w-lg">
        {scanning && (
          <div>
            <p className="mb-4 text-center font-sans text-[12px] uppercase tracking-luxe text-gold">
              Présentez le QR code
            </p>
            <div
              id="qr-reader"
              className="mx-auto overflow-hidden rounded-2xl border border-fg/15"
            />
            {camError && (
              <p className="mt-4 text-center font-sans text-sm text-terracotta">
                {camError}
              </p>
            )}
          </div>
        )}

        {result?.kind === "notfound" && (
          <div className="rounded-2xl border border-terracotta/50 bg-surface p-8 text-center">
            <p className="font-display text-2xl text-fg">Introuvable</p>
            <p className="mt-2 font-sans text-sm text-muted">
              Aucune réservation ne correspond à ce QR code.
            </p>
            <button onClick={rescan} className="btn-luxe mt-6">
              Scanner à nouveau
            </button>
          </div>
        )}

        {result?.kind === "found" && (
          <div className="rounded-2xl border border-fg/12 bg-surface p-8">
            <div className="text-center">
              {result.data.present ? (
                <p className="font-sans text-[11px] uppercase tracking-luxe text-emerald-400">
                  Déjà présent {result.data.presentAt ? "" : ""}
                </p>
              ) : (
                <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">
                  Réservation trouvée
                </p>
              )}
              <h2 className="mt-2 font-display text-3xl text-fg">{result.data.name}</h2>
            </div>

            <dl className="mt-6 space-y-3 border-t border-fg/10 pt-6">
              {[
                ["Email", result.data.email],
                ["Téléphone", result.data.phone],
                ["Référence", result.data.ref],
                ["Alcool", result.data.alcohol === "oui" ? "Oui" : "Non"],
                [
                  "Allergies",
                  result.data.allergies === "oui"
                    ? result.data.allergyDetails || "Oui"
                    : "Non",
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="font-sans text-[10px] uppercase tracking-wide2 text-gold">
                    {k}
                  </dt>
                  <dd className="text-right font-sans text-sm text-fg">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3">
              {result.data.present ? (
                <div className="rounded-full bg-emerald-500/15 py-3 text-center font-sans text-[12px] uppercase tracking-wide2 text-emerald-400">
                  ✓ Déjà entré
                </div>
              ) : (
                <button
                  onClick={confirm}
                  disabled={busy}
                  className="btn-luxe w-full disabled:opacity-70"
                >
                  {busy ? "Validation…" : "Confirmer la présence"}
                </button>
              )}
              <button onClick={rescan} className="btn-ghost w-full justify-center">
                Scanner le suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
