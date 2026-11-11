// 3x3 homography (row-major, 9 numbers) via DLT with h33 = 1.
export type Pt = { x: number; y: number };
export type Mat3 = number[];

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-12) throw new Error("degenerate");
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}

/** Homography mapping src[i] -> dst[i] (4 points). */
export function computeHomography(src: Pt[], dst: Pt[]): Mat3 {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  return [...solve(A, b), 1];
}

export function applyHomography(H: Mat3, p: Pt): Pt {
  const w = H[6] * p.x + H[7] * p.y + H[8];
  return { x: (H[0] * p.x + H[1] * p.y + H[2]) / w, y: (H[3] * p.x + H[4] * p.y + H[5]) / w };
}

export function invert3(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-14) throw new Error("singular");
  const inv = [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d];
  return inv.map((v) => v / det);
}

type V3 = [number, number, number];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/**
 * Metric homography image(0..1) -> floor metres, assuming a pinhole camera with
 * the given horizontal-ish field of view (on the long side) at height camH above
 * the floor. The quad (TL,TR,BR,BL) only gives the floor directions: its side
 * edges define the "depth" axis (floor y), the across axis is floor x.
 * Returns null when the quad gives no usable horizon.
 */
export function metricHomography(quad: Pt[], W: number, H: number, camH = 1.4, fovDeg = 65): Mat3 | null {
  const f = (0.5 * Math.max(W, H)) / Math.tan(((fovDeg / 2) * Math.PI) / 180);
  const cx = W / 2, cy = H / 2;
  // points in camera-normalised coords (K^-1 p)
  const P = quad.map((q) => [(q.x * W - cx) / f, (q.y * H - cy) / f, 1] as V3);
  const [tl, tr, br, bl] = P;
  const vpDepth = cross(cross(tl, bl), cross(tr, br)); // direction of side edges
  const vpAcross = cross(cross(tl, tr), cross(bl, br));
  let n = norm(cross(vpDepth, vpAcross)); // horizon line in normalised coords == plane normal
  if (!isFinite(n[0]) || Math.abs(n[1]) < 0.05) return null; // looking straight down or degenerate
  const c: V3 = norm([(tl[0] + tr[0] + br[0] + bl[0]) / 4, (tl[1] + tr[1] + br[1] + bl[1]) / 4, 1]);
  if (dot(n, c) < 0) n = [-n[0], -n[1], -n[2]];
  // depth axis: vanishing direction, projected onto plane, pointing away from camera
  let e1 = norm(vpDepth);
  const k = dot(e1, n); e1 = norm([e1[0] - k * n[0], e1[1] - k * n[1], e1[2] - k * n[2]]);
  if (e1[2] < 0) e1 = [-e1[0], -e1[1], -e1[2]];
  const e2 = cross(e1, n); // across
  // floor coords = camH * (e2·d, -e1·d) / (n·d), d = K^-1 p ; p = (u*W, v*H, 1)
  const Kinv = [1 / f, 0, -cx / f, 0, 1 / f, -cy / f, 0, 0, 1];
  const S = [W, 0, 0, 0, H, 0, 0, 0, 1];
  const R = [camH * e2[0], camH * e2[1], camH * e2[2], -camH * e1[0], -camH * e1[1], -camH * e1[2], n[0], n[1], n[2]];
  const mul = (a: number[], b: number[]) => { const o = new Array(9).fill(0); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let t = 0; t < 3; t++) o[i * 3 + j] += a[i * 3 + t] * b[t * 3 + j]; return o; };
  return mul(mul(R, Kinv), S);
}
