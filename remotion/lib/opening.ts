import { interpolate } from "remotion";
import type { theme as themeType } from "../theme";
import { easeInCubic, easeOutCubic } from "./easing";

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

// Whole-view outro: mirror of the opening — the view zooms back out to
// startScale while the focus is lost (blur hunts up to maxBlur) across the
// final end fade, bookending the intro's autofocus.
export function closingEffect(frame: number, totalFrames: number, theme: Theme): { scale: number; blurPx: number } {
  const { startScale, maxBlur } = theme.opening;
  const frames = theme.timing.endFadeFrames;
  const start = totalFrames - frames;
  const scale = interpolate(frame, [start, totalFrames], [1, startScale], {
    easing: easeInCubic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blurPx = interpolate(
    frame,
    [start, start + frames * 0.25, start + frames * 0.5, start + frames * 0.75, totalFrames],
    [0, maxBlur * 0.1, maxBlur * 0.55, maxBlur * 0.2, maxBlur],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return { scale, blurPx };
}
