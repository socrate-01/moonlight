import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  alcohol: string; // "oui" | "non"
  allergies: string; // "oui" | "non"
  allergyDetails: string;
  ref: string;
  present: boolean;
  createdAt?: Timestamp | null;
  presentAt?: Timestamp | null;
};

export type NewReservation = Omit<
  Reservation,
  "id" | "present" | "createdAt" | "presentAt" | "ref"
>;

const COLLECTION = "reservations";

/** Short human-readable reference derived from the Firestore document id. */
export function makeRef(id: string): string {
  return "ML-" + id.slice(0, 6).toUpperCase() + "-2026";
}

/** Create a reservation in a single write (public create is allowed by the
 *  security rules; a second update would be rejected for anonymous users). */
export async function createReservation(data: NewReservation) {
  const docRef = doc(collection(db, COLLECTION)); // generate an id, no write yet
  const ref = makeRef(docRef.id);
  await setDoc(docRef, {
    ...data,
    ref,
    present: false,
    createdAt: serverTimestamp(),
    presentAt: null,
  });
  return { id: docRef.id, ref };
}

export async function getReservation(id: string): Promise<Reservation | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Reservation, "id">) };
}

export async function setPresent(id: string, present: boolean) {
  await updateDoc(doc(db, COLLECTION, id), {
    present,
    presentAt: present ? serverTimestamp() : null,
  });
}

export async function deleteReservation(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export const RESERVATIONS_COLLECTION = COLLECTION;
