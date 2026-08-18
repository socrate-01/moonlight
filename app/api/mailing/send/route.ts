import { NextResponse } from "next/server";
import { requireAdmin, Unauthorized } from "@/lib/server/admin-auth";
import { sendMailing, type MailingRecipient } from "@/lib/server/mailing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Un carnet de quelques centaines d'adresses tient largement dans ce budget ;
// la limite par défaut aurait coupé un envoi long en plein milieu.
export const maxDuration = 300;

const LIMITS = {
  subject: 200,
  heading: 200,
  body: 20000,
  ctaLabel: 60,
  recipients: 5000,
};

type Body = {
  subject?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  testTo?: string;
  from?: string;
  replyTo?: string;
  recipients?: MailingRecipient[];
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Un lien d'action ne peut être qu'une adresse web : sans ce contrôle, un
 *  `javascript:` se retrouverait dans un bouton envoyé à toute la liste. */
function httpUrl(value: unknown) {
  const raw = text(value, 2000);
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    // Première ligne, toujours : cette route est appelable directement, elle
    // n'hérite pas de la protection de l'écran d'admin.
    await requireAdmin(request);

    const payload = (await request.json()) as Body;

    const subject = text(payload.subject, LIMITS.subject);
    const heading = text(payload.heading, LIMITS.heading);
    const body = text(payload.body, LIMITS.body);

    if (!subject) {
      return NextResponse.json({ error: "L'objet est obligatoire." }, { status: 400 });
    }
    if (!body) {
      return NextResponse.json({ error: "Le message est vide." }, { status: 400 });
    }

    const ctaLabel = text(payload.ctaLabel, LIMITS.ctaLabel);
    const ctaUrl = httpUrl(payload.ctaUrl);
    if (ctaLabel && !ctaUrl) {
      return NextResponse.json(
        { error: "Le bouton d'action a un libellé mais pas d'adresse valide (http ou https)." },
        { status: 400 }
      );
    }

    const testTo = text(payload.testTo, 320).toLowerCase();

    const recipients = Array.isArray(payload.recipients)
      ? payload.recipients
          .filter(
            (r): r is MailingRecipient =>
              Boolean(r) && typeof r.email === "string" && typeof r.unsubscribeToken === "string"
          )
          .slice(0, LIMITS.recipients)
          .map((r) => ({
            email: r.email.trim().toLowerCase(),
            unsubscribeToken: r.unsubscribeToken,
            firstName: r.firstName ?? null,
          }))
      : [];

    if (!testTo && recipients.length === 0) {
      return NextResponse.json({ error: "Aucun destinataire." }, { status: 400 });
    }

    const result = await sendMailing({
      subject,
      heading: heading || subject,
      body,
      ctaLabel: ctaLabel || null,
      ctaUrl: ctaUrl || null,
      testTo: testTo || null,
      recipients,
      // Confronté à la liste blanche dans le moteur, jamais utilisé tel quel.
      from: text(payload.from, 320) || null,
      replyTo: text(payload.replyTo, 320) || null,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Unauthorized) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[mailing/send] erreur", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
