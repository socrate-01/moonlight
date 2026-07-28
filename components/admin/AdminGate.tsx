"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    setReady(true);
  }), []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
    } catch {
      setErr("Identifiants invalides.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg font-sans text-sm text-muted">
        Chargement…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-fg/10 bg-surface p-8 sm:p-10"
        >
          <h1 className="text-center font-display text-3xl font-light text-fg">
            Espace <span className="italic text-gradient">admin</span>
          </h1>
          <p className="mt-1 text-center font-sans text-[11px] uppercase tracking-luxe text-gold">
            Moonlight Cocktail Bar
          </p>

          <div className="mt-8 space-y-6">
            <label className="block">
              <span className="mb-2 block font-sans text-[11px] uppercase tracking-wide2 text-gold">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-fg/25 bg-transparent px-1 py-3 font-sans text-fg outline-none transition-colors focus:border-gold"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-sans text-[11px] uppercase tracking-wide2 text-gold">
                Mot de passe
              </span>
              <input
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full border-b border-fg/25 bg-transparent px-1 py-3 font-sans text-fg outline-none transition-colors focus:border-gold"
              />
            </label>
          </div>

          {err && (
            <p className="mt-4 text-center font-sans text-[12px] text-terracotta">{err}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-luxe mt-8 w-full disabled:opacity-70"
          >
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
