import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/** Les six notations, dans l'ordre d'affichage du formulaire. */
export const RATING_QUESTIONS = [
  { key: "event", label: "L'événement dans son ensemble" },
  { key: "theme", label: "Le thème de la soirée" },
  { key: "dressCode", label: "Le respect du dress code par les invités" },
  { key: "cocktails", label: "Les cocktails" },
  { key: "evening", label: "Le déroulé de la soirée" },
  { key: "ambiance", label: "L'ambiance" },
] as const;

export type RatingKey = (typeof RATING_QUESTIONS)[number]["key"];

/** Échelle commune, de 1 à 5. */
export const RATING_SCALE = [
  { value: 1, emoji: "😞", label: "Décevant" },
  { value: 2, emoji: "😕", label: "Moyen" },
  { value: 3, emoji: "🙂", label: "Bien" },
  { value: 4, emoji: "😍", label: "Super" },
  { value: 5, emoji: "🤩", label: "Exceptionnel" },
] as const;

/** Le respect du dress code se note sur la même échelle, mais « décevant » n'a
 *  pas de sens : on reformule les libellés. */
export const DRESS_CODE_SCALE = [
  { value: 1, emoji: "🙈", label: "Pas du tout" },
  { value: 2, emoji: "😕", label: "Peu" },
  { value: 3, emoji: "🙂", label: "Plutôt bien" },
  { value: 4, emoji: "✨", label: "Très bien" },
  { value: 5, emoji: "👑", label: "Parfaitement" },
] as const;

export const RETURN_OPTIONS = [
  { value: "oui", emoji: "🎉", label: "Oui, sans hésiter" },
  { value: "peut-etre", emoji: "🤔", label: "Peut-être" },
  { value: "non", emoji: "🙁", label: "Non" },
] as const;

export type ReturnAnswer = (typeof RETURN_OPTIONS)[number]["value"];

export type Feedback = {
  id: string;
  email: string;
  ratings: Record<RatingKey, number>;
  returning: ReturnAnswer;
  comment: string;
  suggestions: string;
  createdAt?: Timestamp | null;
};

export type NewFeedback = Omit<Feedback, "id" | "createdAt">;

const COLLECTION = "feedbacks";

/** L'identifiant du document est l'empreinte de l'email : un avis par
 *  personne, et un renvoi du formulaire met à jour le précédent au lieu d'en
 *  créer un doublon. */
export async function saveFeedback(emailHash: string, data: NewFeedback) {
  await setDoc(doc(db, COLLECTION, emailHash), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deleteFeedback(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function watchFeedbacks(cb: (items: Feedback[]) => void) {
  const qy = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(qy, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as Feedback)));
  });
}

export const FEEDBACKS_COLLECTION = COLLECTION;
