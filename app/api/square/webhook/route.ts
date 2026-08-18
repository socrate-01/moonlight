import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/server/env";
import { getOrder } from "@/lib/server/square";
import { markDepositPaid, readQuoteToken } from "@/lib/server/booking-confirm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Notification de paiement Square.
 *
 *  C'est ici, et nulle part ailleurs, qu'une réservation passe à « acompte
 *  réglé ». La redirection de retour ne fait pas foi : elle se fabrique à la
 *  main dans une barre d'adresse. */

/** Square signe l'URL de destination concaténée au corps brut, en HMAC-SHA256.
 *  Sans cette vérification, n'importe qui pourrait déclarer un paiement. */
function signatureValid(rawBody: string, signature: string, notificationUrl: string) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key || !signature) return false;

  const expected = createHmac("sha256", key)
    .update(notificationUrl + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature") ?? "";
    const notificationUrl = `${appUrl()}/api/square/webhook`;

    if (!signatureValid(raw, signature, notificationUrl)) {
      console.warn("[square] signature refusée");
      return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
    }

    const event = JSON.parse(raw) as {
      type?: string;
      data?: { object?: { payment?: { order_id?: string; status?: string } } };
    };

    const payment = event.data?.object?.payment;
    if (!payment?.order_id || payment.status !== "COMPLETED") {
      // Paiement en attente, annulé, ou événement d'un autre type : on accuse
      // réception pour que Square cesse de réessayer.
      return NextResponse.json({ ok: true, ignored: true });
    }

    const order = await getOrder(payment.order_id);
    if (!order.referenceId) {
      console.warn("[square] commande sans référence", payment.order_id);
      return NextResponse.json({ ok: true, ignored: true });
    }

    const quote = await readQuoteToken(order.referenceId);
    if (!quote) {
      console.warn("[square] proposition introuvable", order.referenceId);
      return NextResponse.json({ ok: true, ignored: true });
    }

    await markDepositPaid(quote.bookingId, order.referenceId);
    console.info("[square] acompte encaissé", quote.bookingId, order.total);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[square] webhook", err);
    // Un 500 pousse Square à réessayer, ce qui est le bon comportement si la
    // panne est passagère.
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
