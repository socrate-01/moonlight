import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAdmin, Unauthorized } from "@/lib/server/admin-auth";
import { emailReplyTo, resolveSender } from "@/lib/server/env";
import {
  renderQuoteHtml,
  renderQuoteText,
  type QuoteEmail,
} from "@/lib/server/quote-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Envoi de la proposition au client.
 *
 *  L'écriture en base (statut, montants, jeton) est faite par l'admin
 *  lui-même, qui est authentifié auprès de Firestore. Cette route ne fait
 *  qu'une chose : expédier le courriel. Elle revérifie malgré tout
 *  l'autorisation — sans quoi n'importe qui pourrait faire partir un devis
 *  au nom de la maison. */
export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const p = (await request.json()) as Partial<QuoteEmail> & { email?: string };

    const email = String(p.email ?? "").trim().toLowerCase();
    const amount = Number(p.amount ?? 0);
    const depositAmount = Number(p.depositAmount ?? 0);

    if (!email) {
      return NextResponse.json({ error: "Adresse du client manquante." }, { status: 400 });
    }
    if (!p.token) {
      return NextResponse.json({ error: "Jeton de proposition manquant." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Montant du devis invalide." }, { status: 400 });
    }

    const quote: QuoteEmail = {
      name: String(p.name ?? "").trim() || "à vous",
      date: String(p.date ?? ""),
      eventLabel: String(p.eventLabel ?? ""),
      guests: Number(p.guests ?? 0),
      needLabels: String(p.needLabels ?? ""),
      amount,
      depositAmount,
      message: String(p.message ?? "").trim(),
      token: String(p.token),
      currency: String(p.currency ?? "CAD"),
    };

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Sans clé, tout le parcours reste vérifiable : le lien part dans les
      // journaux du serveur au lieu de la boîte du client.
      console.info("[devis] simulation →", email, "|", renderQuoteText(quote));
      return NextResponse.json({ ok: true, simulated: true });
    }

    const { error } = await new Resend(apiKey).emails.send({
      from: resolveSender(),
      to: email,
      subject: `Votre proposition · Moonlight Cocktail Bar`,
      html: renderQuoteHtml(quote),
      text: renderQuoteText(quote),
      ...(emailReplyTo() ? { replyTo: emailReplyTo() } : {}),
    });

    if (error) {
      console.error("[devis] envoi refusé", error);
      return NextResponse.json({ error: "Le courriel n'est pas parti." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, simulated: false });
  } catch (err) {
    if (err instanceof Unauthorized) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[devis] erreur", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
