import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { BLOCKING_STATUSES, type BookingStatus } from "./site";

/* ------------------------------------------------------------------ */
/* Disponibilités                                                      */
/* ------------------------------------------------------------------ */

export type Availability = {
  /** Jours de la semaine fermés (0 = dimanche). */
  closedWeekdays: number[];
  /** Dates fermées ponctuellement, au format AAAA-MM-JJ. */
  closedDates: string[];
  /** Délai minimum entre aujourd'hui et la date demandée. */
  leadTimeDays: number;
  /** Plage horaire proposée par défaut. */
  defaultStart: string;
  defaultEnd: string;
};

/** Valeurs de repli tant que l'admin n'a rien enregistré : sans elles, le
 *  calendrier serait vide et personne ne pourrait réserver. */
export const DEFAULT_AVAILABILITY: Availability = {
  closedWeekdays: [1], // lundi
  closedDates: [],
  leadTimeDays: 14,
  defaultStart: "18:00",
  defaultEnd: "01:00",
};

const AVAILABILITY_DOC = ["settings", "availability"] as const;

export async function getAvailability(): Promise<Availability> {
  try {
    const snap = await getDoc(doc(db, ...AVAILABILITY_DOC));
    if (!snap.exists()) return DEFAULT_AVAILABILITY;
    return { ...DEFAULT_AVAILABILITY, ...(snap.data() as Partial<Availability>) };
  } catch {
    // Règles non déployées ou réseau absent : le formulaire doit rester utilisable.
    return DEFAULT_AVAILABILITY;
  }
}

export async function saveAvailability(a: Availability) {
  await setDoc(doc(db, ...AVAILABILITY_DOC), a);
}

/* ------------------------------------------------------------------ */
/* Réservations                                                        */
/* ------------------------------------------------------------------ */

export type Booking = {
  id: string;
  /** AAAA-MM-JJ — comparable en chaîne, donc triable et interrogeable. */
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  eventTypeOther: string;
  guests: number;

  /** Ce que la personne veut, plutôt qu'un forfait choisi à l'aveugle.
   *  Voir SERVICE_OPTIONS dans lib/site.ts. */
  needs: string[];
  /** Fourchette annoncée par le demandeur. Elle oriente la proposition ;
   *  elle ne fixe pas le prix. */
  budget: string;
  /** « Comment avez-vous entendu parler de nous ? » */
  source: string;
  sourceOther: string;

  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  addressNote: string;
  /** Coordonnées issues de la recherche d'adresse, si trouvée. */
  lat: number | null;
  lon: number | null;
  notes: string;

  status: BookingStatus;
  adminNote: string;

  /* ---- Devis, renseignés par l'admin après étude ---- */
  /** Montant total proposé, en dollars. 0 tant qu'aucun devis n'est parti. */
  quoteAmount: number;
  /** Le mot qui accompagne le devis dans le courriel. */
  quoteMessage: string;
  /** Acompte attendu = part du devis (voir PRICING.depositRate). */
  depositAmount: number;
  /** Jeton du lien de proposition envoyé au client. Créé une seule fois. */
  quoteToken: string;

  /* ---- Paiement ---- */
  paymentLinkUrl: string;
  squareOrderId: string;

  createdAt?: Timestamp | null;
  decidedAt?: Timestamp | null;
  quoteSentAt?: Timestamp | null;
  confirmedAt?: Timestamp | null;
  depositPaidAt?: Timestamp | null;

  /** Ancien champ de démonstration, conservé pour les fiches déjà en base. */
  depositSimulated?: boolean;
  /** Ancienne estimation automatique, avant le passage au devis manuel. */
  estimate?: number;
  /** Ancien forfait choisi dans le formulaire. */
  packageKey?: string;
};

/** Ce que le formulaire public a le droit de déposer. Tout ce qui touche au
 *  prix ou au statut est absent : le demandeur ne chiffre pas sa propre
 *  demande, et ne s'accepte pas lui-même. */
export type NewBooking = Pick<
  Booking,
  | "date" | "startTime" | "endTime"
  | "eventType" | "eventTypeOther" | "guests"
  | "needs" | "budget" | "source" | "sourceOther"
  | "name" | "email" | "phone"
  | "address" | "city" | "postalCode" | "addressNote"
  | "lat" | "lon" | "notes"
>;

const COLLECTION = "bookings";

export async function createBooking(data: NewBooking) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: "pending" as BookingStatus,
    adminNote: "",
    quoteAmount: 0,
    quoteMessage: "",
    depositAmount: 0,
    quoteToken: "",
    paymentLinkUrl: "",
    squareOrderId: "",
    createdAt: serverTimestamp(),
    decidedAt: null,
    quoteSentAt: null,
    confirmedAt: null,
    depositPaidAt: null,
  });
  return ref.id;
}

/** Dates déjà retenues : une réservation acceptée retire la date du calendrier
 *  pour éviter de vendre deux fois la même soirée. */
export async function getTakenDates(): Promise<string[]> {
  try {
    const qy = query(
      collection(db, COLLECTION),
      where("status", "in", BLOCKING_STATUSES)
    );
    const snap = await getDocs(qy);
    return snap.docs.map((d) => (d.data() as Booking).date).filter(Boolean);
  } catch {
    return [];
  }
}

export function watchBookings(cb: (items: Booking[]) => void) {
  const qy = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(qy, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as Booking)));
  });
}

export async function setBookingStatus(
  id: string,
  status: BookingStatus,
  adminNote = ""
) {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    adminNote,
    decidedAt: serverTimestamp(),
  });
}

/** Enregistre le devis étudié par l'admin.
 *
 *  L'acompte n'est plus un montant fixe : c'est une part du devis, calculée
 *  ici une bonne fois pour toutes afin que le courriel, la page de
 *  proposition et le paiement annoncent tous le même chiffre. */
export async function saveQuote(
  id: string,
  values: { quoteAmount: number; quoteMessage: string; depositAmount: number; quoteToken: string }
) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...values,
    status: "quoted" as BookingStatus,
    quoteSentAt: serverTimestamp(),
    decidedAt: serverTimestamp(),
  });
}

/* ------------------------------------------------------------------ */
/* Jetons de proposition                                               */
/* ------------------------------------------------------------------ */

/** Index public jeton → proposition.
 *
 *  Le client qui reçoit un devis n'a pas de compte : le jeton contenu dans son
 *  lien lui tient lieu d'authentification. Comme pour le désabonnement, le
 *  jeton est l'identifiant du document, si bien que les règles peuvent
 *  autoriser `get` (il faut connaître le jeton) tout en interdisant `list`.
 *
 *  La fiche porte une copie des éléments nécessaires à l'affichage et au
 *  paiement. Sans elle, la page de proposition devrait lire la réservation
 *  elle-même — donc ouvrir en lecture publique une collection qui contient les
 *  coordonnées de tous les clients. */
export const BOOKING_TOKENS_COLLECTION = "bookingTokens";

export type QuoteToken = {
  bookingId: string;
  name: string;
  email: string;
  date: string;
  eventLabel: string;
  guests: number;
  needLabels: string;
  amount: number;
  depositAmount: number;
  message: string;
  currency: string;
};

export function makeQuoteToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Écrit (ou réécrit) la fiche publique de la proposition. Réservé à l'admin. */
export async function saveQuoteToken(token: string, values: QuoteToken) {
  await setDoc(doc(db, BOOKING_TOKENS_COLLECTION, token), values);
}

export async function getQuoteToken(token: string): Promise<QuoteToken | null> {
  const clean = token.trim();
  if (!clean || clean.length > 200 || clean.includes("/")) return null;
  const snap = await getDoc(doc(db, BOOKING_TOKENS_COLLECTION, clean));
  return snap.exists() ? (snap.data() as QuoteToken) : null;
}

export const BOOKINGS_COLLECTION = COLLECTION;
