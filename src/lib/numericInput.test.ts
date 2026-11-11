/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { clearZeroOnFocus } from "./numericInput";

function input(type: string, value: string) {
  return { currentTarget: { type, value } as HTMLInputElement };
}

describe("clearZeroOnFocus", () => {
  test("clears zero so the next typed number replaces it", () => {
    const event = input("number", "0");
    clearZeroOnFocus(event);
    assert.equal(event.currentTarget.value, "");
  });

  test("also clears equivalent zero formats", () => {
    for (const value of ["0.00", "-0"]) {
      const event = input("number", value);
      clearZeroOnFocus(event);
      assert.equal(event.currentTarget.value, "");
    }
  });

  test("does not erase non-zero values", () => {
    const event = input("number", "12.50");
    clearZeroOnFocus(event);
    assert.equal(event.currentTarget.value, "12.50");
  });

  test("leaves empty and non-numeric inputs unchanged", () => {
    for (const [type, value] of [["number", ""], ["text", "0"]]) {
      const event = input(type, value);
      clearZeroOnFocus(event);
      assert.equal(event.currentTarget.value, value);
    }
  });
});
