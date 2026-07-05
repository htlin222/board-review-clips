import { describe, it, expect } from "vitest";
import { scanHoldIndex } from "./scanHoldIndex";

const items = [
  { startMs: 0 },
  { startMs: 100 },
  { startMs: 250 },
];

describe("scanHoldIndex", () => {
  it("returns the index of the most recently started item", () => {
    expect(scanHoldIndex(items, 50, -1)).toBe(0);
    expect(scanHoldIndex(items, 150, -1)).toBe(1);
  });

  it("holds the previous item during a gap (does not look at endMs)", () => {
    expect(scanHoldIndex(items, 249, -1)).toBe(1);
  });

  it("returns beforeFirst when currentMs is before the first item", () => {
    expect(scanHoldIndex(items, -10, -1)).toBe(-1);
    expect(scanHoldIndex(items, -10, 0)).toBe(0);
  });

  it("returns the last index once time is past the final item's start", () => {
    expect(scanHoldIndex(items, 10_000, -1)).toBe(2);
  });

  it("returns -1 for an empty list regardless of beforeFirst", () => {
    expect(scanHoldIndex([], 100, 0)).toBe(-1);
  });
});
