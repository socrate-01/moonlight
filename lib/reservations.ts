import {
  addDoc,
  collection,
  doc,
  getDoc,
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

/** Create a reservation. Returns the new document id and its reference. */
export async function createReservation(data: NewReservation) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    present: false,
    createdAt: serverTimestamp(),
    presentAt: null,
  });
  const ref = makeRef(docRef.id);
  await updateDoc(docRef, { ref });
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

export const RESERVATIONS_COLLECTION = COLLECTION;
