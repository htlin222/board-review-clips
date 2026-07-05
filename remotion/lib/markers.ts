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
