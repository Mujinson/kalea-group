/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import {
  isPublicTenderQuote,
  isStandardPagamenti,
  publicTenderPagamenti,
  resolveQuoteAcceptance,
  resolveQuoteTerms,
  shouldPrefillSalPagamenti,
} from "./publicTenderQuote";
import { PUBLIC_TENDER_TERMS } from "../data/quotePublicTenderTerms";

const line = (name: string) => ({ id: name, name, quantity: 1, unit_price: 0, unit: "a corpo", discount_pct: 0 });
const STD = [
  { label: "Acconto", pct: 30 },
  { label: "A metà lavori", pct: 40 },
  { label: "Saldo finale", pct: 30 },
];

describe("voci Servizi B (appalti pubblici)", () => {
  test("il preventivo è a regime appalto solo con almeno una voce Servizi B", () => {
    assert.equal(isPublicTenderQuote([]), false);
    assert.equal(isPublicTenderQuote(undefined), false);
    assert.equal(isPublicTenderQuote([line("Posa in opera")]), true);
  });

  test("con le voci Servizi B i termini stampati sono le condizioni per appalti pubblici", () => {
    const t = resolveQuoteTerms({
      serviziB: [line("Posa in opera")],
      terminiCustom: null,
      standardTerms: "TESTO STANDARD",
    });
    assert.equal(t, PUBLIC_TENDER_TERMS);
    assert.ok(t.includes("Art. 1 – Oggetto dell'offerta"));
    assert.ok(t.includes("Art. 18 – Trattamento dei dati personali"));
    assert.ok(!t.includes("**"), "il testo stampato non deve contenere markup markdown");
  });

  test("senza voci Servizi B restano i termini standard, e la modifica a mano vince sempre", () => {
    assert.equal(
      resolveQuoteTerms({ serviziB: [], terminiCustom: null, standardTerms: "TESTO STANDARD" }),
      "TESTO STANDARD",
    );
    assert.equal(
      resolveQuoteTerms({ serviziB: [line("Posa")], terminiCustom: "MIO TESTO", standardTerms: "TESTO STANDARD" }),
      "MIO TESTO",
    );
  });

  test("la riga di accettazione richiama gli artt. 5, 8, 13 e 17 solo in regime appalto", () => {
    assert.match(resolveQuoteAcceptance([line("Posa")], "standard"), /Artt\. 5, 8, 13 e 17/);
    assert.equal(resolveQuoteAcceptance([], "standard"), "standard");
  });

  test("le rate SAL precompilate sono 30/25/25/20 e sommano 100%", () => {
    const pg = publicTenderPagamenti();
    assert.deepEqual(pg.map((p) => p.pct), [30, 25, 25, 20]);
    assert.equal(pg.reduce((s, p) => s + p.pct, 0), 100);
    assert.deepEqual(pg.map((p) => p.label), [
      "Anticipazione iniziale",
      "Primo SAL",
      "Secondo SAL",
      "SAL finale",
    ]);
  });

  test("le rate SAL si inseriscono solo alla prima voce Servizi B e solo sul piano standard", () => {
    assert.equal(shouldPrefillSalPagamenti([], [line("Posa")], STD), true);
    // seconda voce: non si tocca nulla
    assert.equal(shouldPrefillSalPagamenti([line("Posa")], [line("Posa"), line("SAL")], STD), false);
    // piano rate già personalizzato dall'utente: mai sovrascritto
    assert.equal(
      shouldPrefillSalPagamenti([], [line("Posa")], [{ label: "Acconto", pct: 50 }, { label: "Saldo", pct: 50 }]),
      false,
    );
    // preventivo recuperato dal database (già in regime appalto): non si tocca nulla
    assert.equal(shouldPrefillSalPagamenti([line("Posa")], [line("Posa")], STD), false);
  });

  test("il piano rate standard è riconosciuto solo se identico", () => {
    assert.equal(isStandardPagamenti(STD), true);
    assert.equal(isStandardPagamenti(publicTenderPagamenti()), false);
    assert.equal(isStandardPagamenti(STD.slice(0, 2)), false);
    assert.equal(isStandardPagamenti(undefined), false);
  });
});
