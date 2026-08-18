import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

/** Carnet d'adresses tenu à la main depuis l'admin.
 *
 *  Collection distincte de l'infolettre, et non un drapeau sur une table
 *  commune : les deux listes n'ont pas la même origine de consentement.
 *  L'infolettre vient d'une inscription volontaire, le carnet d'une saisie par
 *  l'organisateur. Se désabonner de l'une ne doit pas retirer de l'autre.
 *
 *  Elles partagent en revanche la même forme d'enregistrement, jeton de
 *  désabonnement compris, ce qui permet de réutiliser le rendu et toute la
 *  mécanique de désinscription sans les dupliquer. */
export const MAILING_COLLECTION = "mailingContacts";

/** Index public jeton → adresse.
 *
 *  Le destinataire d'un courriel n'a pas de compte : son jeton lui tient lieu
 *  d'authentification. Pour se désabonner il faut retrouver sa fiche à partir
 *  du seul jeton, or interroger `mailingContacts` par champ exigerait un droit
 *  de liste sur la collection — c'est-à-dire exposer tout le carnet.
 *
 *  On stocke donc le jeton comme identifiant de document dans une collection
 *  séparée qui ne contient qu'une adresse. Les règles autorisent `get` (lire
 *  un jeton précis, ce qui suppose de le connaître) mais interdisent `list` :
 *  impossible d'énumérer quoi que ce soit. Même idiome que `attendees`. */
export const MAILING_TOKENS_COLLECTION = "mailingTokens";

export type MailingStatus = "subscribed" | "unsubscribed";
export type MailingSource = "site" | "achat" | "import";
export type MailingList = "mailing" | "newsletter";

export type MailingContact = {
  /** L'adresse elle-même sert d'identifiant : le doublon devient
   *  structurellement impossible, sans requête préalable. */
  id: string;
  email: string;
  firstName: string | null;
  locale: string;

  status: MailingStatus;
  /** « import » pour une saisie manuelle depuis l'admin. */
  source: MailingSource;

  /** Imprévisible, créé UNE fois, jamais renouvelé — voir `upsertMailingContact`. */
  unsubscribeToken: string;
  consentAt?: Timestamp | null;
  consentIp: string | null;

  unsubscribedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type MailingContactInput = {
  email: string;
  firstName?: string | null;
  locale?: string;
  source?: MailingSource;
  status?: MailingStatus;
};

/** Normalisation appliquée avant tout stockage : l'adresse en minuscules est
 *  la clé d'unicité. */
export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Validation volontairement permissive : refuser une adresse exotique mais
 *  valide coûte plus cher qu'un rebond. On écarte l'évident. */
export function isEmail(value: string) {
  return /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(value);
}

/** Firestore refuse « . », « .. » et le « / » dans un identifiant de document.
 *  Aucune adresse valide ne tombe dans ces cas, mais on le vérifie plutôt que
 *  de laisser une écriture échouer au fond de l'admin. */
export function isUsableAsDocId(value: string) {
  return (
    value.length > 0 &&
    value.length < 1000 &&
    !value.includes("/") &&
    value !== "." &&
    value !== ".."
  );
}

export function makeToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readContact(id: string, data: Record<string, unknown>): MailingContact {
  return {
    id,
    email: (data.email as string) ?? id,
    firstName: (data.firstName as string | null) ?? null,
    locale: (data.locale as string) ?? "fr",
    status: (data.status as MailingStatus) ?? "subscribed",
    source: (data.source as MailingSource) ?? "import",
    unsubscribeToken: (data.unsubscribeToken as string) ?? "",
    consentAt: (data.consentAt as Timestamp | null) ?? null,
    consentIp: (data.consentIp as string | null) ?? null,
    unsubscribedAt: (data.unsubscribedAt as Timestamp | null) ?? null,
    createdAt: (data.createdAt as Timestamp | null) ?? null,
    updatedAt: (data.updatedAt as Timestamp | null) ?? null,
  };
}

/** Ajout ou mise à jour, idempotent par adresse.
 *
 *  Le point délicat du module. Une transaction relit la fiche existante avant
 *  d'écrire pour conserver deux valeurs :
 *
 *  - `unsubscribeToken`, qui ne se renouvelle JAMAIS. Il tient lieu
 *    d'authentification pour un destinataire sans compte : le régénérer
 *    casserait le lien de désabonnement de tous les courriels déjà partis, y
 *    compris ceux d'il y a un an, qui doivent rester fonctionnels.
 *  - `createdAt`, qui date le consentement d'origine.
 *
 *  Le statut est également préservé : un réajout par collage ne doit pas
 *  réabonner quelqu'un qui s'était retiré. */
export async function upsertMailingContact(
  values: MailingContactInput
): Promise<MailingContact> {
  const email = normaliseEmail(values.email);
  if (!isEmail(email) || !isUsableAsDocId(email)) {
    throw new Error(`Adresse invalide : ${values.email}`);
  }

  const ref = doc(db, MAILING_COLLECTION, email);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const previous = snap.exists()
      ? readContact(email, snap.data() as Record<string, unknown>)
      : null;

    const token = previous?.unsubscribeToken || makeToken();

    const contact = {
      email,
      firstName: values.firstName?.trim() || previous?.firstName || null,
      locale: values.locale ?? previous?.locale ?? "fr",
      status: values.status ?? previous?.status ?? "subscribed",
      source: values.source ?? previous?.source ?? "import",
      unsubscribeToken: token,
      consentAt: previous?.consentAt ?? serverTimestamp(),
      consentIp: previous?.consentIp ?? null,
      unsubscribedAt: previous?.unsubscribedAt ?? null,
      createdAt: previous?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    tx.set(ref, contact, { merge: true });
    // L'index jeton → adresse est écrit dans la même transaction : une fiche
    // sans entrée d'index serait un contact impossible à désabonner.
    tx.set(doc(db, MAILING_TOKENS_COLLECTION, token), {
      email,
      list: "mailing" as MailingList,
      ref: email,
    });

    return {
      ...contact,
      id: email,
      consentAt: previous?.consentAt ?? null,
      createdAt: previous?.createdAt ?? null,
      updatedAt: null,
    } as MailingContact;
  });
}

/** Triés par date, le plus récent d'abord. */
export async function listMailingContacts(): Promise<MailingContact[]> {
  const snap = await getDocs(
    query(collection(db, MAILING_COLLECTION), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => readContact(d.id, d.data() as Record<string, unknown>));
}

/** Version temps réel, pour que l'ajout d'une adresse se voie immédiatement
 *  dans la console sans rechargement. */
export function watchMailingContacts(cb: (items: MailingContact[]) => void) {
  return onSnapshot(
    query(collection(db, MAILING_COLLECTION), orderBy("createdAt", "desc")),
    (snap) => {
      cb(snap.docs.map((d) => readContact(d.id, d.data() as Record<string, unknown>)));
    }
  );
}

export async function getMailingContact(id: string): Promise<MailingContact | null> {
  const snap = await getDoc(doc(db, MAILING_COLLECTION, id));
  return snap.exists()
    ? readContact(snap.id, snap.data() as Record<string, unknown>)
    : null;
}

/** On désabonne au lieu de supprimer : une adresse effacée peut être réajoutée
 *  par un collage ultérieur, et l'on réécrirait à quelqu'un qui s'était
 *  retiré. Le statut garde la trace du retrait. */
export async function setMailingContactStatus(id: string, status: MailingStatus) {
  await updateDoc(doc(db, MAILING_COLLECTION, id), {
    status,
    unsubscribedAt: status === "unsubscribed" ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

/** Suppression pure, réservée aux demandes d'effacement. L'entrée d'index part
 *  avec la fiche, sans quoi le jeton resterait résoluble dans le vide. */
export async function deleteMailingContact(contact: MailingContact) {
  if (contact.unsubscribeToken) {
    await deleteDoc(doc(db, MAILING_TOKENS_COLLECTION, contact.unsubscribeToken));
  }
  await deleteDoc(doc(db, MAILING_COLLECTION, contact.id));
}

export type PasteResult = { added: number; rejected: string[] };

/** On copie rarement une adresse à la fois depuis un carnet existant.
 *
 *  Le champ d'ajout découpe sur les espaces, virgules et points-virgules,
 *  valide chaque entrée séparément, ajoute ce qui passe et rend la liste de ce
 *  qui a été rejeté — plutôt que de tout refuser pour une faute de frappe. */
export async function addMailingContacts(raw: string): Promise<PasteResult> {
  const candidates = Array.from(
    new Set(
      raw
        .split(/[\s,;]+/)
        .map((v) => normaliseEmail(v))
        .filter(Boolean)
    )
  );

  let added = 0;
  const rejected: string[] = [];

  for (const candidate of candidates) {
    if (!isEmail(candidate) || !isUsableAsDocId(candidate)) {
      rejected.push(candidate);
      continue;
    }
    try {
      await upsertMailingContact({ email: candidate, source: "import" });
      added += 1;
    } catch {
      rejected.push(candidate);
    }
  }

  return { added, rejected };
}

/** Réparation des jetons de l'infolettre.
 *
 *  Les abonnés inscrits avant ce module portent un jeton mais aucune entrée
 *  dans l'index : leur lien de désabonnement ne résoudrait rien. Cette passe
 *  admin recrée les entrées manquantes. Idempotente, on peut la relancer. */
export async function backfillNewsletterTokens(): Promise<{ total: number; created: number }> {
  const subs = await getDocs(collection(db, "newsletter"));
  const missing: { token: string; email: string; ref: string }[] = [];

  for (const d of subs.docs) {
    const data = d.data() as { token?: string; email?: string };
    if (!data.token || !data.email) continue;
    const indexed = await getDoc(doc(db, MAILING_TOKENS_COLLECTION, data.token));
    if (!indexed.exists()) {
      missing.push({ token: data.token, email: data.email, ref: d.id });
    }
  }

  for (let i = 0; i < missing.length; i += 400) {
    const batch = writeBatch(db);
    for (const m of missing.slice(i, i + 400)) {
      batch.set(doc(db, MAILING_TOKENS_COLLECTION, m.token), {
        email: m.email,
        list: "newsletter" as MailingList,
        ref: m.ref,
      });
    }
    await batch.commit();
  }

  return { total: subs.size, created: missing.length };
}
