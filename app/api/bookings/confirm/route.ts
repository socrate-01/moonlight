import { NextResponse } from "next/server";
import { appUrl } from "@/lib/server/env";
import { createDepositLink, squareConfigured } from "@/lib/server/square";
import { markConfirmed, readQuoteToken } from "@/lib/server/booking-confirm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Le client accepte la proposition et part régler son acompte.
 *
 *  Le montant n'est jamais pris dans la requête : il est relu depuis la fiche
 *  de proposition écrite par l'admin. Sinon, il suffirait de modifier le corps
 *  de l'appel pour payer un dollar. */
export async function POST(request: Request) {
  try {
    const { token } = (await request.json()) as { token?: string };
    if (!token) {
      return NextResponse.json({ error: "Jeton manquant." }, { status: 400 });
    }

    const quote = await readQuoteToken(token);
    if (!quote) {
      return NextResponse.json(
        { error: "Cette proposition n'est plus valide." },
        { status: 404 }
      );
    }

    if (!squareConfigured()) {
      return NextResponse.json(
        { error: "Le paiement n'est pas configuré. Contactez-nous, nous prenons le relais." },
        { status: 503 }
      );
    }

    const link = await createDepositLink({
      token,
      amount: quote.depositAmount,
      currency: quote.currency || "CAD",
      description: `Acompte 50 % · Moonlight Cocktail Bar · ${quote.date}`,
      buyerEmail: quote.email,
      redirectUrl: `${appUrl()}/merci?token=${encodeURIComponent(token)}`,
    });

    await markConfirmed(quote.bookingId, token, {
      url: link.url,
      orderId: link.orderId,
    });

    return NextResponse.json({ ok: true, url: link.url });
  } catch (err) {
    console.error("[confirmation] erreur", err);
    const message =
      err instanceof Error && err.message.startsWith("Square :")
        ? err.message
        : "Impossible d'ouvrir le paiement pour le moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
