import { interpolate } from "remotion";
import type { theme as themeType } from "../theme";

type Theme = typeof themeType;

const easeInCubic = (x: number) => x * x * x;
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

export function baseZoom(frame: number, totalFrames: number, theme: Theme): number {
  return interpolate(frame, [0, totalFrames], [theme.camera.baseZoomStart, theme.camera.baseZoomEnd], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function pushBump(frame: number, switchFrame: number, theme: Theme): number {
  const t = frame - switchFrame;
  const { switchPushPct, switchPushFrames, switchRampInFrames } = theme.camera;
  if (t < -switchRampInFrames || t > switchPushFrames) return 0;

  if (t <= 0) {
    return interpolate(t, [-switchRampInFrames, 0], [0, switchPushPct], {
      easing: easeInCubic,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return interpolate(t, [0, switchPushFrames], [switchPushPct, 0], {
    easing: easeOutCubic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}
