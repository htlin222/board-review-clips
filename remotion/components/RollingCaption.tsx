import { theme } from "../theme";
import { chunkWords, activeChunkIndex } from "../lib/captions";
import { activeWordIndex } from "../lib/karaoke";
import { MarkerText } from "./MarkerText";
import type { WordTiming } from "../lib/types";

export function RollingCaption({
  words,
  currentMs,
  frame,
  fontSize,
  maxWordsPerChunk = 14,
}: {
  words: WordTiming[];
  currentMs: number;
  frame: number;
  fontSize: number;
  maxWordsPerChunk?: number;
}) {
  const chunks = chunkWords(words, maxWordsPerChunk);
  const activeChunk = chunks[activeChunkIndex(chunks, currentMs)];
  if (!activeChunk) return null;

  const active = activeWordIndex(activeChunk.words, currentMs);
  return (
    <div
      style={{
        fontFamily: theme.fonts.family,
        fontSize,
        color: theme.colors.ink,
        textAlign: "center",
        lineHeight: 1.5,
      }}
    >
      {activeChunk.words.map((w, i) => (
        <span key={i} style={{ opacity: i <= active ? 1 : 0.35, marginRight: "0.3em" }}>
          <MarkerText text={w.word} marked={w.marked} frame={frame} fontSize={fontSize} />
        </span>
      ))}
    </div>
  );
}
