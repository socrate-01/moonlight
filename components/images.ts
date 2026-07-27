/** Curated Unsplash imagery. Swap these IDs to change the photos. */
const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

export const IMAGES = {
  // Hero — day (light theme): bright rooftop, cocktails & skyline
  heroDay: U("1558383905-adb5437a9c29", 2400),
  // Hero — night (dark theme): warm, moody cocktail bar
  heroNight: U("1675416864738-373085409a19", 2400),

  // Gallery — client-provided photos
  galleryTerrasse: "/images/gal-terrasse.avif",
  gallerySignature: "/images/gal-signature.avif",
  galleryHauteur: "/images/gal-hauteur.avif",
};
