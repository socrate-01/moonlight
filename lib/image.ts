/** Préparation d'une image avant téléversement.
 *
 *  Les photos sortant d'un appareil ou d'un téléphone pèsent couramment
 *  15 à 40 Mo pour 6000 pixels de large. Les envoyer telles quelles remplit le
 *  stockage, fait échouer la requête, et surtout impose ce poids à chaque
 *  visiteur de la galerie — pour une image que le navigateur affichera de
 *  toute façon sur 1200 pixels au maximum.
 *
 *  On redimensionne donc dans le navigateur, avant l'envoi. C'est aussi le
 *  seul endroit où l'on peut le faire sans installer d'outil de traitement
 *  d'images côté serveur. */

/** Côté le plus long après redimensionnement. Large de quoi rester net sur un
 *  écran haute densité en plein écran, sans conserver du détail que personne
 *  ne verra. */
const MAX_EDGE = 2400;
const QUALITY = 0.86;

export type PreparedImage = {
  file: File;
  width: number;
  height: number;
  originalBytes: number;
  /** Faux si le fichier était déjà raisonnable et a été laissé intact. */
  recompressed: boolean;
};

export class ImageDecodeError extends Error {
  constructor(name: string) {
    super(
      `« ${name} » n'a pas pu être lu par le navigateur. Les fichiers HEIC de l'iPhone sont dans ce cas : exportez-les en JPEG avant de les déposer.`
    );
    this.name = "ImageDecodeError";
  }
}

/** Décodage en respectant l'orientation EXIF.
 *
 *  Sans `imageOrientation`, une photo prise à la verticale ressort couchée :
 *  le capteur enregistre toujours en paysage et note la rotation à part. */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* format non décodable par cette voie : on tente l'élément <img> */
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageDecodeError(file.name));
    };
    img.src = url;
  });
}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

function renamed(name: string, extension: string) {
  return `${name.replace(/\.[^.]+$/, "")}.${extension}`;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const source = await decode(file);
  const width = "naturalWidth" in source ? source.naturalWidth : source.width;
  const height = "naturalHeight" in source ? source.naturalHeight : source.height;

  if (!width || !height) throw new ImageDecodeError(file.name);

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));

  // Déjà aux bonnes dimensions et d'un poids raisonnable : on n'y touche pas.
  // Réencoder une image correcte ne ferait que lui retirer de la qualité.
  if (scale === 1 && file.size <= 2_000_000) {
    if ("close" in source) source.close();
    return { file, width, height, originalBytes: file.size, recompressed: false };
  }

  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageDecodeError(file.name);
  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);
  if ("close" in source) source.close();

  // WebP compresse nettement mieux à qualité égale ; JPEG en repli pour les
  // navigateurs qui ne l'encodent pas.
  let blob = await encode(canvas, "image/webp");
  let type = "image/webp";
  let extension = "webp";
  if (!blob) {
    blob = await encode(canvas, "image/jpeg");
    type = "image/jpeg";
    extension = "jpg";
  }
  if (!blob) throw new ImageDecodeError(file.name);

  return {
    file: new File([blob], renamed(file.name, extension), { type }),
    width: w,
    height: h,
    originalBytes: file.size,
    recompressed: true,
  };
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / 1024 / 1024).toFixed(1)} Mo`;
}
