import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BOOKINGS_COLLECTION,
  BOOKING_TOKENS_COLLECTION,
  type QuoteToken,
} from "@/lib/bookings";

/** Écritures déclenchées par le client sur sa propre réservation.
 *
 *  L'appelant n'est pas authentifié : il ne prouve son droit qu'en produisant
 *  le jeton reçu par courriel. Les règles Firestore comparent ce jeton à celui
 *  stocké dans la fiche, que personne ne peut lire sans être admin. */

export async function readQuoteToken(token: string): Promise<QuoteToken | null> {
  const clean = token.trim();
  if (!clean || clean.length > 200 || clean.includes("/")) return null;
  const snap = await getDoc(doc(db, BOOKING_TOKENS_COLLECTION, clean));
  return snap.exists() ? (snap.data() as QuoteToken) : null;
}

/** Le client accepte la proposition. */
export async function markConfirmed(
  bookingId: string,
  token: string,
  payment: { url: string; orderId: string }
) {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    status: "confirmed",
    confirmedAt: serverTimestamp(),
    paymentLinkUrl: payment.url,
    squareOrderId: payment.orderId,
    quoteProof: token,
  });
}

/** L'acompte est encaissé — appelé par le webhook Square, jamais par le
 *  navigateur : une redirection de retour peut être fabriquée à la main. */
export async function markDepositPaid(bookingId: string, token: string) {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    status: "deposit_paid",
    depositPaidAt: serverTimestamp(),
    quoteProof: token,
  });
}
