/// <reference lib="webworker" />
import { pipeline, env, RawImage } from "@huggingface/transformers";

env.allowLocalModels = false;
const MODEL = "Xenova/segformer-b0-finetuned-ade-512-512";
const FLOOR_LABELS = new Set(["floor", "flooring"]);
const RUG_LABELS = new Set(["rug", "carpet"]);

let segPromise: Promise<any> | null = null;

async function getSeg(post: (m: any) => void, forceWasm = false) {
  if (segPromise) return segPromise;
  let hasGPU = false;
  try { hasGPU = !!(await (self as any).navigator?.gpu?.requestAdapter()); } catch { hasGPU = false; }
  const progress_callback = (p: any) => {
    if (p.status === "progress" && p.total) post({ type: "progress", loaded: p.loaded, total: p.total, file: p.file });
  };
  segPromise = (async () => {
    if (hasGPU && !forceWasm) {
      try {
        return await pipeline("image-segmentation", MODEL, { device: "webgpu", progress_callback } as any);
      } catch (e) { /* fallback */ }
    }
    return await pipeline("image-segmentation", MODEL, { device: "wasm", dtype: "q8", progress_callback } as any);
  })();
  try { return await segPromise; } catch (e) { segPromise = null; throw e; }
}

self.onmessage = async (ev: MessageEvent) => {
  const { id, blob, includeRug, width, height } = ev.data as { id: number; blob: Blob; includeRug: boolean; width: number; height: number };
  const post = (m: any) => (self as any).postMessage({ id, ...m });
  try {
    let seg = await getSeg(post);
    post({ type: "status", status: "inference" });
    const image = await RawImage.fromBlob(blob);
    let out: any[];
    try { out = await seg(image); }
    catch { segPromise = null; seg = await getSeg(post, true); out = await seg(image); }
    // combine masks, resample to requested size (nearest)
    const res = new Uint8ClampedArray(width * height);
    for (const o of out) {
      const lab = String(o.label).toLowerCase();
      if (!FLOOR_LABELS.has(lab) && !(includeRug && RUG_LABELS.has(lab))) continue;
      const m: RawImage = o.mask;
      const mw = m.width, mh = m.height, ch = m.channels;
      for (let y = 0; y < height; y++) {
        const sy = Math.min(mh - 1, Math.floor((y / height) * mh));
        for (let x = 0; x < width; x++) {
          const sx = Math.min(mw - 1, Math.floor((x / width) * mw));
          if (m.data[(sy * mw + sx) * ch] > 127) res[y * width + x] = 255;
        }
      }
    }
    (self as any).postMessage({ id, type: "done", mask: res, width, height }, [res.buffer]);
  } catch (e: any) {
    post({ type: "error", error: String(e?.message ?? e) });
  }
};
