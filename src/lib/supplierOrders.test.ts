/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { lineNet, nextOrderNumber, orderTotals } from "./supplierOrders";

describe("supplier orders", () => {
  test("line net applies discount", () => {
    assert.equal(lineNet({ description: "x", um: "MQ", qty: 45, price: 20, discount: 10 }), 810);
  });
  test("totals add VAT per line (default 22%)", () => {
    const t = orderTotals([{ description: "a", um: "MQ", qty: 10, price: 10 }, { description: "b", um: "N.", qty: 1, price: 100, vat: 10 }]);
    assert.deepEqual(t, { net: 200, vat: 32, total: 232 });
  });
  test("numbering continues per year", () => {
    assert.equal(nextOrderNumber(["ORD-2026-001", "ORD-2026-009", "ORD-2025-050"], 2026), "ORD-2026-010");
    assert.equal(nextOrderNumber([], 2027), "ORD-2027-001");
  });
});
