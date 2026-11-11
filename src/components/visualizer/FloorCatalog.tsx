import { useState } from "react";
import { cn } from "@/lib/utils";
import { FLOOR_CATEGORIES, type FloorCategory, type VisualizerFloor } from "@/lib/visualizer/floorRegistry";

export default function FloorCatalog({ floors, selected, onSelect }: { floors: VisualizerFloor[]; selected?: string; onSelect: (f: VisualizerFloor) => void }) {
  const [cat, setCat] = useState<FloorCategory | "Tutti">("Tutti");
  const list = cat === "Tutti" ? floors : floors.filter((f) => f.category === cat);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["Tutti", ...FLOOR_CATEGORIES] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={cn("px-3 py-1 rounded-full text-xs uppercase tracking-wider border transition-colors",
              cat === c ? "bg-foreground text-background border-foreground" : "border-border text-foreground hover:bg-muted")}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {list.map((f) => (
          <button key={f.slug} onClick={() => onSelect(f)} title={f.name}
            className={cn("text-left rounded-lg overflow-hidden border-2 transition-all", selected === f.slug ? "border-primary" : "border-transparent hover:border-border")}>
            <img src={f.image} alt={f.name} loading="lazy" className="aspect-square w-full object-cover" />
            <span className="block px-1 py-1 text-[11px] font-medium truncate whitespace-nowrap">{f.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
