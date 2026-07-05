import type { WordTiming } from "./types";
import { scanHoldIndex } from "./scanHoldIndex";

export function activeWordIndex(words: WordTiming[], currentMs: number): number {
  return scanHoldIndex(words, currentMs, -1);
}
