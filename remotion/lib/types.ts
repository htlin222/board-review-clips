export type Card = {
  id: string;
  main: string;
  section: string;
  topic: string;
  author: string;
  title: string;
  answer: string;
  detail: string[];
  releaseNote: string;
};

export type WordTiming = {
  word: string;
  startMs: number;
  endMs: number;
  marked?: boolean;
};

export type SegmentTiming = {
  key: string; // "title" | "answer" | "detail-0" | "detail-1" ...
  text: string;
  audioPath: string;
  durationMs: number;
  words: WordTiming[];
};

export type CardTiming = {
  cardId: string;
  main: string;
  section: string;
  topic: string;
  author: string;
  segments: SegmentTiming[];
};
