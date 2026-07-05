import type { WordTiming } from "./types";

export function ticksToMs(ticks: number): number {
  return ticks / 10_000;
}

type MsEdgeMetadataItem = {
  Type: string;
  Data: { Offset: number; Duration: number; text: { Text: string } };
};

export function parseWordTimings(raw: { Metadata: MsEdgeMetadataItem[] }): WordTiming[] {
  return raw.Metadata.filter((m) => m.Type === "WordBoundary").map((m) => ({
    word: m.Data.text.Text,
    startMs: ticksToMs(m.Data.Offset),
    endMs: ticksToMs(m.Data.Offset + m.Data.Duration),
  }));
}
