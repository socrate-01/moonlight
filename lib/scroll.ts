/** Défilement animé à la main.
 *
 *  `scrollIntoView({ behavior: "smooth" })` ne se règle pas : sa durée est
 *  fixée par le navigateur et se révèle beaucoup trop brusque sur une longue
 *  distance. On anime donc nous-mêmes, avec une durée et une courbe choisies.
 */

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** `offset` recule l'arrivée de quelques dizaines de pixels : la barre de
 *  navigation est fixe, donc viser le haut exact d'une section place son titre
 *  juste dessous, masqué. */
export function scrollToElement(id: string, duration = 1600, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;

  const target = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - offset
  );
  const start = window.scrollY;
  const delta = target - start;
  if (Math.abs(delta) < 2) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, target);
    return;
  }

  let startTime: number | null = null;
  let cancelled = false;

  // Un geste de l'utilisateur reprend la main : rien de plus agaçant qu'une
  // page qui continue de glisser alors qu'on essaie de la diriger.
  const cancel = () => {
    cancelled = true;
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
  };
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("keydown", cancel);

  const step = (now: number) => {
    if (cancelled) return;
    if (startTime === null) startTime = now;
    const p = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + delta * easeInOutCubic(p));
    if (p < 1) requestAnimationFrame(step);
    else cancel();
  };
  requestAnimationFrame(step);
}
