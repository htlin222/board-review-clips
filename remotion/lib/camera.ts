import { interpolate } from "remotion";
import type { theme as themeType } from "../theme";

type Theme = typeof themeType;

export function baseZoom(frame: number, totalFrames: number, theme: Theme): number {
  return interpolate(frame, [0, totalFrames], [theme.camera.baseZoomStart, theme.camera.baseZoomEnd], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function pushBump(frame: number, switchFrame: number, theme: Theme): number {
  const t = frame - switchFrame;
  if (t < 0 || t > theme.camera.switchPushFrames) return 0;
  return interpolate(t, [0, theme.camera.switchPushFrames], [theme.camera.switchPushPct, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}
