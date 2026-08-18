import { appUrl } from "./env";

/** Courriel de proposition envoyé après étude d'une demande.
 *
 *  Il porte un seul appel à l'action : le bouton qui mène à la page de
 *  proposition, où le client confirme et règle son acompte. Le lien contient
 *  le jeton — il ne doit donc jamais être transféré à un tiers. */

export type QuoteEmail = {
  name: string;
  date: string;
  eventLabel: string;
  guests: number;
  needLabels: string;
  amount: number;
  depositAmount: number;
  message: string;
  token: string;
  currency: string;
};

export function money(n: number, currency = "CAD") {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function longDate(iso: string) {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-CA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function proposalUrl(token: string) {
  return `${appUrl()}/proposition?token=${encodeURIComponent(token)}`;
}

function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map(
      (b) =>
        `<p style="margin:0 0 16px;color:#d7d2e4;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;">${escapeHtml(
          b
        ).replace(/\n/g, "<br />")}</p>`
    )
    .join("");
}

export function renderQuoteHtml(q: QuoteEmail) {
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:9px 0;color:#a9884c;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">${escapeHtml(
         label
       )}</td>
       <td style="padding:9px 0 9px 18px;color:#f2efe6;font-size:14px;font-family:Arial,sans-serif;text-align:right;">${escapeHtml(
         value
       )}</td>
     </tr>`;

  return `
  <div style="background:#0b0e26;padding:40px 0;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;background:#14173a;border:1px solid rgba(201,162,94,.35);border-radius:18px;overflow:hidden;">
      <div style="padding:34px 34px 6px;text-align:center;">
        <h1 style="color:#f2efe6;font-size:30px;margin:0 0 2px;letter-spacing:2px;font-weight:400;">MOONLIGHT</h1>
        <div style="color:#c9a25e;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Cocktail Bar</div>
      </div>

      <div style="padding:26px 34px 0;">
        <h2 style="color:#f2efe6;font-size:21px;margin:0 0 16px;font-weight:400;letter-spacing:1px;">
          Bonjour ${escapeHtml(q.name)}, voici notre proposition
        </h2>
        ${paragraphs(q.message)}
      </div>

      <div style="padding:8px 34px 0;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Date", longDate(q.date))}
          ${row("Événement", q.eventLabel)}
          ${row("Invités", String(q.guests))}
          ${q.needLabels ? row("Prestations", q.needLabels) : ""}
        </table>
      </div>

      <div style="padding:22px 34px 0;">
        <div style="background:rgba(201,162,94,.09);border:1px solid rgba(201,162,94,.3);border-radius:14px;padding:20px;text-align:center;">
          <div style="color:#a9884c;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Devis total</div>
          <div style="color:#f2efe6;font-size:30px;margin:8px 0 14px;letter-spacing:1px;">${money(
            q.amount,
            q.currency
          )}</div>
          <div style="color:#b7b2c7;font-size:12px;font-family:Arial,sans-serif;line-height:1.7;">
            Acompte à la confirmation : <span style="color:#c9a25e;">${money(
              q.depositAmount,
              q.currency
            )}</span><br />
            soit 50 % du devis, déduits du montant final.
          </div>
        </div>
      </div>

      <div style="text-align:center;padding:26px 34px 8px;">
        <a href="${proposalUrl(q.token)}"
           style="display:inline-block;background:#c9a25e;color:#0b0e26;text-decoration:none;
                  padding:15px 36px;border-radius:999px;font-family:Arial,sans-serif;
                  font-size:12px;letter-spacing:2px;text-transform:uppercase;">
          Cette proposition me convient
        </a>
        <div style="color:#8f8aa3;font-size:11px;font-family:Arial,sans-serif;margin-top:14px;line-height:1.7;">
          En cliquant, vous confirmez la proposition et accédez au règlement de
          l'acompte. La date n'est bloquée qu'à ce moment-là.
        </div>
      </div>

      <div style="padding:18px 34px 30px;border-top:1px dashed rgba(255,255,255,.12);margin-top:16px;text-align:center;">
        <div style="color:#8f8aa3;font-size:11px;font-family:Arial,sans-serif;line-height:1.8;">
          Une question, un ajustement ? Répondez simplement à ce courriel.<br />
          Moonlight Cocktail Bar · 7300 Rue Saint-Jacques, Montréal
        </div>
      </div>
    </div>
  </div>`;
}

export function renderQuoteText(q: QuoteEmail) {
  return `Bonjour ${q.name},

${q.message}

Date : ${longDate(q.date)}
Événement : ${q.eventLabel}
Invités : ${q.guests}
${q.needLabels ? `Prestations : ${q.needLabels}\n` : ""}
Devis total : ${money(q.amount, q.currency)}
Acompte à la confirmation : ${money(q.depositAmount, q.currency)} (50 %)

Pour confirmer et régler l'acompte :
${proposalUrl(q.token)}

Une question ? Répondez simplement à ce courriel.
Moonlight Cocktail Bar · 7300 Rue Saint-Jacques, Montréal
`;
}
