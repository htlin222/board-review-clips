import type { WordTiming } from "./types";

export type CaptionChunk = { words: WordTiming[]; startMs: number; endMs: number };

export function chunkWords(words: WordTiming[], maxWordsPerChunk = 14): CaptionChunk[] {
  const chunks: CaptionChunk[] = [];
  for (let i = 0; i < words.length; i += maxWordsPerChunk) {
    const slice = words.slice(i, i + maxWordsPerChunk);
    chunks.push({
      words: slice,
      startMs: slice[0].startMs,
      endMs: slice[slice.length - 1].endMs,
    });
  }
  return chunks;
}

export function activeChunkIndex(chunks: CaptionChunk[], currentMs: number): number {
  if (chunks.length === 0) return -1;

  let result = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].startMs <= currentMs) {
      result = i;
    } else {
      break;
    }
  }
  return result;
}
