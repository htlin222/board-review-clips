import { describe, it, expect } from "vitest";
import { chunkWords, activeChunkIndex } from "./captions";
import type { WordTiming } from "./types";

function makeWords(n: number): WordTiming[] {
  return Array.from({ length: n }, (_, i) => ({
    word: `w${i}`,
    startMs: i * 100,
    endMs: i * 100 + 90,
  }));
}

describe("chunkWords", () => {
  it("groups words into chunks no larger than maxWordsPerChunk", () => {
    const chunks = chunkWords(makeWords(30), 14);
    expect(chunks.length).toBe(3);
    expect(chunks[0].words).toHaveLength(14);
    expect(chunks[2].words).toHaveLength(2);
  });

  it("sets chunk startMs/endMs from its first/last word", () => {
    const chunks = chunkWords(makeWords(5), 14);
    expect(chunks[0].startMs).toBe(0);
    expect(chunks[0].endMs).toBe(490);
  });

  it("returns an empty array for no words", () => {
    expect(chunkWords([], 14)).toEqual([]);
  });

  it("handles fewer words than one chunk", () => {
    const chunks = chunkWords(makeWords(3), 14);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].words).toHaveLength(3);
  });

  it("handles a single word", () => {
    const chunks = chunkWords(makeWords(1), 14);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].words).toHaveLength(1);
  });
});

describe("activeChunkIndex", () => {
  it("returns the chunk containing currentMs", () => {
    const chunks = chunkWords(makeWords(30), 14);
    // chunk 0: words 0-13 (startMs 0, endMs 1390), chunk 1: words 14-27 (startMs 1400, endMs 2790),
    // chunk 2: words 28-29 (startMs 2800, endMs 2990)
    expect(activeChunkIndex(chunks, 50)).toBe(0);
  });

  it("holds the previous chunk during a gap between chunks", () => {
    const chunks = [
      { words: [], startMs: 0, endMs: 1000 },
      { words: [], startMs: 1500, endMs: 2500 },
    ];
    expect(activeChunkIndex(chunks, 1200)).toBe(0);
  });

  it("returns 0 before the first chunk starts (leading silence)", () => {
    const chunks = [{ words: [], startMs: 500, endMs: 1000 }];
    expect(activeChunkIndex(chunks, 100)).toBe(0);
  });

  it("returns the last chunk once time is past the end", () => {
    const chunks = chunkWords(makeWords(30), 14);
    expect(activeChunkIndex(chunks, 999_999)).toBe(chunks.length - 1);
  });

  it("returns -1 for no chunks", () => {
    expect(activeChunkIndex([], 100)).toBe(-1);
  });
});
