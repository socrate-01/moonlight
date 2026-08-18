import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { requireAdmin, Unauthorized } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Dépôt des images de l'admin (cocktails, galerie).
 *
 *  Le fichier transite par cette route plutôt que de partir directement du
 *  navigateur : le jeton d'écriture du stockage reste ainsi côté serveur.
 *  Sans cela, il faudrait l'exposer au client, et n'importe qui pourrait
 *  remplir le stockage. */

/** Filet de sécurité, pas une contrainte de travail : l'admin redimensionne
 *  déjà chaque image dans le navigateur avant de l'envoyer, si bien qu'un
 *  fichier arrivant ici pèse quelques centaines de kilo-octets. Le plafond
 *  précédent de 12 Mo rejetait les originaux d'appareil photo — c'était le
 *  mauvais endroit pour régler le problème. */
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const FOLDERS = ["galerie", "cocktails"];

/** Nom de fichier assaini, préfixé d'un horodatage pour que deux photos
 *  portant le même nom ne s'écrasent pas. */
function safeName(name: string) {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
  return `${Date.now()}-${cleaned || "image"}`;
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Stockage non configuré : BLOB_READ_WRITE_TOKEN manquant." },
        { status: 500 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "galerie");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }
    if (!FOLDERS.includes(folder)) {
      return NextResponse.json({ error: "Dossier inconnu." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: `Format non accepté (${file.type || "inconnu"}). JPEG, PNG, WebP, AVIF ou GIF.` },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Fichier trop lourd (${Math.round(file.size / 1024 / 1024)} Mo). Maximum 25 Mo.` },
        { status: 413 }
      );
    }

    const blob = await put(`${folder}/${safeName(file.name)}`, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
    });
  } catch (err) {
    if (err instanceof Unauthorized) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[upload] erreur", err);
    return NextResponse.json({ error: "Téléversement impossible." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    const { url } = (await request.json()) as { url?: string };
    if (!url) {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });
    }
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Unauthorized) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[upload] suppression impossible", err);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
