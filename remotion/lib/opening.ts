import { interpolate } from "remotion";
import type { theme as themeType } from "../theme";
import { easeOutCubic } from "./easing";

type Theme = typeof themeType;

// Whole-view intro: zoom in from startScale to 1 while the "focus" hunts
// (blur spikes, overshoots, then settles to 0) — like a camera autofocus.
export function openingEffect(frame: number, theme: Theme): { scale: number; blurPx: number } {
  const { settleFrames, startScale, maxBlur } = theme.opening;
  const scale = interpolate(frame, [0, settleFrames], [startScale, 1], {
    easing: easeOutCubic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blurPx = interpolate(
    frame,
    [0, settleFrames * 0.25, settleFrames * 0.5, settleFrames * 0.75, settleFrames],
    [maxBlur, maxBlur * 0.2, maxBlur * 0.55, maxBlur * 0.1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return { scale, blurPx };
}
