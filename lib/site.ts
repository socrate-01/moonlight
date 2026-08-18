/** Contenus de référence du site.
 *
 *  ⚠️ Les éléments marqués « À CONFIRMER » sont des textes provisoires : ils
 *  tiennent la mise en page mais doivent être remplacés par les vrais avant
 *  toute mise en ligne. Rien ici n'est vérifié.
 */

export const SITE = {
  name: "Moonlight Cocktail Bar",
  tagline: "Bar à cocktails mobile · Montréal",
  email: "contact@moonlight.bar",
  phone: "", // À CONFIRMER
  city: "Montréal, Québec",
  baseUrl: "https://moonlight-cocktail-bar.vercel.app",
};

/** Liens des réseaux — à remplacer par les vrais profils. */
export const SOCIALS = [
  { key: "instagram", label: "Instagram", href: "#" },
  { key: "tiktok", label: "TikTok", href: "#" },
  { key: "facebook", label: "Facebook", href: "#" },
  { key: "snapchat", label: "Snapchat", href: "#" },
] as const;

export const NAV_LINKS = [
  { href: "/a-propos", label: "À propos" },
  { href: "/nos-activites", label: "Nos activités" },
  { href: "/nos-cocktails", label: "Nos cocktails" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];

/* ------------------------------------------------------------------ */
/* Tarification                                                        */
/* ------------------------------------------------------------------ */

export const PRICING = {
  /** Prix plancher affiché publiquement. */
  startingAt: 1000,
  /** Acompte exigé à la confirmation. */
  deposit: 500,
  currency: "CAD",
  /** Rayon inclus sans supplément, puis tarif au kilomètre. À CONFIRMER. */
  freeRadiusKm: 25,
  perKm: 1.5,
};

export const money = (n: number) =>
  new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: PRICING.currency,
    maximumFractionDigits: 0,
  }).format(n);

/** Forfaits — base de l'estimateur de prix. À CONFIRMER. */
export const PACKAGES = [
  {
    key: "essentiel",
    name: "Essentiel",
    from: 1000,
    guests: "jusqu'à 50 invités",
    duration: "4 heures de service",
    includes: [
      "Un barman dédié",
      "Carte de 5 cocktails signature",
      "Verrerie et glace incluses",
      "Montage et démontage du bar",
    ],
  },
  {
    key: "signature",
    name: "Signature",
    from: 1800,
    guests: "jusqu'à 120 invités",
    duration: "5 heures de service",
    includes: [
      "Deux barmans",
      "Carte de 8 cocktails, dont 2 créés pour vous",
      "Bar lumineux et décor sur mesure",
      "Mocktails pour les non-buveurs",
      "Service de dégustation à l'arrivée",
    ],
    featured: true,
  },
  {
    key: "prestige",
    name: "Prestige",
    from: 3200,
    guests: "au-delà de 120 invités",
    duration: "6 heures de service",
    includes: [
      "Équipe complète",
      "Carte illimitée et création sur mesure",
      "Bar central et îlot de dégustation",
      "Animation et flair bartending",
      "Coordination avec vos autres prestataires",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Réservation                                                         */
/* ------------------------------------------------------------------ */

export const EVENT_TYPES = [
  { value: "mariage", label: "Mariage", emoji: "💍" },
  { value: "bapteme", label: "Baptême", emoji: "🕊️" },
  { value: "anniversaire", label: "Anniversaire", emoji: "🎂" },
  { value: "fiancailles", label: "Fiançailles", emoji: "💐" },
  { value: "entreprise", label: "Événement d'entreprise", emoji: "🏢" },
  { value: "remise-diplome", label: "Remise de diplôme", emoji: "🎓" },
  { value: "prive", label: "Réception privée", emoji: "🥂" },
  { value: "autre", label: "Autre", emoji: "✨" },
] as const;

export const BOOKING_STATUSES = {
  pending: { label: "En attente", tone: "gold" },
  accepted: { label: "Acceptée", tone: "emerald" },
  declined: { label: "Refusée", tone: "terracotta" },
  deposit_paid: { label: "Acompte réglé", tone: "emerald" },
  completed: { label: "Terminée", tone: "muted" },
} as const;

export type BookingStatus = keyof typeof BOOKING_STATUSES;

/* ------------------------------------------------------------------ */
/* Activités                                                           */
/* ------------------------------------------------------------------ */

/** À CONFIRMER — remplacer par vos prestations réelles. */
export const ACTIVITIES = [
  {
    key: "mariages",
    title: "Mariages",
    lead: "Le bar qui accompagne le plus beau jour",
    body:
      "Du cocktail d'accueil au dernier verre de la soirée, nous installons un bar complet là où vous célébrez. Carte construite avec vous, deux créations à vos noms, et un service qui s'efface pour laisser la fête respirer.",
  },
  {
    key: "receptions",
    title: "Réceptions privées",
    lead: "Chez vous, transformé le temps d'un soir",
    body:
      "Anniversaires, fiançailles, retrouvailles. Nous arrivons avec le bar, la verrerie, la glace et tout le reste. Vous n'avez rien à prévoir, pas même le rangement.",
  },
  {
    key: "entreprise",
    title: "Événements d'entreprise",
    lead: "Lancements, galas, fins d'année",
    body:
      "Un bar qui tient la cadence sans jamais perdre en tenue. Facturation claire, personnel en nombre, et une carte pensée pour un service rapide sur un grand volume.",
  },
];

/* ------------------------------------------------------------------ */
/* Cocktails — À CONFIRMER (noms, prix et descriptions provisoires)     */
/* ------------------------------------------------------------------ */

export type Cocktail = {
  slug: string;
  name: string;
  price: number;
  family: "Signature" | "Classique" | "Sans alcool";
  description: string;
  image: string;
  w: number;
  h: number;
};

export const COCKTAILS: Cocktail[] = [
  {
    slug: "clair-de-lune",
    name: "Clair de Lune",
    price: 16,
    family: "Signature",
    description:
      "Gin infusé à la fleur de sureau, citron vert, blanc d'œuf et une brume de lavande. Notre signature, celle par laquelle tout a commencé.",
    image: "/images/gallery/cocktail-01.jpg",
    w: 1200,
    h: 1554,
  },
  {
    slug: "braise",
    name: "Braise",
    price: 17,
    family: "Signature",
    description:
      "Mezcal, piment doux, mangue et jus de lime. Fumé en entrée, chaleureux en sortie.",
    image: "/images/gallery/cocktail-02.jpg",
    w: 1067,
    h: 1600,
  },
  {
    slug: "velours-noir",
    name: "Velours Noir",
    price: 18,
    family: "Signature",
    description:
      "Rhum vieux, café froid, cacao et vanille bourbon. Un dessert qui se boit.",
    image: "/images/gallery/cocktail-03.jpg",
    w: 1067,
    h: 1600,
  },
  {
    slug: "jardin-secret",
    name: "Jardin Secret",
    price: 16,
    family: "Signature",
    description:
      "Vodka, concombre, basilic et citron. Vif, végétal, désaltérant jusqu'à la dernière gorgée.",
    image: "/images/gallery/cocktail-04.jpg",
    w: 1066,
    h: 1600,
  },
  {
    slug: "vieux-carre",
    name: "Vieux Carré",
    price: 17,
    family: "Classique",
    description:
      "Whisky de seigle, cognac, vermouth rouge et bénédictine. La Nouvelle-Orléans, sans le billet d'avion.",
    image: "/images/gallery/cocktail-05.jpg",
    w: 1067,
    h: 1600,
  },
  {
    slug: "negroni-maison",
    name: "Negroni Maison",
    price: 15,
    family: "Classique",
    description:
      "Gin, campari et vermouth, reposés en fût quatre semaines. Amer, rond, sans concession.",
    image: "/images/gallery/cocktail-06.jpg",
    w: 1066,
    h: 1600,
  },
  {
    slug: "aurore",
    name: "Aurore",
    price: 12,
    family: "Sans alcool",
    description:
      "Pamplemousse rose, hibiscus, romarin et eau pétillante. Toute la fête, aucun lendemain.",
    image: "/images/gallery/cocktail-07.jpg",
    w: 1067,
    h: 1600,
  },
  {
    slug: "brume",
    name: "Brume",
    price: 12,
    family: "Sans alcool",
    description:
      "Thé vert glacé, poire, menthe et citron vert. Léger, presque transparent.",
    image: "/images/gallery/cocktail-08.jpg",
    w: 1067,
    h: 1600,
  },
];

export const COCKTAIL_FAMILIES = ["Signature", "Classique", "Sans alcool"] as const;

/* ------------------------------------------------------------------ */
/* FAQ — À CONFIRMER                                                   */
/* ------------------------------------------------------------------ */

export const FAQ = [
  {
    q: "Quel est le délai pour réserver ?",
    a: "Chaque demande est étudiée sous 24 heures. Nous conseillons de réserver au moins quatre semaines à l'avance, davantage pour un mariage en haute saison.",
  },
  {
    q: "Quelle zone couvrez-vous ?",
    a: `Le grand Montréal est inclus dans nos tarifs, jusqu'à ${PRICING.freeRadiusKm} km. Au-delà, un forfait de déplacement s'ajoute et vous est communiqué avant toute confirmation.`,
  },
  {
    q: "Que comprend le tarif ?",
    a: "Le personnel, le bar, la verrerie, la glace, les ingrédients de la carte retenue, le montage et le démontage. Aucun frais caché ne s'ajoute après la confirmation.",
  },
  {
    q: "Comment fonctionne l'acompte ?",
    a: `Un acompte de ${money(PRICING.deposit)} confirme la date et la retire du calendrier. Il se déduit du montant final.`,
  },
  {
    q: "Puis-je annuler ?",
    a: "À CONFIRMER : préciser ici vos conditions d'annulation et de remboursement de l'acompte.",
  },
  {
    q: "Proposez-vous des options sans alcool ?",
    a: "Oui. Chaque carte comprend des mocktails travaillés avec le même soin que le reste, pour que personne ne se contente d'un jus.",
  },
];
