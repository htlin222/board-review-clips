import { describe, it, expect } from "vitest";
import { parseMarkers, attachWordMarkers } from "./markers";
import type { Marker } from "./markers";

describe("parseMarkers", () => {
  it("extracts a single marked range and strips the ** syntax", () => {
    const result = parseMarkers("Elevated hemoglobin F levels are associated with **improved outcomes**.");
    expect(result.plainText).toBe("Elevated hemoglobin F levels are associated with improved outcomes.");
    expect(result.markers).toEqual([{ start: 49, end: 66 }]);
    expect(result.plainText.slice(result.markers[0].start, result.markers[0].end)).toBe("improved outcomes");
  });

  it("supports multiple markers in one string", () => {
    const result = parseMarkers("**alpha** and **beta**");
    expect(result.plainText).toBe("alpha and beta");
    expect(result.markers).toHaveLength(2);
    expect(result.plainText.slice(result.markers[0].start, result.markers[0].end)).toBe("alpha");
    expect(result.plainText.slice(result.markers[1].start, result.markers[1].end)).toBe("beta");
  });

  it("treats unclosed ** as literal text with no marker", () => {
    const result = parseMarkers("this is **broken");
    expect(result.plainText).toBe("this is **broken");
    expect(result.markers).toEqual([]);
  });

  it("returns no markers for plain text", () => {
    const result = parseMarkers("no markers here");
    expect(result.plainText).toBe("no markers here");
    expect(result.markers).toEqual([]);
  });
});

describe("attachWordMarkers", () => {
  it("marks all words that fall within a marker range spanning multiple words", () => {
    const plainText = "improved outcomes";
    const markers: Marker[] = [{ start: 0, end: 18 }];
    const words = [
      { word: "improved", startMs: 0, endMs: 100 },
      { word: "outcomes", startMs: 100, endMs: 200 },
    ];
    const result = attachWordMarkers(words, plainText, markers);
    expect(result[0].marked).toBe(true);
    expect(result[1].marked).toBe(true);
  });

  it("does not mark words when there are no markers", () => {
    const plainText = "hello world";
    const words = [
      { word: "hello", startMs: 0, endMs: 100 },
      { word: "world", startMs: 100, endMs: 200 },
    ];
    const result = attachWordMarkers(words, plainText, []);
    expect(result.every((w) => w.marked === false)).toBe(true);
  });

  it("only marks words overlapping a marker that doesn't span the whole text", () => {
    const plainText = "the improved outcome overall";
    const markers: Marker[] = [{ start: 4, end: 20 }]; // "improved outcome"
    const words = [
      { word: "the", startMs: 0, endMs: 50 },
      { word: "improved", startMs: 50, endMs: 100 },
      { word: "outcome", startMs: 100, endMs: 150 },
      { word: "overall", startMs: 150, endMs: 200 },
    ];
    const result = attachWordMarkers(words, plainText, markers);
    expect(result.map((w) => w.marked)).toEqual([false, true, true, false]);
  });

  it("marks false and does not crash if a word cannot be found in plainText", () => {
    const result = attachWordMarkers(
      [{ word: "missing", startMs: 0, endMs: 100 }],
      "totally different text",
      [{ start: 0, end: 5 }]
    );
    expect(result[0].marked).toBe(false);
  });
});
