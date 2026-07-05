import { describe, it, expect } from "vitest";
import { parseMarkers } from "./markers";

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
