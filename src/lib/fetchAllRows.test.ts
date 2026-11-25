/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { fetchAllRows } from "./fetchAllRows";

describe("fetchAllRows", () => {
  test("include le timbrature più recenti oltre la prima pagina da 1.000 record", async () => {
    const rows = Array.from({ length: 1002 }, (_, index) => ({ id: index + 1 }));
    const ranges: Array<[number, number]> = [];
    const query = {
      range: async (from: number, to: number) => {
        ranges.push([from, to]);
        return { data: rows.slice(from, to + 1), error: null };
      },
    };

    const result = await fetchAllRows<(typeof rows)[number]>(query);

    assert.equal(result.length, 1002);
    assert.equal(result.at(-1)?.id, 1002);
    assert.deepEqual(ranges, [[0, 999], [1000, 1999]]);
  });
});
