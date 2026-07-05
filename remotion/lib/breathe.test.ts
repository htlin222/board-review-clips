import { describe, it, expect } from "vitest";
import { breatheScale } from "./breathe";
import { theme } from "../theme";

describe("breatheScale", () => {
  it("is 1 at frame 0", () => {
    expect(breatheScale(0, theme)).toBeCloseTo(1);
  });

  it("stays within the configured amount around 1", () => {
    const samples = Array.from({ length: theme.fps * 10 }, (_, f) => breatheScale(f, theme));
    const max = Math.max(...samples);
    const min = Math.min(...samples);
    expect(max).toBeLessThanOrEqual(1 + theme.breathe.amount + 1e-9);
    expect(min).toBeGreaterThanOrEqual(1 - theme.breathe.amount - 1e-9);
  });
});
