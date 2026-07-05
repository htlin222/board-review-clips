import type { WordTiming } from "./types";

export type Marker = { start: number; end: number };
export type ParsedMarkers = { plainText: string; markers: Marker[] };

export function parseMarkers(input: string): ParsedMarkers {
  const pattern = /\*\*(.+?)\*\*/g;
  let plainText = "";
  const markers: Marker[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    plainText += input.slice(lastIndex, match.index);
    const start = plainText.length;
    plainText += match[1];
    markers.push({ start, end: plainText.length });
    lastIndex = match.index + match[0].length;
  }
  plainText += input.slice(lastIndex);

  return { plainText, markers };
}

export function attachWordMarkers(words: WordTiming[], plainText: string, markers: Marker[]): WordTiming[] {
  let cursor = 0;
  return words.map((w) => {
    const start = plainText.indexOf(w.word, cursor);
    if (start === -1) {
      return { ...w, marked: false };
    }
    const end = start + w.word.length;
    cursor = end;
    const marked = markers.some((m) => start < m.end && end > m.start);
    return { ...w, marked };
  });
}
