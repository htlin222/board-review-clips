import { describe, it, expect } from "vitest";
import { activeWordIndex } from "./karaoke";
import type { WordTiming } from "./types";

const words: WordTiming[] = [
  { word: "Hi", startMs: 0, endMs: 100 },
  { word: "how", startMs: 100, endMs: 250 },
  { word: "are", startMs: 250, endMs: 400 },
];

describe("activeWordIndex", () => {
  it("returns the index of the word containing currentMs", () => {
    expect(activeWordIndex(words, 50)).toBe(0);
    expect(activeWordIndex(words, 150)).toBe(1);
  });

  it("returns -1 before the first word starts", () => {
    expect(activeWordIndex(words, -10)).toBe(-1);
  });

  it("returns the last word's index once time is past the end", () => {
    expect(activeWordIndex(words, 10_000)).toBe(2);
  });

  it("returns -1 for an empty word list", () => {
    expect(activeWordIndex([], 100)).toBe(-1);
  });

  it("stays on the previous word during a gap between words", () => {
    const gappy: WordTiming[] = [
      { word: "Hi", startMs: 0, endMs: 100 },
      { word: "how", startMs: 150, endMs: 250 },
    ];
    expect(activeWordIndex(gappy, 120)).toBe(0);
  });
});
