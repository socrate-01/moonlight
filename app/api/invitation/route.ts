import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { Resend } from "resend";

export const runtime = "nodejs";

type Payload = {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone?: string;
  alcohol?: string;
  allergies?: string;
  allergyDetails?: string;
};

function invitationHtml(p: Payload, qrDataUrl: string) {
  const row = (label: string, value: string) =>
    value
      ? `<tr>
           <td style="padding:6px 0;color:#a9884c;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${label}</td>
           <td style="padding:6px 0 6px 18px;color:#f2efe6;font-size:14px;">${value}</td>
         </tr>`
      : "";

  const allergies =
    p.allergies === "oui"
      ? `Oui${p.allergyDetails ? ` — ${p.allergyDetails}` : ""}`
      : "Non";

  return `
  <div style="background:#0b0e26;padding:40px 0;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#14173a;border:1px solid rgba(201,162,94,.35);border-radius:18px;overflow:hidden;">
      <div style="padding:32px 32px 8px;text-align:center;">
        <div style="color:#c9a25e;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Cérémonie d'ouverture officielle</div>
        <h1 style="color:#f2efe6;font-size:34px;margin:10px 0 2px;letter-spacing:2px;font-weight:400;">MOONLIGHT</h1>
        <div style="color:#c9a25e;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Cocktail Bar</div>
      </div>
      <div style="padding:8px 32px 0;text-align:center;">
        <p style="color:#b7b2c7;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
          Bonjour ${p.name || ""}, votre place est réservée. Voici votre invitation
          personnelle. Présentez ce QR code à l'entrée le soir de l'événement.
        </p>
      </div>
      <div style="text-align:center;padding:14px 0 6px;">
        <img src="${qrDataUrl}" alt="QR code" width="200" height="200"
             style="background:#f5f2ea;border-radius:12px;padding:12px;" />
        <div style="color:#a9884c;font-size:12px;letter-spacing:2px;font-family:Arial,sans-serif;margin-top:8px;">${p.ref}</div>
      </div>
      <div style="padding:16px 40px 8px;">
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;">
          ${row("Invité", p.name)}
          ${row("Email", p.email)}
          ${row("Téléphone", p.phone || "")}
          ${row("Alcool", p.alcohol === "oui" ? "Oui" : p.alcohol === "non" ? "Non" : "")}
          ${row("Allergies", allergies)}
        </table>
      </div>
      <div style="padding:16px 32px 32px;text-align:center;border-top:1px dashed rgba(255,255,255,.12);margin-top:10px;">
        <div style="color:#f2efe6;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Samedi XX Mois 2026 · 20 h 00</div>
        <div style="color:#b7b2c7;font-size:12px;font-family:Arial,sans-serif;margin-top:4px;">[ Adresse du lieu ]</div>
      </div>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  try {
    const p = (await request.json()) as Payload;
    if (!p?.id || !p?.email) {
      return NextResponse.json({ error: "Missing id or email" }, { status: 400 });
    }

    // The QR encodes the reservation id; the scanner looks up live data.
    const qrDataUrl = await QRCode.toDataURL(p.id, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 8,
      color: { dark: "#131732", light: "#f5f2ea" },
    });

    let emailed = false;
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const base64 = qrDataUrl.split(",")[1];
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "Moonlight Cocktail Bar <onboarding@resend.dev>",
        to: p.email,
        subject: "Votre invitation · Moonlight Cocktail Bar",
        html: invitationHtml(p, qrDataUrl),
        attachments: [{ filename: `invitation-${p.ref}.png`, content: base64 }],
      });
      emailed = true;
    }

    return NextResponse.json({ ok: true, emailed, qrDataUrl });
  } catch (err) {
    console.error("invitation route error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
