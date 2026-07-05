import { theme } from "../theme";
import { activeWordIndex } from "../lib/karaoke";
import { MarkerText } from "./MarkerText";
import type { WordTiming } from "../lib/types";

export function KaraokeText({
  words,
  currentMs,
  frame,
  fontSize,
}: {
  words: WordTiming[];
  currentMs: number;
  frame: number;
  fontSize: number;
}) {
  const active = activeWordIndex(words, currentMs);
  return (
    <div style={{ fontFamily: theme.fonts.family, fontSize, color: theme.colors.ink, lineHeight: 1.4 }}>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i <= active ? 1 : 0.35, marginRight: "0.3em" }}>
          <MarkerText text={w.word} frame={frame} fontSize={fontSize} />
        </span>
      ))}
    </div>
  );
}
