import { allHypermattProducts } from "@/data/hypermattProducts";
import { allExternoProducts } from "@/data/externoProducts";
import { spcCollections } from "@/data/spcCollections";
import { laminatiCollections } from "@/data/laminatiCollections";
import { parquetCollections } from "@/data/parquetCollections";

export type FloorCategory = "Hypermatt" | "Externo" | "SPC" | "Laminati" | "Parquet";
export interface VisualizerFloor {
  slug: string;
  name: string;
  category: FloorCategory;
  image: string;
  /** real width (cm) covered by the texture image */
  widthCm: number;
  rotation: number;
  /** real plank/tile size in cm: [width, length] */
  plankCm: [number, number];
}

const DEFAULT_CM: Record<FloorCategory, number> = { Hypermatt: 60, Externo: 60, SPC: 80, Laminati: 80, Parquet: 80 };

/** Parse the first "A×B mm" in a list of format strings -> [short, long] cm. */
export function parseFormatCm(formats: string[] | undefined): [number, number] | null {
  for (const f of formats ?? []) {
    const m = f.replace(/,/g, ".").match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*mm/i);
    if (m) { const a = Number(m[1]) / 10, b = Number(m[2]) / 10; return [Math.min(a, b), Math.max(a, b)]; }
  }
  return null;
}

/** Plank sizes from the product pages (Hypermatt XL/55/Spina, Externo). */
function hypermattPlank(id: string, sub?: string): [number, number] {
  if (id.startsWith("xl-")) return sub === "tile" || sub === "cement" ? [60, 120] : [22.86, 180];
  if (id.startsWith("spina-")) return [12.8, 64];
  if (id.startsWith("55-")) return sub === "tile" || sub === "cement" ? [46, 92] : [22.86, 152.4];
  return [22.86, 180];
}

/** Tiles (ratio < 2.5) are laid in a grid, planks staggered. */
export const isPlank = (f: { plankCm: [number, number] }) => f.plankCm[1] / f.plankCm[0] >= 2.5;

export const FLOOR_CATEGORIES: FloorCategory[] = ["Hypermatt", "Externo", "SPC", "Laminati", "Parquet"];

export const floorRegistry: VisualizerFloor[] = [
  ...allHypermattProducts.map((p) => ({ slug: `hypermatt-${p.id}`, name: p.name, category: "Hypermatt" as const, image: p.image, plankCm: hypermattPlank(p.id, p.subcategory) })),
  ...allExternoProducts.map((p) => ({ slug: `externo-${p.id}`, name: p.name, category: "Externo" as const, image: p.image, plankCm: [14, 220] as [number, number] })),
  ...spcCollections.map((c) => ({ slug: `spc-${c.slug}`, name: c.name, category: "SPC" as const, image: c.image, plankCm: parseFormatCm(c.formats) ?? [22, 183] })),
  ...laminatiCollections.map((c) => ({ slug: `laminati-${c.slug}`, name: c.name, category: "Laminati" as const, image: c.image, plankCm: parseFormatCm(c.formats) ?? [24.5, 205] })),
  ...parquetCollections.map((c) => ({ slug: `parquet-${c.slug}`, name: c.name, category: "Parquet" as const, image: c.image, plankCm: parseFormatCm(c.formats) ?? [19, 190] })),
].map((f) => ({ ...f, widthCm: isPlank(f) ? Math.round(f.plankCm[1]) : DEFAULT_CM[f.category], rotation: 0 }));

export const visualizerSlug = {
  hypermatt: (id: string) => `hypermatt-${id}`,
  externo: (id: string) => `externo-${id}`,
  spc: (s: string) => `spc-${s}`,
  laminati: (s: string) => `laminati-${s}`,
  parquet: (s: string) => `parquet-${s}`,
};
