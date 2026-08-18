import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { deleteImage } from "./media";
import { COCKTAILS, type Cocktail } from "./site";

export const COCKTAILS_COLLECTION = "cocktails";

/** Cocktail saisi depuis l'admin.
 *
 *  La carte de référence reste dans lib/site.ts : elle garantit qu'une page
 *  n'est jamais vide, même avant la première saisie. Les cocktails de la base
 *  s'y ajoutent et, à slug égal, les remplacent — c'est ainsi qu'on corrige
 *  une fiche de départ sans toucher au code. */
export type DbCocktail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  family: Cocktail["family"];
  imageUrl: string;
  pathname: string;
  order: number;
  createdAt?: Timestamp | null;
};

/** Identifiant lisible dérivé du nom : accents retirés, espaces en tirets. */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function read(id: string, v: Record<string, unknown>): DbCocktail {
  return {
    id,
    slug: (v.slug as string) ?? id,
    name: (v.name as string) ?? "",
    description: (v.description as string) ?? "",
    family: (v.family as Cocktail["family"]) ?? "Signature",
    imageUrl: (v.imageUrl as string) ?? "",
    pathname: (v.pathname as string) ?? "",
    order: (v.order as number) ?? 0,
    createdAt: (v.createdAt as Timestamp | null) ?? null,
  };
}

export async function listCocktails(): Promise<DbCocktail[]> {
  try {
    const snap = await getDocs(
      query(collection(db, COCKTAILS_COLLECTION), orderBy("order", "desc"))
    );
    return snap.docs.map((d) => read(d.id, d.data() as Record<string, unknown>));
  } catch {
    // Règles non déployées ou réseau absent : la carte de référence suffit.
    return [];
  }
}

export function watchCocktails(cb: (items: DbCocktail[]) => void) {
  return onSnapshot(
    query(collection(db, COCKTAILS_COLLECTION), orderBy("order", "desc")),
    (snap) => cb(snap.docs.map((d) => read(d.id, d.data() as Record<string, unknown>)))
  );
}

export async function saveCocktail(
  values: Omit<DbCocktail, "id" | "createdAt"> & { id?: string }
) {
  const id = values.id || values.slug;
  await setDoc(
    doc(db, COCKTAILS_COLLECTION, id),
    {
      slug: values.slug,
      name: values.name,
      description: values.description,
      family: values.family,
      imageUrl: values.imageUrl,
      pathname: values.pathname,
      order: values.order,
      ...(values.id ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
  return id;
}

export async function updateCocktail(id: string, values: Partial<DbCocktail>) {
  await updateDoc(doc(db, COCKTAILS_COLLECTION, id), values);
}

export async function deleteCocktail(c: DbCocktail) {
  await deleteDoc(doc(db, COCKTAILS_COLLECTION, c.id));
  if (c.imageUrl) await deleteImage(c.imageUrl);
}

/** Carte affichée au public : les fiches de référence, complétées et
 *  surchargées par celles de la base. */
export function mergeCocktails(db_: DbCocktail[]): Cocktail[] {
  const bySlug = new Map<string, Cocktail>();
  for (const c of COCKTAILS) bySlug.set(c.slug, c);
  for (const c of db_) {
    bySlug.set(c.slug, {
      slug: c.slug,
      name: c.name,
      family: c.family,
      description: c.description,
      image: c.imageUrl,
      w: 1200,
      h: 1500,
    });
  }
  return Array.from(bySlug.values());
}
