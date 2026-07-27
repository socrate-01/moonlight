import Reveal from "./Reveal";
import GalleryTile from "./GalleryTile";
import { IMAGES } from "./images";

export default function Gallery() {
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
              L'ambiance d'une soirée
            </h2>
          </Reveal>
        </div>

        {/* Editorial, offset composition — the centre image peaks as the focal point */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-start lg:gap-8">
          <GalleryTile
            src={IMAGES.galleryTerrasse}
            index={0}
            ratio="aspect-[3/4]"
            className="sm:col-span-4 sm:col-start-1 sm:mt-20 lg:mt-28"
          />
          <GalleryTile
            src={IMAGES.gallerySignature}
            index={1}
            ratio="aspect-[2/3]"
            className="sm:col-span-4 sm:col-start-5 sm:-mt-2"
          />
          <GalleryTile
            src={IMAGES.galleryHauteur}
            index={2}
            ratio="aspect-[3/4]"
            className="sm:col-span-4 sm:col-start-9 sm:mt-10 lg:mt-14"
          />
        </div>
      </div>
    </section>
  );
}
