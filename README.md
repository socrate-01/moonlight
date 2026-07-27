# Moonlight Cocktail Bar

Single-page invitation site for the official opening ceremony of **Moonlight Cocktail Bar**.

Built with **Next.js (App Router)**, **Tailwind CSS** and **Framer Motion**.

## Features

- Immersive full-screen hero with a day/night banner image
- Two themes: **light "old money"** and **night "purple glamour"**, with a persisted toggle
- Sections: La Maison (about), Dress code, Galerie, Réservation (RSVP)
- Reservation form with a live invitation + QR preview (UI only for now)
- Zoom-in loading screen, scroll reveals, parallax and neon accents
- Fully responsive

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

- Event date, time and venue are placeholders (`Samedi XX Mois 2026`, `[ Adresse du lieu ]`).
- Email delivery, real QR code and PDF generation are not wired yet.
- Gallery photos live in `public/images/`; other imagery is configured in `components/images.ts`.
