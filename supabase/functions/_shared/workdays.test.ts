import { describe, expect, test } from "bun:test";
import { addWorkingDays, easterSunday, greeting, isWorkingDay, remainingSlots } from "./workdays";

describe("working days", () => {
  test("Easter 2027 is March 28, Easter Monday is a holiday", () => {
    expect(easterSunday(2027)).toBe("2027-03-28");
    expect(isWorkingDay("2027-03-29")).toBe(false);
  });
  test("weekends and 8 December are not working days", () => {
    expect(isWorkingDay("2026-10-24")).toBe(false);
    expect(isWorkingDay("2026-12-08")).toBe(false);
    expect(isWorkingDay("2026-10-21")).toBe(true);
  });
  test("follow-up 10 working days after Wed 21 Oct 2026 is Wed 4 Nov (skips 1 Nov Sunday)", () => {
    expect(addWorkingDays("2026-10-21", 10)).toBe("2026-11-04");
  });
  test("10 working days across Christmas skip 25 and 26 Dec", () => {
    expect(addWorkingDays("2026-12-21", 10)).toBe("2027-01-05");
  });
});

describe("daily limit 50", () => {
  test("follow-ups count inside the 50", () => {
    expect(remainingSlots(50, 0, 12)).toEqual({ followUps: 12, firstEmails: 38 });
    expect(remainingSlots(50, 50, 5)).toEqual({ followUps: 0, firstEmails: 0 });
    expect(remainingSlots(50, 0, 80)).toEqual({ followUps: 50, firstEmails: 0 });
  });
  test("greeting", () => {
    expect(greeting("Mario")).toBe("Buongiorno Mario,");
    expect(greeting("")).toBe("Buongiorno,");
  });
});
