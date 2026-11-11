/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { applyHomography, computeHomography, invert3 } from "./homography";
import { estimateQuad, DEFAULT_QUAD } from "./quadEstimate";

describe("homography", () => {
  const src = [{ x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
  const dst = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }];
  const H = computeHomography(src, dst);
  test("maps corners onto corners", () => {
    src.forEach((p, i) => {
      const q = applyHomography(H, p);
      assert.ok(Math.abs((q.x) - (dst[i].x)) < 1e-6);
      assert.ok(Math.abs((q.y) - (dst[i].y)) < 1e-6);
    });
  });
  test("inverse round-trips", () => {
    const q = applyHomography(invert3(H), applyHomography(H, { x: 0.5, y: 0.8 }));
    assert.ok(Math.abs((q.x) - (0.5)) < 1e-6);
    assert.ok(Math.abs((q.y) - (0.8)) < 1e-6);
  });
});

describe("estimateQuad", () => {
  test("recovers a synthetic trapezoid within 2px (before 10% shrink)", () => {
    const w = 200, h = 100, m = new Uint8Array(w * h);
    // floor from y=40..99, left edge 60->0, right edge 140->199
    for (let y = 40; y < h; y++) {
      const t = (y - 40) / 59;
      const l = Math.round(60 * (1 - t)), r = Math.round(140 + 59 * t);
      for (let x = l; x <= r; x++) m[y * w + x] = 255;
    }
    const q = estimateQuad(m, w, h);
    // undo shrink: centre ~ (100, ~70)
    const cx = 100, cy = (q[0].y * h + q[2].y * h) / 2;
    const un = (p: { x: number; y: number }) => ({ x: cx + (p.x * w - cx) / 0.9, y: cy + (p.y * h - cy) / 0.9 });
    const bl = un(q[3]), br = un(q[2]);
    assert.ok((Math.abs(bl.x - 0)) < 2);
    assert.ok((Math.abs(br.x - 199)) < 2);
    assert.ok((Math.abs(br.y - 99)) < 2);
  });
  test("empty mask falls back to default", () => {
    assert.deepEqual(estimateQuad(new Uint8Array(100), 10, 10), DEFAULT_QUAD);
  });
});

import { metricHomography } from "./homography";
import { parseFormatCm } from "./floorRegistry";
describe("metricHomography", () => {
  test("recovers real floor distances for a tilted camera at 1.4 m", () => {
    const W = 1000, Hh = 750, fov = 65, camH = 1.4, tilt = (25 * Math.PI) / 180;
    const f = 500 / Math.tan((32.5 * Math.PI) / 180);
    // camera: x right, y down, z forward; floor at y = +camH in world, camera pitched down by tilt
    const proj = (X: number, Z: number) => {
      const y = camH, z = Z;
      const yc = y * Math.cos(tilt) - z * Math.sin(tilt), zc = y * Math.sin(tilt) + z * Math.cos(tilt);
      return { x: (f * X / zc + W / 2) / W, y: (f * yc / zc + Hh / 2) / Hh };
    };
    const quad = [proj(-1, 5), proj(1, 5), proj(1, 2), proj(-1, 2)];
    const H = metricHomography(quad, W, Hh, camH, fov)!;
    assert.ok(H);
    const a = applyHomography(H, proj(-1, 2)), b = applyHomography(H, proj(1, 2)), c = applyHomography(H, proj(-1, 5));
    assert.ok(Math.abs(Math.hypot(a.x - b.x, a.y - b.y) - 2) < 0.02, "width 2 m");
    assert.ok(Math.abs(Math.hypot(a.x - c.x, a.y - c.y) - 3) < 0.02, "depth 3 m");
  });
});
describe("parseFormatCm", () => {
  test("reads plank format in cm", () => {
    assert.deepEqual(parseFormatCm(["1829×228 mm", "Spessore 6 mm"]), [22.8, 182.9]);
    assert.deepEqual(parseFormatCm(["228,6×1524 mm"]), [22.86, 152.4]);
  });
});

import { levelQuad } from "./quadEstimate";
describe("levelQuad", () => {
  test("is symmetric so planks run straight into the room", () => {
    const w = 100, h = 100, m = new Uint8Array(w * h);
    for (let y = 60; y < h; y++) for (let x = 0; x < 70; x++) m[y * w + x] = 255; // off-centre floor
    const q = levelQuad(m, w, h);
    assert.ok(Math.abs(q[0].x + q[1].x - 1) < 1e-9);
    assert.ok(Math.abs(q[3].x + q[2].x - 1) < 1e-9);
    assert.ok(q[1].x - q[0].x < q[2].x - q[3].x);
  });
});
