import { Composition, staticFile } from "remotion";
import { LongForm } from "./compositions/LongForm";
import { Shorts } from "./compositions/Shorts";
import { buildTimeline } from "./lib/useCardTimeline";
import { theme } from "./theme";
import type { CardTiming } from "./lib/types";

async function loadTiming(cardId: string): Promise<CardTiming> {
  const response = await fetch(staticFile(`audio/${cardId}/timing.json`));
  return response.json();
}

const defaultTiming: CardTiming = { cardId: "", topic: "", author: "", segments: [] };

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
        defaultProps={{ cardId: "scd-median-survival", timing: defaultTiming, topic: "", author: "" }}
        calculateMetadata={async ({ props }) => {
          const timing = await loadTiming(props.cardId);
          const { totalFrames } = buildTimeline(timing);
          return { durationInFrames: totalFrames, props: { ...props, timing, topic: timing.topic, author: timing.author } };
        }}
      />
      <Composition
        id="Shorts"
        component={Shorts}
        width={1080}
        height={1920}
        fps={theme.fps}
        durationInFrames={150}
        defaultProps={{ cardId: "scd-median-survival", timing: defaultTiming, topic: "", author: "" }}
        calculateMetadata={async ({ props }) => {
          const timing = await loadTiming(props.cardId);
          const { totalFrames } = buildTimeline(timing);
          return { durationInFrames: totalFrames, props: { ...props, timing, topic: timing.topic, author: timing.author } };
        }}
      />
    </>
  );
};
