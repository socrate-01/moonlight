import { Resend } from "resend";
import { appUrl, emailReplyTo, resolveSender } from "./env";

/** Le moteur d'envoi. Rédaction depuis l'admin, expédition à tout le carnet ou
 *  à une sélection, par lots, avec lien de désabonnement obligatoire. */

/** Destinataire tel qu'il arrive de la console : l'adresse et le jeton
 *  suffisent, le reste sert seulement à personnaliser. */
export type MailingRecipient = {
  email: string;
  unsubscribeToken: string;
  firstName?: string | null;
};

export type MailingInput = {
  subject: string;
  heading: string;
  body: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;

  /** N'envoie qu'à cette adresse, objet préfixé « [Test] ». */
  testTo?: string | null;
  recipients: MailingRecipient[];
  /** Refusé s'il n'est pas dans la liste blanche — voir `resolveSender`. */
  from?: string | null;
  replyTo?: string | null;
};

export type MailingResult = {
  sent: number;
  failed: number;
  /** Vrai sans clé API : rien n'est parti, tout a été journalisé. */
  simulated: boolean;
};

/** Resend n'accepte que deux requêtes par seconde. Un envoi un par un
 *  dépasserait la limite bien avant la fin d'une liste un peu longue, et la
 *  route expirerait en cours de route. */
const BATCH_SIZE = 100;

/* ------------------------------------------------------------------ */
/* Désabonnement — deux URL pour un même jeton                         */
/* ------------------------------------------------------------------ */

/** Cible du lien visible en pied de page, cliquée par un humain.
 *  Affiche une confirmation ; ne désabonne pas. */
export function unsubscribePageUrl(token: string) {
  return `${appUrl()}/desabonnement?token=${encodeURIComponent(token)}`;
}

/** Cible de l'en-tête `List-Unsubscribe`, appelée en POST par Gmail et
 *  Outlook. Désabonne immédiatement.
 *
 *  Le piège : viser ici la page de confirmation ne casse rien de visible, mais
 *  les messageries appellent cette cible en POST et une page leur répondrait
 *  par une erreur — le bouton « Se désabonner » de Gmail ne ferait rien. */
export function unsubscribePostUrl(token: string) {
  return `${appUrl()}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

/* ------------------------------------------------------------------ */
/* Rendu                                                               */
/* ------------------------------------------------------------------ */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Le corps est saisi en texte libre : les lignes vides font les paragraphes,
 *  les retours simples des sauts de ligne. Aucun HTML n'est accepté tel quel. */
function paragraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 18px;color:#d7d2e4;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;">${escapeHtml(
          block
        ).replace(/\n/g, "<br />")}</p>`
    )
    .join("");
}

/** Version texte : sans elle, certains filtres considèrent un message comme
 *  suspect, et les lecteurs en texte seul ne voient rien. */
function renderText(input: MailingInput, unsubscribeUrl: string) {
  const cta =
    input.ctaLabel && input.ctaUrl ? `\n\n${input.ctaLabel} : ${input.ctaUrl}` : "";
  return `${input.heading}\n\n${input.body}${cta}\n\n—\nMoonlight Cocktail Bar · 7300 Rue Saint-Jacques, Montréal\nSe désabonner : ${unsubscribeUrl}\n`;
}

function renderHtml(input: MailingInput, unsubscribeUrl: string) {
  const cta =
    input.ctaLabel && input.ctaUrl
      ? `<div style="text-align:center;padding:10px 0 24px;">
           <a href="${escapeHtml(input.ctaUrl)}"
              style="display:inline-block;background:#c9a25e;color:#0b0e26;text-decoration:none;
                     padding:14px 34px;border-radius:999px;font-family:Arial,sans-serif;
                     font-size:12px;letter-spacing:2px;text-transform:uppercase;">
             ${escapeHtml(input.ctaLabel)}
           </a>
         </div>`
      : "";

  return `
  <div style="background:#0b0e26;padding:40px 0;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;background:#14173a;border:1px solid rgba(201,162,94,.35);border-radius:18px;overflow:hidden;">
      <div style="padding:34px 34px 6px;text-align:center;">
        <h1 style="color:#f2efe6;font-size:30px;margin:0 0 2px;letter-spacing:2px;font-weight:400;">MOONLIGHT</h1>
        <div style="color:#c9a25e;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Cocktail Bar</div>
      </div>

      <div style="padding:26px 34px 0;">
        <h2 style="color:#f2efe6;font-size:22px;margin:0 0 18px;font-weight:400;letter-spacing:1px;">${escapeHtml(
          input.heading
        )}</h2>
        ${paragraphs(input.body)}
      </div>

      ${cta}

      <div style="padding:18px 34px 30px;border-top:1px dashed rgba(255,255,255,.12);margin-top:14px;text-align:center;">
        <div style="color:#8f8aa3;font-size:11px;font-family:Arial,sans-serif;line-height:1.8;">
          Moonlight Cocktail Bar · 7300 Rue Saint-Jacques, Montréal<br />
          Vous recevez ce message parce que votre adresse figure dans notre carnet.<br />
          <a href="${escapeHtml(unsubscribeUrl)}" style="color:#c9a25e;text-decoration:underline;">Se désabonner</a>
        </div>
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Envoi                                                               */
/* ------------------------------------------------------------------ */

function buildMessage(
  input: MailingInput,
  sender: string,
  replyTo: string | undefined,
  recipient: MailingRecipient,
  subject: string
) {
  const pageUrl = unsubscribePageUrl(recipient.unsubscribeToken);
  return {
    from: sender,
    to: recipient.email,
    subject,
    html: renderHtml(input, pageUrl),
    text: renderText(input, pageUrl),
    ...(replyTo ? { replyTo } : {}),
    headers: {
      // La cible POST, jamais la page de confirmation. Et sans le second
      // en-tête, Gmail n'affiche tout simplement pas son bouton.
      "List-Unsubscribe": `<${unsubscribePostUrl(recipient.unsubscribeToken)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

export async function sendMailing(input: MailingInput): Promise<MailingResult> {
  const sender = resolveSender(input.from);
  const replyTo = input.replyTo?.trim() || emailReplyTo();
  const apiKey = process.env.RESEND_API_KEY;

  /* 1. Mode test — une seule adresse, objet préfixé.
     L'adresse n'a pas besoin de figurer dans le carnet : on veut pouvoir se
     relire sans s'y inscrire soi-même. Le jeton est factice, le lien de
     désabonnement du test ne résout donc rien — c'est voulu. */
  if (input.testTo) {
    const recipient: MailingRecipient = {
      email: input.testTo,
      unsubscribeToken: "test-token",
    };
    const message = buildMessage(
      input,
      sender,
      replyTo,
      recipient,
      `[Test] ${input.subject}`
    );
    if (!apiKey) {
      console.info("[mailing] simulation (test)", message.to, message.subject);
      return { sent: 1, failed: 0, simulated: true };
    }
    const { error } = await new Resend(apiKey).emails.send(message);
    if (error) {
      console.error("[mailing] test refusé", error);
      return { sent: 0, failed: 1, simulated: false };
    }
    return { sent: 1, failed: 0, simulated: false };
  }

  /* 2. Aucun destinataire — on sort sans rien faire. */
  const recipients = input.recipients.filter((r) => r.email && r.unsubscribeToken);
  if (recipients.length === 0) {
    return { sent: 0, failed: 0, simulated: !apiKey };
  }

  /* 3. Pas de clé API — chaque message est écrit dans la console du serveur.
     Tout le parcours reste testable sans compte chez le fournisseur. */
  if (!apiKey) {
    for (const recipient of recipients) {
      console.info(
        "[mailing] simulation →",
        recipient.email,
        "|",
        input.subject,
        "| désabo:",
        unsubscribePageUrl(recipient.unsubscribeToken)
      );
    }
    return { sent: recipients.length, failed: 0, simulated: true };
  }

  /* 4. Envoi réel, par lots. */
  const client = new Resend(apiKey);
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const slice = recipients.slice(i, i + BATCH_SIZE);
    const payload = slice.map((recipient) =>
      buildMessage(input, sender, replyTo, recipient, input.subject)
    );

    try {
      const { data, error } = await client.batch.send(payload, {
        // En mode strict, une seule adresse invalide fait rejeter le paquet
        // entier : quatre-vingt-dix-neuf personnes ne recevraient rien à cause
        // d'une faute de frappe.
        batchValidation: "permissive",
      });
      if (error) throw error;

      const rejected = data?.errors?.length ?? 0;
      if (rejected > 0) console.warn("[mailing] adresses refusées", data?.errors);
      sent += slice.length - rejected;
      failed += rejected;
    } catch (error) {
      // Un paquet en échec n'arrête pas les suivants : on compte, on
      // journalise, on continue.
      console.error("[mailing] paquet refusé", error);
      failed += slice.length;
    }
  }

  return { sent, failed, simulated: false };
}
