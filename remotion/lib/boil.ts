import { random } from "remotion";
import type { theme as themeType } from "../theme";

type Theme = typeof themeType;

export function boilJitter(word: string, index: number, frame: number, theme: Theme): { x: number; y: number } {
  const boilFrame = Math.floor((frame / theme.fps) * theme.boil.boilFps);
  const x = (random(`boil-x-${word}-${index}-${boilFrame}`) - 0.5) * 2 * theme.boil.jitterPx;
  const y = (random(`boil-y-${word}-${index}-${boilFrame}`) - 0.5) * 2 * theme.boil.jitterPx;
  return { x, y };
}
