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
