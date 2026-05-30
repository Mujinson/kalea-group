import ColorCircleGallery, { ColorItem } from "@/components/ColorCircleGallery";
import { getCollectionColors } from "@/data/collectionColors";

interface CollectionColorsSectionProps {
  slug: string;
  collectionName: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

const CollectionColorsSection = ({
  slug,
  collectionName,
  title,
  subtitle,
  className = "py-20 md:py-28 px-4 md:px-8 lg:px-12 bg-background",
}: CollectionColorsSectionProps) => {
  const swatches = getCollectionColors(slug);
  if (!swatches.length) return null;

  const items: ColorItem[] = swatches.map((c) => ({
    name: c.name,
    slug: `${slug}-${c.name.toLowerCase().replace(/\s+/g, "-")}`,
    circleImage: "",
    plankImage: "",
    colorHex: c.hex,
  }));

  return (
    <section className={className}>
      <div className="max-w-6xl mx-auto">
        <ColorCircleGallery
          title={title ?? `Colori ${collectionName}`}
          subtitle={
            subtitle ??
            `Palette completa della collezione. Tutte le tonalità disponibili — campionario fisico su richiesta.`
          }
          colors={items}
        />
      </div>
    </section>
  );
};

export default CollectionColorsSection;
