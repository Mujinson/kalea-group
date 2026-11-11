import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSupplierText } from "./supplierParse";

const woodco = `Woodco Soc. Coop.
Via Antonio Detassis, 17 - TRENTO (TN)
P.IVA/C.F.: 00600920227
Tel. 0461/405111
Cassa di Risparmio di Bolzano SpA IT 75 R 06045 34930 0000 0000 2600
Banca per il Trentino Alto Adige IT 32 U 08304 01819 0000 0830 6747`;

test("Woodco: name, VAT, fiscal code, address, phone", () => {
  const r = parseSupplierText(woodco);
  assert.equal(r.name, "Woodco Soc. Coop.");
  assert.equal(r.vat_number, "00600920227");
  assert.equal(r.fiscal_code, "00600920227");
  assert.equal(r.address, "Via Antonio Detassis, 17");
  assert.equal(r.city, "Trento");
  assert.equal(r.province, "TN");
  assert.equal(r.phone, "0461 405111");
});

test("Woodco: two IBANs with their bank", () => {
  const r = parseSupplierText(woodco);
  assert.deepEqual(r.bank_accounts, [
    { bank: "Cassa di Risparmio di Bolzano SpA", iban: "IT75R0604534930000000002600" },
    { bank: "Banca per il Trentino Alto Adige", iban: "IT32U0830401819000008306747" },
  ]);
});
