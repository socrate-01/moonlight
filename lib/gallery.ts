import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { deleteImage } from "./media";

export const GALLERY_COLLECTION = "galleryPhotos";

/** Nombre de photos par page. La galerie en charge un lot à la fois plutôt
 *  que la collection entière : une soirée produit vite quelques centaines de
 *  clichés, et personne ne les fait défiler d'un trait. */
export const PAGE_SIZE = 20;

export type GalleryAlbum = "inauguration" | "creations";

export type GalleryPhoto = {
  id: string;
  url: string;
  pathname: string;
  caption: string;
  album: GalleryAlbum;
  width: number;
  height: number;
  /** Rang manuel : le tri par date ne donne pas un bon accrochage. */
  order: number;
  createdAt?: Timestamp | null;
};

/** Clé composite « album#rang », dérivée des deux champs précédents.
 *
 *  Filtrer sur `album` tout en triant sur `order` exigerait un index composite,
 *  c'est-à-dire un déploiement de plus — et une requête qui échoue en
 *  production le jour où il manque. En rangeant les deux valeurs dans une
 *  seule chaîne, le filtre devient un intervalle sur le champ même qui sert au
 *  tri : l'index automatique de Firestore suffit.
 *
 *  Le rang est complété à douze chiffres pour que l'ordre alphabétique
 *  coïncide avec l'ordre numérique — sans quoi « 9 » passerait après « 10 ». */
export function albumOrderKey(album: GalleryAlbum, order: number) {
  return `${album}#${String(Math.max(0, Math.round(order))).padStart(12, "0")}`;
}

type Snap = QueryDocumentSnapshot<DocumentData>;

function read(d: Snap): GalleryPhoto {
  const v = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    url: (v.url as string) ?? "",
    pathname: (v.pathname as string) ?? "",
    caption: (v.caption as string) ?? "",
    album: (v.album as GalleryAlbum) ?? "inauguration",
    width: (v.width as number) ?? 1200,
    height: (v.height as number) ?? 1600,
    order: (v.order as number) ?? 0,
    createdAt: (v.createdAt as Timestamp | null) ?? null,
  };
}

/** Bornes de l'intervalle couvrant un album entier. */
function albumBounds(album: GalleryAlbum) {
  return [`${album}#`, `${album}#\uf8ff`] as const;
}

export type Page = {
  photos: GalleryPhoto[];
  /** Curseur du dernier document, à passer pour obtenir la page suivante. */
  cursor: Snap | null;
  /** Faux dès qu'une page revient incomplète : il n'y a plus rien après. */
  hasMore: boolean;
};

/** Une page de photos, du plus récent rang au plus ancien.
 *
 *  On demande PAGE_SIZE + 1 documents : le surnuméraire ne sert qu'à savoir
 *  s'il existe une suite, sans second aller-retour. */
export async function fetchGalleryPage(
  album: GalleryAlbum,
  after?: Snap | null
): Promise<Page> {
  const [lo, hi] = albumBounds(album);
  const constraints: QueryConstraint[] = [
    where("albumOrder", ">=", lo),
    where("albumOrder", "<=", hi),
    orderBy("albumOrder", "desc"),
  ];
  if (after) constraints.push(startAfter(after));
  constraints.push(limit(PAGE_SIZE + 1));

  const snap = await getDocs(
    query(collection(db, GALLERY_COLLECTION), ...constraints)
  );
  const docs = snap.docs;
  const hasMore = docs.length > PAGE_SIZE;
  const kept = hasMore ? docs.slice(0, PAGE_SIZE) : docs;

  return {
    photos: kept.map(read),
    cursor: kept.length ? kept[kept.length - 1] : null,
    hasMore,
  };
}

export async function countGallery(album: GalleryAlbum) {
  try {
    const [lo, hi] = albumBounds(album);
    const snap = await getCountFromServer(
      query(
        collection(db, GALLERY_COLLECTION),
        where("albumOrder", ">=", lo),
        where("albumOrder", "<=", hi)
      )
    );
    return snap.data().count;
  } catch {
    return 0;
  }
}

/** Toutes les photos d'un album — réservé à l'admin, qui doit pouvoir
 *  réordonner et supprimer sur une seule vue. */
export async function listAllGallery(album: GalleryAlbum): Promise<GalleryPhoto[]> {
  const [lo, hi] = albumBounds(album);
  const snap = await getDocs(
    query(
      collection(db, GALLERY_COLLECTION),
      where("albumOrder", ">=", lo),
      where("albumOrder", "<=", hi),
      orderBy("albumOrder", "desc")
    )
  );
  return snap.docs.map(read);
}

export async function addGalleryPhoto(
  photo: Omit<GalleryPhoto, "id" | "createdAt">
) {
  const id = photo.pathname.replace(/\//g, "_");
  await setDoc(doc(db, GALLERY_COLLECTION, id), {
    ...photo,
    albumOrder: albumOrderKey(photo.album, photo.order),
    createdAt: serverTimestamp(),
  });
  return id;
}

/** Toute modification du rang ou de l'album doit refaire la clé composite,
 *  sinon la photo disparaît de la requête sans que rien ne le signale. */
export async function updateGalleryPhoto(
  id: string,
  values: Partial<Pick<GalleryPhoto, "caption" | "order" | "album">>,
  current?: Pick<GalleryPhoto, "album" | "order">
) {
  const album = values.album ?? current?.album;
  const order = values.order ?? current?.order;
  const derived =
    album !== undefined && order !== undefined
      ? { albumOrder: albumOrderKey(album, order) }
      : {};
  await updateDoc(doc(db, GALLERY_COLLECTION, id), { ...values, ...derived });
}

/** La fiche part avec le fichier : une vignette qui pointe vers un fichier
 *  absent est pire qu'une photo manquante. */
export async function deleteGalleryPhoto(photo: GalleryPhoto) {
  await deleteDoc(doc(db, GALLERY_COLLECTION, photo.id));
  await deleteImage(photo.url);
}
