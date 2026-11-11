import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Camera, Download, Eraser, Brush, Undo2, Move, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import FloorCatalog from "@/components/visualizer/FloorCatalog";
import { floorRegistry, type VisualizerFloor } from "@/lib/visualizer/floorRegistry";
import { computeHomography } from "@/lib/visualizer/homography";
import { estimateQuad, DEFAULT_QUAD, type Quad } from "@/lib/visualizer/quadEstimate";
import { featherMask, loadResized, paintCircle } from "@/lib/visualizer/maskOps";
import { FloorRenderer } from "@/lib/visualizer/renderer";
import { exportRender } from "@/lib/visualizer/exportImage";
import demoSoggiorno from "@/assets/realizzazione-soggiorno-aurora.jpg";
import demoCucina from "@/assets/realizzazione-cucina-perla.jpg";
import demoCamera from "@/assets/realizzazione-camera-perla.jpg";

const DEMOS = [
  { label: "Soggiorno", src: demoSoggiorno },
  { label: "Cucina", src: demoCucina },
  { label: "Camera", src: demoCamera },
];

type Tool = "view" | "add" | "remove" | "quad";

export default function Visualizzatore() {
  const { language } = useTranslation();
  const [params] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FloorRenderer | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<Uint8ClampedArray | null>(null);
  const undoRef = useRef<Uint8ClampedArray[]>([]);
  const dragRef = useRef<number | null>(null);
  const paintingRef = useRef(false);

  const [floors, setFloors] = useState<VisualizerFloor[]>(floorRegistry);
  const [floor, setFloor] = useState<VisualizerFloor>(() => floorRegistry.find((f) => f.slug === params.get("prodotto")) ?? floorRegistry[0]);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [maskVersion, setMaskVersion] = useState(0);
  const [quad, setQuad] = useState<Quad>(DEFAULT_QUAD);
  const [tool, setTool] = useState<Tool>("view");
  const [brush, setBrush] = useState(30);
  const [feather, setFeather] = useState(3);
  const [tileCm, setTileCm] = useState(floor.widthCm);
  const [rot, setRot] = useState(floor.rotation);
  const [shadow, setShadow] = useState(0.7);
  const [split, setSplit] = useState(1);
  const [roomW, setRoomW] = useState(4);
  const [roomD, setRoomD] = useState(5);
  const [mirror, setMirror] = useState(false);
  const [includeRug, setIncludeRug] = useState(false);
  const [floorReady, setFloorReady] = useState(0);

  // Load CRM overrides (texture + real size)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("floor_visualizer_textures").select("product_slug, texture_url, real_width_cm, default_rotation, enabled");
      if (!data?.length) return;
      const paths = data.filter((d) => d.texture_url && !/^https?:/.test(d.texture_url)).map((d) => d.texture_url!);
      const signed = paths.length ? (await supabase.storage.from("visualizer-textures").createSignedUrls(paths, 86400)).data ?? [] : [];
      const urlOf = (p: string) => (/^https?:/.test(p) ? p : signed.find((s) => s.path === p)?.signedUrl);
      const map = new Map(data.map((d) => [d.product_slug, d]));
      const next = floorRegistry
        .filter((f) => map.get(f.slug)?.enabled !== false)
        .map((f) => {
          const o = map.get(f.slug);
          if (!o) return f;
          return { ...f, image: (o.texture_url && urlOf(o.texture_url)) || f.image, widthCm: Number(o.real_width_cm) || f.widthCm, rotation: Number(o.default_rotation) || 0 };
        });
      setFloors(next);
      setFloor((cur) => {
        const n = next.find((f) => f.slug === cur.slug) ?? cur;
        setTileCm(n.widthCm); setRot(n.rotation);
        return n;
      });
    })();
  }, []);

  const H = useMemo(() => {
    try {
      return computeHomography(quad, [{ x: 0, y: 0 }, { x: roomW, y: 0 }, { x: roomW, y: roomD }, { x: 0, y: roomD }]);
    } catch { return null; }
  }, [quad, roomW, roomD]);

  const draw = useCallback(() => {
    const r = rendererRef.current;
    if (!r || !hasPhoto || !H) return;
    r.render({ H, tileM: tileCm / 100, rotDeg: rot, shadow, split });
  }, [H, tileCm, rot, shadow, split, hasPhoto]);

  // upload feathered mask
  useEffect(() => {
    const r = rendererRef.current, p = photoRef.current, m = maskRef.current;
    if (!r || !p || !m) return;
    r.setMask(featherMask(m, p.width, p.height, feather), p.width, p.height);
    drawOverlay();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maskVersion, feather]);

  // floor texture
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { rendererRef.current?.setFloor(img, mirror); setFloorReady((v) => v + 1); };
    img.src = floor.image;
  }, [floor, mirror, hasPhoto]);

  useEffect(() => { draw(); }, [draw, floorReady]);

  const drawOverlay = () => {
    const o = overlayRef.current, p = photoRef.current, m = maskRef.current;
    if (!o || !p || !m) return;
    o.width = p.width; o.height = p.height;
    const ctx = o.getContext("2d")!;
    ctx.clearRect(0, 0, o.width, o.height);
    if (tool !== "add" && tool !== "remove") return;
    const img = ctx.createImageData(p.width, p.height);
    for (let i = 0; i < m.length; i++) if (m[i] > 127) { img.data[i * 4] = 230; img.data[i * 4 + 1] = 60; img.data[i * 4 + 2] = 40; img.data[i * 4 + 3] = 110; }
    ctx.putImageData(img, 0, 0);
  };
  useEffect(drawOverlay, [tool]); // eslint-disable-line react-hooks/exhaustive-deps

  const segment = (canvas: HTMLCanvasElement) => new Promise<Uint8ClampedArray>((resolve, reject) => {
    if (!workerRef.current) workerRef.current = new Worker(new URL("../workers/segmentation.worker.ts", import.meta.url), { type: "module" });
    const w = workerRef.current;
    const id = Date.now();
    const small = document.createElement("canvas");
    const s = 512 / Math.max(canvas.width, canvas.height);
    small.width = Math.round(canvas.width * s); small.height = Math.round(canvas.height * s);
    small.getContext("2d")!.drawImage(canvas, 0, 0, small.width, small.height);
    const files: Record<string, { l: number; t: number }> = {};
    w.onmessage = (ev) => {
      const d = ev.data;
      if (d.id !== id) return;
      if (d.type === "progress") {
        files[d.file] = { l: d.loaded, t: d.total };
        const v = Object.values(files); setProgress(Math.round((v.reduce((a, b) => a + b.l, 0) / v.reduce((a, b) => a + b.t, 0)) * 100));
        setBusy("Scarico il modello di riconoscimento (solo la prima volta)…");
      } else if (d.type === "status") setBusy("Riconosco il pavimento nella foto…");
      else if (d.type === "done") resolve(d.mask);
      else if (d.type === "error") reject(new Error(d.error));
    };
    small.toBlob((blob) => w.postMessage({ id, blob, includeRug, width: canvas.width, height: canvas.height }), "image/jpeg", 0.9);
  });

  const loadPhoto = async (src: string | Blob) => {
    setError(null); setBusy("Preparo la foto…"); setProgress(0);
    try {
      const c = await loadResized(src, 1024);
      photoRef.current = c;
      if (!rendererRef.current && canvasRef.current) rendererRef.current = new FloorRenderer(canvasRef.current);
      rendererRef.current!.setPhoto(c);
      maskRef.current = new Uint8ClampedArray(c.width * c.height);
      undoRef.current = [];
      setHasPhoto(true); setSplit(1); setTool("view");
      setBusy("Riconosco il pavimento nella foto…");
      const m = await segment(c);
      maskRef.current = m;
      setQuad(estimateQuad(m, c.width, c.height));
      setMaskVersion((v) => v + 1);
      if (!m.some((v) => v > 127)) setError("Non ho trovato il pavimento: disegnalo con il pennello «Aggiungi».");
    } catch (e: any) {
      setError(e?.message || "Errore durante l'elaborazione. Puoi disegnare il pavimento a mano.");
      setMaskVersion((v) => v + 1);
    } finally { setBusy(null); }
  };

  const toNorm = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const paint = (e: React.PointerEvent) => {
    const p = photoRef.current, m = maskRef.current; if (!p || !m) return;
    const n = toNorm(e);
    const scale = p.width / (e.currentTarget as HTMLElement).getBoundingClientRect().width;
    paintCircle(m, p.width, p.height, n.x * p.width, n.y * p.height, brush * scale, tool === "add");
    drawOverlay();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (tool === "add" || tool === "remove") {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      undoRef.current.push(maskRef.current!.slice());
      if (undoRef.current.length > 20) undoRef.current.shift();
      paintingRef.current = true; paint(e);
    } else if (tool === "view") {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      paintingRef.current = true; setSplit(toNorm(e).x);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!paintingRef.current) return;
    if (tool === "view") setSplit(Math.min(1, Math.max(0, toNorm(e).x)));
    else paint(e);
  };
  const onPointerUp = () => {
    if (paintingRef.current && (tool === "add" || tool === "remove")) setMaskVersion((v) => v + 1);
    paintingRef.current = false;
  };

  const undo = () => {
    const prev = undoRef.current.pop();
    if (prev) { maskRef.current = prev; setMaskVersion((v) => v + 1); }
  };

  const onHandleMove = (e: React.PointerEvent) => {
    if (dragRef.current === null) return;
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    const y = Math.min(1, Math.max(0, (e.clientY - box.top) / box.height));
    const i = dragRef.current;
    setQuad((q) => q.map((p, k) => (k === i ? { x, y } : p)) as Quad);
  };

  const selectFloor = (f: VisualizerFloor) => { setFloor(f); setTileCm(f.widthCm); setRot(f.rotation); };

  const download = async () => {
    const r = rendererRef.current; if (!r || !H) return;
    r.render({ H, tileM: tileCm / 100, rotDeg: rot, shadow, split: 1 });
    const blob = await exportRender(r.canvas, floor.name);
    draw();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `kalea-${floor.slug}.png`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const quoteHref = `/${language}/preventivo-online?prodotto=${encodeURIComponent(`${floor.category} ${floor.name}`)}`;
  const tools: { id: Tool; label: string; icon: any }[] = [
    { id: "view", label: "Prima/dopo", icon: Move },
    { id: "add", label: "Aggiungi", icon: Brush },
    { id: "remove", label: "Rimuovi", icon: Eraser },
    { id: "quad", label: "Prospettiva", icon: Move },
  ];

  return (
    <div className="bg-background min-h-screen pt-28 pb-16">
      <SEOHead
        title="Visualizzatore pavimenti | Kalēa – Surface System®"
        description="Carica una foto della tua stanza e prova i pavimenti Kalēa direttamente sul tuo pavimento. La foto resta sul tuo dispositivo."
      />
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">Visualizzatore pavimenti</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Scatta o carica una foto della tua stanza: vedrai il pavimento Kalēa<span className="whitespace-nowrap">®</span> scelto applicato sul tuo pavimento.
            La foto non lascia mai il tuo dispositivo.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <label className="cursor-pointer">
                  <Camera className="w-4 h-4 mr-2" /> Scatta o carica foto
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) loadPhoto(f); e.target.value = ""; }} />
                </label>
              </Button>
              {DEMOS.map((d) => (
                <Button key={d.label} variant="outline" onClick={() => loadPhoto(d.src)} disabled={!!busy}>{d.label} demo</Button>
              ))}
            </div>

            {busy && (
              <div className="rounded-lg border border-border bg-card p-3 text-sm">
                <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{busy}</div>
                {progress > 0 && progress < 100 && (
                  <div className="mt-2 h-2 rounded bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
                )}
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className={cn("relative w-full rounded-xl overflow-hidden bg-muted select-none touch-none", !hasPhoto && "aspect-[4/3] flex items-center justify-center")}>
              {!hasPhoto && <p className="text-muted-foreground text-sm px-6 text-center">Scegli una foto o una stanza demo per iniziare</p>}
              <canvas ref={canvasRef} className={cn("w-full h-auto block", !hasPhoto && "hidden")} />
              {hasPhoto && (
                <canvas ref={overlayRef}
                  className={cn("absolute inset-0 w-full h-full", tool === "add" || tool === "remove" ? "cursor-crosshair" : tool === "view" ? "cursor-ew-resize" : "pointer-events-none")}
                  onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
              )}
              {hasPhoto && tool === "view" && split < 1 && (
                <div className="absolute top-0 bottom-0 w-0.5 bg-background pointer-events-none" style={{ left: `${split * 100}%` }} />
              )}
              {hasPhoto && tool === "quad" && (
                <div className="absolute inset-0" onPointerMove={onHandleMove} onPointerUp={() => (dragRef.current = null)} onPointerLeave={() => (dragRef.current = null)}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1 1" preserveAspectRatio="none">
                    <polygon points={quad.map((p) => `${p.x},${p.y}`).join(" ")} fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary))" strokeWidth={0.004} />
                  </svg>
                  {quad.map((p, i) => (
                    <div key={i} onPointerDown={(e) => { (e.currentTarget.parentElement as HTMLElement).setPointerCapture(e.pointerId); dragRef.current = i; }}
                      className="absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border-2 border-background bg-primary shadow cursor-grab touch-none"
                      style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }} />
                  ))}
                </div>
              )}
            </div>

            {hasPhoto && (
              <div className="flex flex-wrap items-center gap-2">
                {tools.map((t) => (
                  <Button key={t.id} size="sm" variant={tool === t.id ? "default" : "outline"} onClick={() => { setTool(t.id); if (t.id !== "view") setSplit(1); }}>
                    <t.icon className="w-4 h-4 mr-1" />{t.label}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={undo}><Undo2 className="w-4 h-4 mr-1" />Annulla</Button>
                {(tool === "add" || tool === "remove") && (
                  <div className="flex items-center gap-2 min-w-[180px]"><span className="text-xs">Pennello</span>
                    <Slider value={[brush]} min={5} max={80} onValueChange={([v]) => setBrush(v)} /></div>
                )}
                {tool === "quad" && (
                  <Button size="sm" variant="ghost" onClick={() => { const p = photoRef.current, m = maskRef.current; if (p && m) setQuad(estimateQuad(m, p.width, p.height)); }}>Stima automatica</Button>
                )}
              </div>
            )}
            {hasPhoto && tool === "view" && <p className="text-xs text-muted-foreground">Trascina sulla foto per confrontare prima e dopo. Con «Prospettiva» sposta i 4 punti sugli angoli del pavimento.</p>}
          </div>

          <aside className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Pavimento scelto</p>
              <p className="text-lg font-semibold whitespace-nowrap truncate">{floor.category} · {floor.name}</p>
            </div>
            <FloorCatalog floors={floors} selected={floor.slug} onSelect={selectFloor} />

            <div className="space-y-4 rounded-xl border border-border p-4 bg-card">
              <Ctl label={`Dimensione texture: ${tileCm} cm`}><Slider value={[tileCm]} min={10} max={300} onValueChange={([v]) => setTileCm(v)} /></Ctl>
              <Ctl label={`Rotazione: ${rot}°`}>
                <div className="flex gap-1 mb-2">{[0, 45, 90].map((d) => <Button key={d} size="sm" variant={rot === d ? "default" : "outline"} onClick={() => setRot(d)}>{d}°</Button>)}</div>
                <Slider value={[rot]} min={0} max={180} onValueChange={([v]) => setRot(v)} />
              </Ctl>
              <Ctl label={`Intensità ombre: ${Math.round(shadow * 100)}%`}><Slider value={[shadow * 100]} min={0} max={100} onValueChange={([v]) => setShadow(v / 100)} /></Ctl>
              <Ctl label={`Sfumatura bordi: ${feather}px`}><Slider value={[feather]} min={0} max={15} onValueChange={([v]) => setFeather(v)} /></Ctl>
              <Ctl label={`Larghezza stanza: ${roomW} m`}><Slider value={[roomW]} min={1} max={12} step={0.5} onValueChange={([v]) => setRoomW(v)} /></Ctl>
              <Ctl label={`Profondità stanza: ${roomD} m`}><Slider value={[roomD]} min={1} max={15} step={0.5} onValueChange={([v]) => setRoomD(v)} /></Ctl>
              <div className="flex items-center justify-between"><Label htmlFor="mir" className="text-sm">Ripetizione a specchio</Label><Switch id="mir" checked={mirror} onCheckedChange={setMirror} /></div>
              <div className="flex items-center justify-between"><Label htmlFor="rug" className="text-sm">Includi tappeti</Label><Switch id="rug" checked={includeRug} onCheckedChange={setIncludeRug} /></div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={download} disabled={!hasPhoto}><Download className="w-4 h-4 mr-2" />Scarica immagine</Button>
              <Button asChild variant="outline"><Link to={quoteHref}><FileText className="w-4 h-4 mr-2" />Richiedi preventivo per questo pavimento</Link></Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Ctl({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><p className="text-sm">{label}</p>{children}</div>;
}
