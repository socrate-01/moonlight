import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { hashEmail, normaliseEmail } from "./attendees";

export type Subscriber = {
  id: string;
  email: string;
  /** Origine de l'inscription, utile pour mesurer ce qui convertit. */
  source: string;
  /** Preuve de consentement : la LCAP impose de pouvoir la produire. */
  consentAt?: Timestamp | null;
  /** Jeton du lien de désabonnement, à mettre dans chaque envoi. */
  token: string;
  unsubscribedAt?: Timestamp | null;
};

const COLLECTION = "newsletter";

const makeToken = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/** L'identifiant est l'empreinte de l'adresse : une inscription par personne,
 *  et une réinscription réactive la même fiche au lieu d'en créer une autre. */
export async function subscribe(email: string, source = "site") {
  const clean = normaliseEmail(email);
  const id = await hashEmail(clean);
  const ref = doc(db, COLLECTION, id);

  const existing = await getDoc(ref);
  if (existing.exists() && !existing.data().unsubscribedAt) {
    return { ok: true, already: true };
  }

  await setDoc(ref, {
    email: clean,
    source,
    consentAt: serverTimestamp(),
    token: existing.exists() ? existing.data().token : makeToken(),
    unsubscribedAt: null,
  });
  return { ok: true, already: false };
}

export function watchSubscribers(cb: (items: Subscriber[]) => void) {
  const qy = query(collection(db, COLLECTION), orderBy("consentAt", "desc"));
  return onSnapshot(qy, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as Subscriber)));
  });
}

export const NEWSLETTER_COLLECTION = COLLECTION;
