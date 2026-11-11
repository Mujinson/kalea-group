import type { Pt } from "./homography";

/** Quad order: top-left, top-right, bottom-right, bottom-left (normalized 0..1). */
export type Quad = [Pt, Pt, Pt, Pt];

export const DEFAULT_QUAD: Quad = [
  { x: 0.3, y: 0.55 }, { x: 0.7, y: 0.55 }, { x: 0.98, y: 0.98 }, { x: 0.02, y: 0.98 },
];

function fitLine(ys: number[], xs: number[]): { a: number; b: number } | null {
  let idx = ys.map((_, i) => i);
  let a = 0, b = 0;
  for (let iter = 0; iter < 3; iter++) {
    const n = idx.length;
    if (n < 4) return null;
    let sy = 0, sx = 0, syy = 0, sxy = 0;
    for (const i of idx) { sy += ys[i]; sx += xs[i]; syy += ys[i] * ys[i]; sxy += ys[i] * xs[i]; }
    const den = n * syy - sy * sy;
    if (Math.abs(den) < 1e-9) return null;
    a = (n * sxy - sy * sx) / den;
    b = (sx - a * sy) / n;
    const res = idx.map((i) => Math.abs(xs[i] - (a * ys[i] + b)));
    const sorted = [...res].sort((p, q) => p - q);
    const thr = Math.max(2, sorted[Math.floor(sorted.length * 0.7)] * 1.5);
    idx = idx.filter((_, k) => res[k] <= thr);
  }
  return { a, b };
}

/**
 * Estimate a trapezoid of the floor from a binary mask (values > 127 = floor).
 * Fits robust lines on left/right mask boundaries and intersects them with the
 * top/bottom floor rows. Falls back to DEFAULT_QUAD if the fit is unreliable.
 */
export function estimateQuad(mask: Uint8Array | Uint8ClampedArray, w: number, h: number, stride = 1): Quad {
  const minRun = Math.max(3, w * 0.05);
  const ys: number[] = [], ls: number[] = [], rs: number[] = [];
  for (let y = 0; y < h; y++) {
    let l = -1, r = -1, cnt = 0;
    for (let x = 0; x < w; x++) {
      if (mask[(y * w + x) * stride] > 127) { if (l < 0) l = x; r = x; cnt++; }
    }
    if (cnt >= minRun) { ys.push(y); ls.push(l); rs.push(r); }
  }
  if (ys.length < h * 0.08) return DEFAULT_QUAD;
  const yTop = ys[Math.floor(ys.length * 0.03)];
  const yBot = ys[ys.length - 1];
  // Sides clipped by the photo border don't show the floor direction: ignore them
  // and mirror the other side (camera assumed level), or use a symmetric trapezoid.
  const edge = Math.max(2, w * 0.01);
  const lClip = ls.filter((x) => x <= edge).length > ls.length * 0.4;
  const rClip = rs.filter((x) => x >= w - 1 - edge).length > rs.length * 0.4;
  let L = lClip ? null : fitLine(ys, ls), R = rClip ? null : fitLine(ys, rs);
  if (!L && R) L = { a: -R.a, b: w - 1 - R.b };
  else if (L && !R) R = { a: -L.a, b: w - 1 - L.b };
  else if (!L && !R) {
    // symmetric trapezoid converging to the image centre
    const span = Math.max(1, yBot - yTop), half = w * 0.45, top = w * 0.2;
    const aR = (half - top) / span;
    R = { a: aR, b: w / 2 + top - aR * yTop };
    L = { a: -aR, b: w / 2 - top + aR * yTop };
  }
  if (!L || !R) return DEFAULT_QUAD;
  const tl = L.a * yTop + L.b, tr = R.a * yTop + R.b;
  const bl = L.a * yBot + L.b, br = R.a * yBot + R.b;
  if (!(tr > tl && br > bl) || tr - tl > (br - bl) * 1.05) return DEFAULT_QUAD;
  // shrink 10% toward centre for safety
  const cx = (tl + tr + bl + br) / 4, cy = (yTop + yBot) / 2;
  const s = (x: number, y: number): Pt => ({
    x: Math.min(1, Math.max(0, (cx + (x - cx) * 0.9) / w)),
    y: Math.min(1, Math.max(0, (cy + (y - cy) * 0.9) / h)),
  });
  return [s(tl, yTop), s(tr, yTop), s(br, yBot), s(bl, yBot)];
}
