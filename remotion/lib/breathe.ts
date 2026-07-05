import type { theme as themeType } from "../theme";

type Theme = typeof themeType;

export function breatheScale(frame: number, theme: Theme): number {
  const t = frame / theme.fps;
  return 1 + Math.sin(2 * Math.PI * theme.breathe.hz * t) * theme.breathe.amount;
}
