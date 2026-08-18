import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
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

export const MESSAGES_COLLECTION = COLLECTION;
