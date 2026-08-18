import { auth } from "./firebase";

/** Téléversement d'un fichier depuis l'admin.
 *
 *  Le fichier ne part pas directement chez l'hébergeur : il passe par une
 *  route de ce site, qui revérifie l'autorisation avant d'écrire. Le jeton de
 *  dépôt n'est donc jamais exposé au navigateur, et personne ne peut remplir
 *  le stockage sans être connecté. */

export type Uploaded = { url: string; pathname: string; contentType: string };

async function authHeader() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Session expirée. Reconnectez-vous.");
  return `Bearer ${token}`;
}

export async function uploadImage(file: File, folder: string): Promise<Uploaded> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { Authorization: await authHeader() },
    body,
  });

  const data = (await res.json()) as Uploaded & { error?: string };
  if (!res.ok) throw new Error(data.error || "Téléversement refusé.");
  return data;
}

export async function deleteImage(url: string) {
  const res = await fetch("/api/admin/upload", {
    method: "DELETE",
    headers: { Authorization: await authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    // La fiche a déjà disparu de la base : ne pas bloquer l'admin pour un
    // fichier orphelin dans le stockage.
    console.warn("[media] suppression du fichier impossible", await res.text());
  }
}

/** Vercel Blob sert le fichier en ligne par défaut. Ce paramètre force la
 *  boîte de dialogue « Enregistrer sous », ce qu'attend un visiteur qui
 *  clique « Télécharger » sur une photo. */
export function downloadUrl(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}download=1`;
}
