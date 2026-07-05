import type { WordTiming } from "./types";

export function activeWordIndex(words: WordTiming[], currentMs: number): number {
  if (words.length === 0) return -1;
  if (currentMs < words[0].startMs) return -1;

  let result = 0;
  for (let i = 0; i < words.length; i++) {
    if (words[i].startMs <= currentMs) {
      result = i;
    } else {
      break;
    }
  }
  return result;
}
