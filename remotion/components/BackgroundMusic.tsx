import { Html5Audio as Audio, staticFile } from "remotion";
import { theme } from "../theme";
import { musicVolume } from "../lib/musicVolume";

// Music bed that plays under the whole card: quiet during the narration, then
// swells and fades out over the music tail once the voice-over ends.
export function BackgroundMusic({ narrationEndFrame, totalFrames }: { narrationEndFrame: number; totalFrames: number }) {
  const fadeInFrames = Math.round((theme.music.fadeInMs / 1000) * theme.fps);
  const swellFrames = Math.round((theme.music.swellMs / 1000) * theme.fps);

  return (
    <Audio
      src={staticFile(theme.music.src)}
      loop
      volume={(frame) =>
        musicVolume(frame, {
          narrationEndFrame,
          totalFrames,
          low: theme.music.low,
          high: theme.music.high,
          fadeInFrames,
          swellFrames,
        })
      }
    />
  );
}
