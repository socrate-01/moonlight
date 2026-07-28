import Reveal from "./Reveal";
import NeonTile from "./NeonTile";
import { GALLERY } from "./images";

type Item = { src: string; w: number; h: number };

// Distribute images round-robin into n vertical tracks (keeps left-to-right order).
function toColumns(items: Item[], n: number): (Item & { i: number })[][] {
  const cols: (Item & { i: number })[][] = Array.from({ length: n }, () => []);
  items.forEach((it, i) => cols[i % n].push({ ...it, i }));
  return cols;
}

export default function Gallery() {
  const desktop = toColumns(GALLERY, 4);
  const mobile = toColumns(GALLERY, 2);

  return (
    <section id="gallery" className="relative overflow-hidden bg-bg py-28 lg:py-40">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-16 flex flex-col items-center">
          <div className="mb-6 flex items-baseline gap-4">
            <span className="numeral">III</span>
            <span className="eyebrow-plain">Galerie</span>
          </div>
          <Reveal>
            <h2 className="text-center font-display text-4xl font-light text-fg sm:text-5xl md:text-6xl">
              Nos cocktails signature
            </h2>
          </Reveal>
        </div>

        {/* Desktop — 4 offset tracks for a charming, rhythmic wall */}
        <div className="hidden gap-6 md:flex">
          {desktop.map((col, ci) => (
            <div
              key={ci}
              className={`flex flex-1 flex-col gap-6 ${
                ci % 2 === 1 ? "mt-16" : ""
              }`}
            >
              {col.map((img) => (
                <NeonTile key={img.src} src={img.src} index={img.i} />
              ))}
            </div>
          ))}
        </div>

        {/* Mobile / tablet — 2 offset tracks */}
        <div className="flex gap-4 md:hidden">
          {mobile.map((col, ci) => (
            <div
              key={ci}
              className={`flex flex-1 flex-col gap-4 ${
                ci % 2 === 1 ? "mt-10" : ""
              }`}
            >
              {col.map((img) => (
                <NeonTile key={img.src} src={img.src} index={img.i} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
