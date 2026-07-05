import { theme } from "../theme";
import { activeWordIndex } from "../lib/karaoke";
import { breatheScale } from "../lib/breathe";
import { boilJitter } from "../lib/boil";
import { MarkerText } from "./MarkerText";
import type { WordTiming } from "../lib/types";

export function KaraokeText({
  words,
  currentMs,
  frame,
  fontSize,
  variant = "breathe",
  bold = false,
}: {
  words: WordTiming[];
  currentMs: number;
  frame: number;
  fontSize: number;
  variant?: "boil" | "breathe";
  bold?: boolean;
}) {
  const active = activeWordIndex(words, currentMs);
  const scale = variant === "breathe" ? breatheScale(frame, theme) : 1;

  return (
    <div
      style={{
        fontFamily: theme.fonts.family,
        fontSize,
        fontWeight: bold ? theme.fonts.titleWeight : undefined,
        color: theme.colors.ink,
        lineHeight: 1.4,
        textAlign: "left",
        transform: `scale(${scale})`,
      }}
    >
      {words.map((w, i) => {
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
