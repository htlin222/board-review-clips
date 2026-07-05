import { describe, it, expect } from "vitest";
import { baseZoom, pushBump } from "./camera";
import { theme } from "../theme";

describe("baseZoom", () => {
  it("starts at baseZoomStart and ends at baseZoomEnd", () => {
    expect(baseZoom(0, 300, theme)).toBeCloseTo(theme.camera.baseZoomStart);
    expect(baseZoom(300, 300, theme)).toBeCloseTo(theme.camera.baseZoomEnd);
  });

  it("is roughly linear at the midpoint", () => {
    const mid = baseZoom(150, 300, theme);
    expect(mid).toBeCloseTo((theme.camera.baseZoomStart + theme.camera.baseZoomEnd) / 2, 3);
  });
});

describe("pushBump", () => {
  it("is at its peak exactly at the switch frame", () => {
    expect(pushBump(100, 100, theme)).toBeCloseTo(theme.camera.switchPushPct);
  });

  it("decays to 0 by switchPushFrames after the switch", () => {
    expect(pushBump(100 + theme.camera.switchPushFrames, 100, theme)).toBeCloseTo(0);
  });

  it("is 0 before the switch frame", () => {
    expect(pushBump(50, 100, theme)).toBe(0);
  });
});
