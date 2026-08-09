import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

/** Adresses de test, autorisées en plus des inscrits réels.
 *  Ce sont de fausses adresses : les laisser en clair ici n'expose personne.
 *  Vider ce tableau puis resynchroniser depuis /admin pour les retirer. */
export const TEST_EMAILS = [
  "eva@gmail.com",
  "socrate@gmail.com",
  "dabakh@gmail.com",
];

const COLLECTION = "attendees";

/** Normalisation appliquée avant hachage, côté serveur comme côté client. */
export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

/** SHA-256 hexadécimal via Web Crypto — disponible aussi bien dans le
 *  navigateur que dans le runtime Node des routes API. */
export async function hashEmail(email: string) {
  const data = new TextEncoder().encode(normaliseEmail(email));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** La collection `attendees` ne contient que des empreintes d'emails, sans
 *  aucune donnée : c'est la liste blanche que les règles Firestore consultent
 *  pour autoriser (ou non) le dépôt d'un avis. Aucune adresse en clair n'y
 *  figure, et les règles interdisent de l'énumérer.
 *
 *  Réservé aux admins authentifiés. */
export async function syncAttendees(emails: string[]) {
  const wanted = new Set<string>();
  for (const e of emails) {
    const n = normaliseEmail(e);
    if (!n) continue;
    wanted.add(await hashEmail(n));
    // Deux inscrits ont saisi « .con » (domaine inexistant) : on accepte aussi
    // la variante « .com » pour ne pas les bloquer.
    if (n.endsWith(".con")) wanted.add(await hashEmail(n.slice(0, -4) + ".com"));
  }

  const existing = new Set(
    (await getDocs(collection(db, COLLECTION))).docs.map((d) => d.id)
  );

  const toAdd = Array.from(wanted).filter((h) => !existing.has(h));
  const toRemove = Array.from(existing).filter((h) => !wanted.has(h));

  // writeBatch plafonne à 500 opérations ; on découpe par sécurité.
  const ops = [
    ...toAdd.map((h) => ({ h, add: true })),
    ...toRemove.map((h) => ({ h, add: false })),
  ];
  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(db);
    for (const op of ops.slice(i, i + 400)) {
      const ref = doc(db, COLLECTION, op.h);
      if (op.add) batch.set(ref, {});
      else batch.delete(ref);
    }
    await batch.commit();
  }

  return { total: wanted.size, added: toAdd.length, removed: toRemove.length };
}

/** Nombre d'adresses actuellement autorisées (lecture admin). */
export async function countAttendees() {
  return (await getDocs(collection(db, COLLECTION))).size;
}

export { COLLECTION as ATTENDEES_COLLECTION };
