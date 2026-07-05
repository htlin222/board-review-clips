import { Composition } from "remotion";
import { readFileSync } from "fs";
import { join } from "path";
import { LongForm } from "./compositions/LongForm";
import { Shorts } from "./compositions/Shorts";
import { buildTimeline } from "./lib/useCardTimeline";
import { theme } from "./theme";
import type { Card, CardTiming } from "./lib/types";

function loadCard(cardId: string): Card {
  return JSON.parse(readFileSync(join("cards", `${cardId}.json`), "utf-8"));
}

function loadTiming(cardId: string): CardTiming {
  return JSON.parse(readFileSync(join("remotion/audio", cardId, "timing.json"), "utf-8"));
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LongForm"
        component={LongForm}
        width={1920}
        height={1080}
        fps={theme.fps}
        durationInFrames={150}
        defaultProps={{ cardId: "scd-median-survival" }}
        calculateMetadata={async ({ props }) => {
          const card = loadCard(props.cardId);
          const timing = loadTiming(props.cardId);
          const { totalFrames } = buildTimeline(timing);
          return { durationInFrames: totalFrames, props: { ...props, timing, topic: card.topic, author: card.author } };
        }}
      />
      <Composition
        id="Shorts"
        component={Shorts}
        width={1080}
        height={1920}
        fps={theme.fps}
        durationInFrames={150}
        defaultProps={{ cardId: "scd-median-survival" }}
        calculateMetadata={async ({ props }) => {
          const card = loadCard(props.cardId);
          const timing = loadTiming(props.cardId);
          const { totalFrames } = buildTimeline(timing);
          return { durationInFrames: totalFrames, props: { ...props, timing, topic: card.topic, author: card.author } };
        }}
      />
    </>
  );
};
