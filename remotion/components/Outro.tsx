import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/RobotoSlab";
import { theme } from "../theme";
import { scrambleText } from "../lib/scramble";
import { GrainOverlay } from "./GrainOverlay";

// Heavy slab serif for the end-card name reveal.
const { fontFamily } = loadFont("normal", { weights: ["900"] });

// End card over the music tail: the author name scrambles in from random glyphs,
// centered and oversized, then holds while the music fades out.
export function Outro({
  author,
  startFrame,
  totalFrames,
  fontSize,
}: {
  author: string;
  startFrame: number;
  totalFrames: number;
  fontSize: number;
}) {
  const frame = useCurrentFrame();
  if (!author || frame < startFrame) return null;

  const inFrames = Math.round((theme.outro.inMs / 1000) * theme.fps);
  const fadeIn = interpolate(frame, [startFrame, startFrame + inFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [totalFrames - theme.timing.endFadeFrames, totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const text = scrambleText(author, frame - startFrame, theme);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeIn * fadeOut }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize,
          color: theme.colors.ink,
          textAlign: "center",
          letterSpacing: "-0.015em",
          lineHeight: 1.05,
          maxWidth: "82%",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
      <GrainOverlay frame={frame} id="grain-outro" opacity={theme.outro.grainOpacity} />
    </AbsoluteFill>
  );
}
