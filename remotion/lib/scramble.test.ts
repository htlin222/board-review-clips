import { describe, it, expect } from "vitest";
import { scrambleText } from "./scramble";
import { theme } from "../theme";

describe("scrambleText", () => {
  it("returns the exact text once the duration has elapsed", () => {
    expect(scrambleText("Your Name", theme.scramble.durationFrames, theme)).toBe("Your Name");
  });

  it("preserves spaces and length while scrambling", () => {
    const out = scrambleText("Your Name", 2, theme);
    expect(out).toHaveLength("Your Name".length);
    expect(out[4]).toBe(" ");
  });

  it("resolves earlier characters before later ones", () => {
    const mid = Math.floor(theme.scramble.durationFrames * 0.5);
    const out = scrambleText("ABCDEFGH", mid, theme);
    // first char should already be resolved at the halfway point
    expect(out[0]).toBe("A");
  });

  it("is deterministic for the same frame", () => {
    expect(scrambleText("Your Name", 3, theme)).toBe(scrambleText("Your Name", 3, theme));
  });
});
