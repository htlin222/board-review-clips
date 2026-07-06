import { random } from "remotion";
import type { theme as themeType } from "../theme";

type Theme = typeof themeType;

// Resolve a target string character-by-character (left to right). Before a
// character position resolves, show a flickering random glyph from the charset.
export function scrambleText(text: string, localFrame: number, theme: Theme): string {
  const { durationFrames, charset } = theme.scramble;
  if (localFrame >= durationFrames) return text;

  const chars = [...text];
  return chars
    .map((ch, i) => {
      if (ch === " ") return " ";
      const resolveAt = ((i + 1) / chars.length) * durationFrames;
      if (localFrame >= resolveAt) return ch;
      const idx = Math.floor(random(`scramble-${i}-${Math.floor(localFrame)}`) * charset.length);
      return charset[idx];
    })
    .join("");
}
