import { createVerify, X509Certificate } from "node:crypto";
import { adminEmails, firebaseProjectId } from "./env";

/** Vérification côté serveur d'un jeton d'identité Firebase.
 *
 *  Pourquoi c'est indispensable : une route API n'hérite pas de la protection
 *  de l'écran d'admin, elle est appelable directement. Sans cette vérification,
 *  connaître l'URL suffirait à écrire à toute la liste.
 *
 *  Pourquoi c'est écrit à la main plutôt qu'avec firebase-admin : le projet
 *  n'embarque que le SDK client et ne dispose d'aucun compte de service. La
 *  validation d'un jeton signé en RS256 contre les certificats publics de
 *  Google tient en quelques dizaines de lignes et n'ajoute aucune dépendance
 *  ni aucun secret à déployer. */

const CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let certsCache: { keys: Record<string, string>; expiresAt: number } | null = null;

async function googleCerts(): Promise<Record<string, string>> {
  if (certsCache && certsCache.expiresAt > Date.now()) return certsCache.keys;

  const res = await fetch(CERTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Certificats Google indisponibles (${res.status})`);

  const keys = (await res.json()) as Record<string, string>;
  // Google annonce lui-même la durée de validité ; on la respecte plutôt que
  // d'inventer un délai, et on retélécharge donc rarement.
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control") ?? "")?.[1]);
  certsCache = {
    keys,
    expiresAt: Date.now() + (Number.isFinite(maxAge) && maxAge > 0 ? maxAge : 3600) * 1000,
  };
  return keys;
}

function fromBase64Url(value: string) {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export type AdminIdentity = { uid: string; email: string | null };

/** Rend l'identité si le jeton est valide, `null` sinon. Ne lève pas : les
 *  appelants veulent un 401, pas une trace de pile. */
export async function verifyIdToken(idToken: string): Promise<AdminIdentity | null> {
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;

  let header: { alg?: string; kid?: string };
  let payload: {
    iss?: string;
    aud?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
  };
  try {
    header = JSON.parse(fromBase64Url(parts[0]).toString("utf8"));
    payload = JSON.parse(fromBase64Url(parts[1]).toString("utf8"));
  } catch {
    return null;
  }

  if (header.alg !== "RS256" || !header.kid) return null;

  const projectId = firebaseProjectId();
  const now = Math.floor(Date.now() / 1000);

  // Les trois contrôles qui comptent : bon émetteur, bon destinataire, non
  // expiré. Une tolérance de 60 s absorbe les horloges décalées.
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
  if (payload.aud !== projectId) return null;
  if (!payload.sub) return null;
  if (!payload.exp || payload.exp + 60 < now) return null;
  if (payload.iat && payload.iat - 60 > now) return null;

  const certs = await googleCerts();
  const pem = certs[header.kid];
  if (!pem) return null;

  let ok = false;
  try {
    ok = createVerify("RSA-SHA256")
      .update(`${parts[0]}.${parts[1]}`)
      .verify(new X509Certificate(pem).publicKey, fromBase64Url(parts[2]));
  } catch {
    return null;
  }
  if (!ok) return null;

  return { uid: payload.sub, email: payload.email?.toLowerCase() ?? null };
}

export class Unauthorized extends Error {
  constructor(message = "Accès refusé.") {
    super(message);
    this.name = "Unauthorized";
  }
}

/** À appeler en première ligne de TOUTE route d'administration.
 *
 *  Le jeton arrive dans l'en-tête `Authorization: Bearer …` ; côté navigateur
 *  il vient de `auth.currentUser.getIdToken()`. */
export async function requireAdmin(request: Request): Promise<AdminIdentity> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new Unauthorized("Jeton d'administration manquant.");

  const identity = await verifyIdToken(token);
  if (!identity) throw new Unauthorized("Jeton d'administration invalide ou expiré.");

  const allowed = adminEmails();
  if (allowed.length > 0 && (!identity.email || !allowed.includes(identity.email))) {
    throw new Unauthorized("Ce compte n'est pas autorisé à envoyer des courriels.");
  }

  return identity;
}
