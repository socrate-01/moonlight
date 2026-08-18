import { NextResponse } from "next/server";
import { requireAdmin, Unauthorized } from "@/lib/server/admin-auth";
import { appUrl, emailFrom, emailReplyTo, emailSenders } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** La console de rédaction est un composant client : elle ne peut pas lire les
 *  variables d'environnement du serveur. Cette route les lui donne — après
 *  vérification de l'autorisation, car la liste des expéditeurs autorisés n'a
 *  pas à être publique. */
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return NextResponse.json({
      senders: emailSenders(),
      defaultSender: emailFrom(),
      replyTo: emailReplyTo() ?? "",
      appUrl: appUrl(),
      // Faux = aucune clé Resend : les envois seront simulés et journalisés.
      configured: Boolean(process.env.RESEND_API_KEY),
    });
  } catch (err) {
    if (err instanceof Unauthorized) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[mailing/config] erreur", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
