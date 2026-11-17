/// <reference types="node" />
import { describe, test } from "node:test";
import { deepStrictEqual as eq, strictEqual as is } from "node:assert";
import { siteWorkerDays } from "./timesheetSiteCosts";
const w = [{ worker_id: "a", site_id: "S", start_date: "2026-11-02", end_date: "2026-11-06" }];
describe("siteWorkerDays", () => {
  test("timbratura senza cantiere conta se l'operaio è assegnato quel giorno", () => {
    const m = siteWorkerDays("S", [{ worker_id: "a", event_date: "2026-11-03", site_id: null, event_type: "arrive_site" }], w);
    eq([...m.get("2026-11-03")!], ["a"]);
  });
  test("fuori dal periodo di assegnazione non conta", () => {
    is(siteWorkerDays("S", [{ worker_id: "a", event_date: "2026-11-09", site_id: null, event_type: "arrive_site" }], w).size, 0);
  });
  test("timbratura su altro cantiere non conta", () => {
    is(siteWorkerDays("S", [{ worker_id: "a", event_date: "2026-11-03", site_id: "X", event_type: "arrive_site" }], w).size, 0);
  });
  test("due timbrature stesso giorno = un operaio", () => {
    const m = siteWorkerDays("S", ["arrive_site", "leave_site"].map((t) => ({ worker_id: "a", event_date: "2026-11-03", site_id: "S", event_type: t })), []);
    is(m.get("2026-11-03")!.size, 1);
  });
});
