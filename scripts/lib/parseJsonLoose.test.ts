import { describe, it, expect } from "vitest";
import { parseJsonLoose } from "../issue-to-cards";

describe("parseJsonLoose", () => {
  it("parses clean JSON (Groq json_object mode)", () => {
    expect(parseJsonLoose('{"a":1,"b":2}')).toEqual({ a: 1, b: 2 });
  });

  it("strips ```json fences (Cloudflare Workers AI)", () => {
    expect(parseJsonLoose('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("recovers the object from surrounding prose", () => {
    expect(parseJsonLoose('Sure! Here you go:\n{"cards":[{"id":"x"}]}\nHope that helps.')).toEqual({
      cards: [{ id: "x" }],
    });
  });

  it("throws with a helpful message when there is no JSON", () => {
    expect(() => parseJsonLoose("no json here")).toThrow(/Could not parse JSON/);
  });
});
