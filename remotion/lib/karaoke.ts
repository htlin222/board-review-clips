import type { WordTiming } from "./types";

export function activeWordIndex(words: WordTiming[], currentMs: number): number {
  if (words.length === 0) return -1;
  if (currentMs < words[0].startMs) return -1;
  if (currentMs >= words[words.length - 1].endMs) return words.length - 1;

  for (let i = 0; i < words.length; i++) {
    if (currentMs >= words[i].startMs && currentMs < words[i].endMs) return i;
  }
  return words.length - 1;
}
