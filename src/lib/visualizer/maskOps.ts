/** Separable box blur (2 passes ≈ gaussian) on a single-channel mask. */
export function featherMask(src: Uint8ClampedArray, w: number, h: number, radius: number): Uint8ClampedArray {
  if (radius < 1) return src.slice();
  const r = Math.round(radius);
  let a = new Float32Array(src);
  let b = new Float32Array(w * h);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      let acc = 0; const row = y * w;
      for (let x = -r; x <= r; x++) acc += a[row + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[row + x] = acc / (2 * r + 1);
        acc += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += b[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = acc / (2 * r + 1);
        acc += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
      }
    }
  }
  return Uint8ClampedArray.from(a);
}

export function paintCircle(mask: Uint8ClampedArray, w: number, h: number, cx: number, cy: number, r: number, add: boolean) {
  const v = add ? 255 : 0;
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
  const r2 = r * r;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= r2) mask[y * w + x] = v;
  }
}

/** Load an image file/url, resize so the long side is <= maxSide. */
export async function loadResized(src: string | Blob, maxSide = 1024): Promise<HTMLCanvasElement> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("Immagine non leggibile")); img.src = url; });
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  if (typeof src !== "string") URL.revokeObjectURL(url);
  return c;
}

/** Box blur on a float field (in place-safe, returns new array). */
export function boxBlurF(src: Float32Array, w: number, h: number, r: number): Float32Array {
  r = Math.max(1, Math.round(r));
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), d = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w; let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) { tmp[row + x] = acc / d; acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)]; }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) { out[y * w + x] = acc / d; acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
  }
  return out;
}

export function luminance(photo: HTMLCanvasElement | { data: Uint8ClampedArray }, w: number, h: number): Float32Array {
  const data = "data" in photo ? photo.data : photo.getContext("2d")!.getImageData(0, 0, w, h).data;
  const L = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) L[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
  return L;
}

/** Guided filter (He et al.): snaps a soft mask to the edges of the photo. */
export function guidedFilter(I: Float32Array, p: Float32Array, w: number, h: number, r: number, eps: number): Float32Array {
  const n = w * h, Ip = new Float32Array(n), II = new Float32Array(n);
  for (let i = 0; i < n; i++) { Ip[i] = I[i] * p[i]; II[i] = I[i] * I[i]; }
  const mI = boxBlurF(I, w, h, r), mp = boxBlurF(p, w, h, r), mIp = boxBlurF(Ip, w, h, r), mII = boxBlurF(II, w, h, r);
  const a = new Float32Array(n), b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const v = mII[i] - mI[i] * mI[i]; a[i] = (mIp[i] - mI[i] * mp[i]) / (v + eps); b[i] = mp[i] - a[i] * mI[i]; }
  const ma = boxBlurF(a, w, h, r), mb = boxBlurF(b, w, h, r), q = new Float32Array(n);
  for (let i = 0; i < n; i++) q[i] = ma[i] * I[i] + mb[i];
  return q;
}

/** Morphological open + keep only sizeable connected regions (removes floor "stains" on beds, walls…). */
export function cleanMask(bin: Uint8ClampedArray, w: number, h: number, openR = 3, minFrac = 0.06): Uint8ClampedArray {
  const f = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++) f[i] = bin[i] > 127 ? 1 : 0;
  // erosion then dilation via box blur thresholds
  const er = boxBlurF(f, w, h, openR);
  for (let i = 0; i < f.length; i++) f[i] = er[i] > 0.999 ? 1 : 0;
  const di = boxBlurF(f, w, h, openR);
  const m = new Uint8Array(bin.length);
  for (let i = 0; i < m.length; i++) m[i] = di[i] > 0.001 && bin[i] > 127 ? 1 : 0;
  // connected components (4-neighbour)
  const lab = new Int32Array(m.length); const sizes: number[] = [0]; const stack: number[] = [];
  for (let i = 0; i < m.length; i++) {
    if (!m[i] || lab[i]) continue;
    const id = sizes.length; let size = 0; stack.push(i); lab[i] = id;
    while (stack.length) {
      const j = stack.pop()!; size++;
      const x = j % w, y = (j / w) | 0;
      const nb = [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, y > 0 ? j - w : -1, y < h - 1 ? j + w : -1];
      for (const k of nb) if (k >= 0 && m[k] && !lab[k]) { lab[k] = id; stack.push(k); }
    }
    sizes.push(size);
  }
  const max = Math.max(0, ...sizes);
  const out = new Uint8ClampedArray(bin.length);
  for (let i = 0; i < m.length; i++) if (lab[i] && sizes[lab[i]] >= max * minFrac) out[i] = 255;
  return out;
}

/** Soft model output -> clean binary mask that follows photo edges. */
export function refineMask(soft: Uint8ClampedArray, L: Float32Array, w: number, h: number): Uint8ClampedArray {
  const p = new Float32Array(soft.length);
  for (let i = 0; i < p.length; i++) p[i] = soft[i] / 255;
  const r = Math.max(4, Math.round(Math.max(w, h) / 120));
  const q = guidedFilter(L, p, w, h, r, 0.002);
  const bin = new Uint8ClampedArray(soft.length);
  for (let i = 0; i < q.length; i++) bin[i] = q[i] > 0.42 ? 255 : 0;
  return cleanMask(bin, w, h, Math.max(2, Math.round(Math.max(w, h) / 300)));
}

/**
 * Lighting map: low-frequency floor luminance (masked blur, so walls/baseboards
 * don't bleed in) divided by the floor's mean. Fine detail of the old floor
 * (grain, joints) is blurred away so it doesn't show through. Encoded as v/2.
 */
export function shadingMap(L: Float32Array, mask: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const n = w * h, m = new Float32Array(n), Lm = new Float32Array(n);
  let sum = 0, cnt = 0;
  for (let i = 0; i < n; i++) { m[i] = mask[i] > 127 ? 1 : 0; Lm[i] = L[i] * m[i]; if (m[i]) { sum += L[i]; cnt++; } }
  const mean = cnt ? sum / cnt : 0.5;
  const r = Math.max(6, Math.round(Math.max(w, h) / 45));
  let bL = boxBlurF(Lm, w, h, r), bm = boxBlurF(m, w, h, r);
  bL = boxBlurF(bL, w, h, r); bm = boxBlurF(bm, w, h, r);
  const out = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++) {
    const v = bm[i] > 0.02 ? bL[i] / bm[i] / Math.max(mean, 0.02) : 1;
    out[i] = Math.round(Math.min(1.9, Math.max(0.3, v)) * 127.5);
  }
  return out;
}
