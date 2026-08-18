/** Lecture des variables d'environnement du module d'envoi.
 *
 *  Tout est relu à chaque appel, jamais figé dans un module de premier niveau :
 *  une valeur capturée à l'import survivrait à un changement de configuration
 *  sur Vercel jusqu'au prochain déploiement. */

const FALLBACK_FROM = "Moonlight Cocktail Bar <onboarding@resend.dev>";

/** L'URL publique du site, telle qu'elle doit apparaître dans les liens.
 *
 *  Volontairement SANS préfixe NEXT_PUBLIC_ : une variable préfixée est
 *  remplacée par sa valeur à la compilation. Un build fabriqué sur un poste de
 *  développement emporterait « localhost » jusqu'en production, et tous les
 *  liens de désabonnement des courriels déjà partis pointeraient dans le vide.
 *  Ici la valeur est relue à l'exécution, à chaque requête. */
export function appUrl(): string {
  const raw =
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** `EMAIL_FROM` d'abord ; `RESEND_FROM` reste accepté pour ne pas casser la
 *  route d'invitation qui l'utilisait déjà. */
export function emailFrom(): string {
  return process.env.EMAIL_FROM || process.env.RESEND_FROM || FALLBACK_FROM;
}

export function emailReplyTo(): string | undefined {
  return process.env.EMAIL_REPLY_TO || undefined;
}

/** Liste blanche des expéditeurs proposés au choix dans l'admin.
 *
 *  Chaque domaine doit être vérifié séparément chez Resend : figurer ici ne
 *  suffit pas, l'envoi partirait en erreur. */
export function emailSenders(): string[] {
  const extra = (process.env.EMAIL_SENDERS || "")
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
  return Array.from(new Set([emailFrom(), ...extra]));
}

/** L'expéditeur venant du navigateur est confronté à une liste blanche, jamais
 *  à une validation de forme.
 *
 *  Accepter une adresse arbitraire ferait de l'application un relais permettant
 *  d'écrire au nom de n'importe qui — depuis un domaine que l'on a pris la
 *  peine de faire vérifier, donc avec la crédibilité qui va avec. Une valeur
 *  hors liste retombe silencieusement sur l'expéditeur par défaut. */
export function resolveSender(requested?: string | null): string {
  const allowed = emailSenders();
  return requested && allowed.includes(requested) ? requested : emailFrom();
}

/** Identifiant du projet Firebase, nécessaire pour valider les jetons admin. */
export function firebaseProjectId(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "moonlightcb";
}

/** Restriction facultative de l'accès admin à certaines adresses.
 *  Vide = tout compte Firebase authentifié du projet est admin, ce qui est le
 *  comportement actuel de l'écran de connexion. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(/[,\n]/)
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}
