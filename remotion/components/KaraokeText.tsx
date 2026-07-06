import { theme } from "../theme";
import { activeWordIndex } from "../lib/karaoke";
import { boilJitter } from "../lib/boil";
import { MarkerText } from "./MarkerText";
import type { WordTiming } from "../lib/types";

export function KaraokeText({
  words,
  currentMs,
  frame,
  fontSize,
  bold = false,
  boil = false,
  fontFamily = theme.fonts.family,
}: {
  words: WordTiming[];
  currentMs: number;
  frame: number;
  fontSize: number;
  bold?: boolean;
  boil?: boolean;
  fontFamily?: string;
}) {
  const active = activeWordIndex(words, currentMs);

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight: bold ? theme.fonts.titleWeight : undefined,
        color: theme.colors.ink,
        lineHeight: 1.4,
        textAlign: "left",
      }}
    >
      {words.map((w, i) => {
        const j = boil ? boilJitter(w.word, i, frame, theme) : null;
        const drawProgress = Math.max(0, Math.min(1, (currentMs - w.startMs) / theme.marker.drawMs));
        return (
          <span
            key={i}
            style={{
              opacity: i <= active ? 1 : 0.35,
              marginRight: "0.3em",
              display: "inline-block",
              transform: j ? `translate(${j.x}px, ${j.y}px)` : undefined,
            }}
          >
            <MarkerText text={w.word} marked={w.marked} frame={frame} fontSize={fontSize} drawProgress={drawProgress} />
          </span>
        );
      })}
    </div>
  );
}
