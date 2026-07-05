import { describe, it, expect } from "vitest";
import { ticksToMs } from "./timing";

describe("ticksToMs", () => {
  it("converts 100-nanosecond ticks to milliseconds", () => {
    expect(ticksToMs(10_000_000)).toBe(1000);
    expect(ticksToMs(35_875_000)).toBe(3587.5);
    expect(ticksToMs(0)).toBe(0);
  });
});
