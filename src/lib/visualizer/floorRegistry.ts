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
}

const DEFAULT_CM: Record<FloorCategory, number> = { Hypermatt: 60, Externo: 60, SPC: 80, Laminati: 80, Parquet: 80 };

export const FLOOR_CATEGORIES: FloorCategory[] = ["Hypermatt", "Externo", "SPC", "Laminati", "Parquet"];

export const floorRegistry: VisualizerFloor[] = [
  ...allHypermattProducts.map((p) => ({ slug: `hypermatt-${p.id}`, name: p.name, category: "Hypermatt" as const, image: p.image })),
  ...allExternoProducts.map((p) => ({ slug: `externo-${p.id}`, name: p.name, category: "Externo" as const, image: p.image })),
  ...spcCollections.map((c) => ({ slug: `spc-${c.slug}`, name: c.name, category: "SPC" as const, image: c.image })),
  ...laminatiCollections.map((c) => ({ slug: `laminati-${c.slug}`, name: c.name, category: "Laminati" as const, image: c.image })),
  ...parquetCollections.map((c) => ({ slug: `parquet-${c.slug}`, name: c.name, category: "Parquet" as const, image: c.image })),
].map((f) => ({ ...f, widthCm: DEFAULT_CM[f.category], rotation: 0 }));

export const visualizerSlug = {
  hypermatt: (id: string) => `hypermatt-${id}`,
  externo: (id: string) => `externo-${id}`,
  spc: (s: string) => `spc-${s}`,
  laminati: (s: string) => `laminati-${s}`,
  parquet: (s: string) => `parquet-${s}`,
};
