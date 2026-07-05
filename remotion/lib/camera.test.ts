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

  it("is 0 well before the ramp-in window starts", () => {
    expect(pushBump(100 - theme.camera.switchRampInFrames - 1, 100, theme)).toBe(0);
  });

  it("is 0 well after the decay window ends", () => {
    expect(pushBump(100 + theme.camera.switchPushFrames + 1, 100, theme)).toBe(0);
  });

  it("accelerates into the switch instead of ramping linearly", () => {
    const { switchRampInFrames } = theme.camera;
    const early = pushBump(100 - Math.round(switchRampInFrames * 0.75), 100, theme);
    const mid = pushBump(100 - Math.round(switchRampInFrames * 0.5), 100, theme);
    const late = pushBump(100 - Math.round(switchRampInFrames * 0.25), 100, theme);
    // ease-in cubic: the gain per equal time-step grows as we approach the switch
    expect(late - mid).toBeGreaterThan(mid - early);
  });
});
