import { theme } from "../theme";
import { chunkWords, activeChunkIndex } from "../lib/captions";
import { activeWordIndex } from "../lib/karaoke";
import { breatheScale } from "../lib/breathe";
import { boilJitter } from "../lib/boil";
import { MarkerText } from "./MarkerText";
import type { WordTiming } from "../lib/types";

export function RollingCaption({
  words,
  currentMs,
  frame,
  fontSize,
  maxWordsPerChunk = 14,
  variant = "breathe",
}: {
  words: WordTiming[];
  currentMs: number;
  frame: number;
  fontSize: number;
  maxWordsPerChunk?: number;
  variant?: "boil" | "breathe";
}) {
  const chunks = chunkWords(words, maxWordsPerChunk);
  const activeChunk = chunks[activeChunkIndex(chunks, currentMs)];
  if (!activeChunk) return null;

  const active = activeWordIndex(activeChunk.words, currentMs);
  const scale = variant === "breathe" ? breatheScale(frame, theme) : 1;
  return (
    <div
      style={{
        fontFamily: theme.fonts.family,
        fontSize,
        color: theme.colors.ink,
        textAlign: "left",
        lineHeight: 1.5,
        transform: `scale(${scale})`,
      }}
    >
      {activeChunk.words.map((w, i) => {
        const jitter = variant === "boil" ? boilJitter(w.word, i, frame, theme) : null;
        return (
          <span
            key={i}
            style={{
              opacity: i <= active ? 1 : 0.35,
              marginRight: "0.3em",
              display: "inline-block",
              transform: jitter ? `translate(${jitter.x}px, ${jitter.y}px)` : undefined,
            }}
          >
            <MarkerText text={w.word} marked={w.marked} frame={frame} fontSize={fontSize} />
          </span>
        );
      })}
    </div>
  );
}
