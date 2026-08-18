import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MAILING_COLLECTION, MAILING_TOKENS_COLLECTION, type MailingList } from "@/lib/mailing";

/** Résolution d'un jeton de désabonnement, pour les deux listes.
 *
 *  Le destinataire n'a pas à savoir de quelle liste venait le message : une
 *  seule page, une seule route, un seul jeton. L'index `mailingTokens` porte
 *  la liste d'origine et l'identifiant de la fiche à modifier. */

export type ResolvedToken = { email: string; list: MailingList; ref: string };

export async function resolveToken(token: string): Promise<ResolvedToken | null> {
  const clean = token.trim();
  if (!clean || clean.length > 200 || clean.includes("/")) return null;

  const snap = await getDoc(doc(db, MAILING_TOKENS_COLLECTION, clean));
  if (!snap.exists()) return null;

  const data = snap.data() as { email?: string; list?: MailingList; ref?: string };
  if (!data.email || !data.ref) return null;

  return { email: data.email, list: data.list ?? "mailing", ref: data.ref };
}

export type UnsubscribeResult = { ok: boolean; email?: string };

/** Effectue le retrait. Idempotent : réappelée sur une fiche déjà retirée,
 *  elle réécrit les mêmes valeurs et rend le même résultat.
 *
 *  Le champ « preuve » n'est pas décoratif : les règles Firestore comparent la
 *  valeur écrite au jeton stocké dans la fiche, que l'appelant anonyme ne peut
 *  pas lire. Connaître l'adresse ne suffit donc pas à désabonner quelqu'un —
 *  il faut le jeton. */
export async function unsubscribeByToken(token: string): Promise<UnsubscribeResult> {
  const resolved = await resolveToken(token);
  if (!resolved) return { ok: false };

  if (resolved.list === "newsletter") {
    await updateDoc(doc(db, "newsletter", resolved.ref), {
      unsubscribedAt: serverTimestamp(),
      unsubProof: token,
    });
  } else {
    await updateDoc(doc(db, MAILING_COLLECTION, resolved.ref), {
      status: "unsubscribed",
      unsubscribedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unsubscribeProof: token,
    });
  }

  return { ok: true, email: resolved.email };
}
