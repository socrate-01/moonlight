import type { Metadata } from "next";
import { Cinzel, Fraunces, Jost, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

/* Duo « prestige » réservé aux pages d'avis : capitales romaines gravées pour
   les titres, grotesque géométrique pour le texte. Aucun italique. */
const displayPrestige = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-prestige",
  display: "swap",
});

const sansPrestige = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-sans-prestige",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Moonlight Cocktail Bar · Cérémonie d'ouverture officielle",
  description:
    "Vous êtes convié à la cérémonie d'ouverture officielle du Moonlight Cocktail Bar. Une soirée sous le clair de lune. Dress code : chic. Réservez votre place.",
};

const themeScript = `
try {
  var t = localStorage.getItem('theme');
  if (t === 'light') { document.documentElement.classList.remove('dark'); }
  else { document.documentElement.classList.add('dark'); }
} catch (e) { document.documentElement.classList.add('dark'); }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${sans.variable} ${displayPrestige.variable} ${sansPrestige.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain font-sans antialiased">{children}</body>
    </html>
  );
}
