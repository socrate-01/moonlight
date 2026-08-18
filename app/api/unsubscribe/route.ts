import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/server/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Désabonnement en un clic — RFC 8058.
 *
 *  Cible de l'en-tête `List-Unsubscribe` : Gmail et Outlook l'appellent en
 *  POST, sans intervention du destinataire au-delà du bouton. C'est la route
 *  qui agit.
 *
 *  Le pendant humain est /desabonnement, qui se contente d'afficher une
 *  confirmation. La séparation n'est pas cosmétique : un désabonnement
 *  déclenché en GET est un bogue silencieux. Les antivirus de messagerie et
 *  les aperçus de lien visitent les URL d'un courriel avant même que le
 *  destinataire ne l'ouvre ; la désinscription retirerait alors des gens qui
 *  n'ont rien demandé, et personne ne s'en apercevrait avant des semaines. */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    let token = url.searchParams.get("token") ?? "";

    // Les messageries envoient « List-Unsubscribe=One-Click » en corps de
    // formulaire ; le jeton reste dans l'URL. Un appel depuis notre page de
    // confirmation le passe en JSON. On accepte les deux.
    if (!token) {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const body = (await request.json().catch(() => ({}))) as { token?: string };
        token = body.token ?? "";
      } else if (contentType.includes("form")) {
        const form = await request.formData().catch(() => null);
        token = (form?.get("token") as string) ?? "";
      }
    }

    if (!token) {
      return NextResponse.json({ ok: false, error: "Jeton manquant." }, { status: 400 });
    }

    const result = await unsubscribeByToken(token);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "Ce lien n'est plus valide." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, email: result.email });
  } catch (err) {
    console.error("[unsubscribe] erreur", err);
    // Un 500 pousse certaines messageries à réessayer ; on préfère ça à un 200
    // mensonger qui laisserait le destinataire abonné sans le savoir.
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/** Un GET sur cette route ne désabonne pas — il renvoie vers la page de
 *  confirmation, où un humain décide. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  return NextResponse.redirect(
    new URL(`/desabonnement?token=${encodeURIComponent(token)}`, url.origin),
    302
  );
}
