/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { paginateQuotePdf } from "./quotePdfPagination";

const lines = (from: number, count: number, lineHeight = 20, gap = 8) =>
  Array.from({ length: count }, (_, index) => {
    const top = from + index * (lineHeight + gap);
    return { top, bottom: top + lineHeight };
  });

describe("impaginazione PDF preventivo", () => {
  test("una riga che attraversa il fondo pagina inizia intera nella pagina successiva", () => {
    const textLines = [{ top: 285, bottom: 305 }];
    const slices = paginateQuotePdf({
      totalHeight: 600,
      firstPageHeight: 300,
      followingPageHeight: 280,
      blocks: textLines,
    });

    assert.equal(slices[0][1], 283);
    assert.equal(slices[1][0], 283);
    assert.ok(slices[0][1] <= textLines[0].top - 2);
    assert.ok(slices[1][1] >= textLines[0].bottom + 2);
  });

  test("nessuna riga dei termini lunghi viene mai tagliata tra due pagine", () => {
    const textLines = lines(40, 80);
    const slices = paginateQuotePdf({
      totalHeight: 2300,
      firstPageHeight: 300,
      followingPageHeight: 280,
      blocks: [
        { top: 40, bottom: 2250 }, // contenitore più alto di una pagina
        ...textLines,
      ],
    });

    for (const [, end] of slices.slice(0, -1)) {
      for (const line of textLines) {
        assert.equal(
          line.top < end && line.bottom > end,
          false,
          `riga ${line.top}-${line.bottom} tagliata a ${end}`,
        );
      }
    }
  });

  test("il riquadro di accettazione resta intero quando entra in una pagina", () => {
    const slices = paginateQuotePdf({
      totalHeight: 900,
      firstPageHeight: 300,
      followingPageHeight: 280,
      blocks: [{ top: 250, bottom: 460 }],
    });

    assert.equal(slices[0][1], 248);
    assert.equal(slices[1][0], 248);
    assert.ok(slices[1][1] >= 460);
  });

  test("le pagine successive rispettano l’altezza ridotta per il margine superiore", () => {
    const slices = paginateQuotePdf({
      totalHeight: 1000,
      firstPageHeight: 300,
      followingPageHeight: 260,
      blocks: [],
    });

    assert.deepEqual(slices, [[0, 300], [300, 560], [560, 820], [820, 1000]]);
  });
});
