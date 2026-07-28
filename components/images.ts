/** Image manifest. */
const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

export const IMAGES = {
  // Hero — day (light theme) / night (dark theme)
  heroDay: U("1558383905-adb5437a9c29", 2400),
  heroNight: U("1675416864738-373085409a19", 2400),
};

// Gallery — the bar's own cocktail photography (optimised, in /public)
export const GALLERY: { src: string; w: number; h: number }[] = [
  { src: "/images/gallery/cocktail-01.jpg", w: 1200, h: 1554 },
  { src: "/images/gallery/cocktail-02.jpg", w: 1067, h: 1600 },
  { src: "/images/gallery/cocktail-03.jpg", w: 1067, h: 1600 },
  { src: "/images/gallery/cocktail-04.jpg", w: 1066, h: 1600 },
  { src: "/images/gallery/cocktail-05.jpg", w: 1067, h: 1600 },
  { src: "/images/gallery/cocktail-06.jpg", w: 1066, h: 1600 },
  { src: "/images/gallery/cocktail-07.jpg", w: 1067, h: 1600 },
  { src: "/images/gallery/cocktail-08.jpg", w: 1067, h: 1600 },
];

// Dress code — client-provided chic outfits (couple centred as focal point)
export const DRESSCODE = [
  "/images/dress/dress-1.jpg", // femme, robe à pois
  "/images/dress/dress-2.jpg", // couple élégant (centre)
  "/images/dress/dress-3.jpg", // homme casual chic
];
