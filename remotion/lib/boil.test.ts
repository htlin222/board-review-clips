import { describe, it, expect } from "vitest";
import { boilJitter } from "./boil";
import { theme } from "../theme";

describe("boilJitter", () => {
  it("stays within the configured jitter amount", () => {
    for (let f = 0; f < 60; f++) {
      const { x, y } = boilJitter("word", 0, f, theme);
      expect(Math.abs(x)).toBeLessThanOrEqual(theme.boil.jitterPx);
      expect(Math.abs(y)).toBeLessThanOrEqual(theme.boil.jitterPx);
    }
  });

  it("is deterministic for the same inputs", () => {
    expect(boilJitter("word", 2, 10, theme)).toEqual(boilJitter("word", 2, 10, theme));
  });

  it("changes between boil buckets", () => {
    const a = boilJitter("word", 0, 0, theme);
    const b = boilJitter("word", 0, 29, theme);
    expect(a).not.toEqual(b);
  });
});
