import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Message = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  handled: boolean;
  createdAt?: Timestamp | null;
};

const COLLECTION = "messages";

export async function sendMessage(
  data: Omit<Message, "id" | "handled" | "createdAt">
) {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    handled: false,
    createdAt: serverTimestamp(),
  });
}

export function watchMessages(cb: (items: Message[]) => void) {
  const qy = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(qy, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as Message)));
  });
}

/** Marque un message comme traité, pour distinguer d'un coup d'œil ce qui
 *  reste à faire de ce qui a déjà reçu une réponse. */
export async function setMessageHandled(id: string, handled: boolean) {
  await updateDoc(doc(db, COLLECTION, id), { handled });
}

export async function deleteMessage(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export const MESSAGES_COLLECTION = COLLECTION;
