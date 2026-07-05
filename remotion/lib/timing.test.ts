import { describe, it, expect } from "vitest";
import { ticksToMs, parseWordTimings } from "./timing";

describe("ticksToMs", () => {
  it("converts 100-nanosecond ticks to milliseconds", () => {
    expect(ticksToMs(10_000_000)).toBe(1000);
    expect(ticksToMs(35_875_000)).toBe(3587.5);
    expect(ticksToMs(0)).toBe(0);
  });
});

describe("parseWordTimings", () => {
  it("extracts only WordBoundary entries and converts to ms", () => {
    const raw = {
      Metadata: [
        {
          Type: "WordBoundary",
          Data: { Offset: 1_000_000, Duration: 500_000, text: { Text: "Hi", BoundaryType: "WordBoundary" } },
        },
        {
          Type: "SentenceBoundary",
          Data: { Offset: 0, Duration: 10_000_000, text: { Text: "Hi, how are you?", BoundaryType: "SentenceBoundary" } },
        },
        {
          Type: "WordBoundary",
          Data: { Offset: 1_600_000, Duration: 400_000, text: { Text: "how", BoundaryType: "WordBoundary" } },
        },
      ],
    };

    const words = parseWordTimings(raw);

    expect(words).toEqual([
      { word: "Hi", startMs: 100, endMs: 150 },
      { word: "how", startMs: 160, endMs: 200 },
    ]);
  });

  it("returns an empty array when there are no word boundaries", () => {
    expect(parseWordTimings({ Metadata: [] })).toEqual([]);
  });
});
