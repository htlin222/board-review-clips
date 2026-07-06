import { theme } from "../theme";

// Static paper-stock texture under the content: low-frequency turbulence with a
// fixed seed (unlike the boiling GrainOverlay), multiply-blended so the mottle
// reads as fiber in the paper rather than video noise.
export function PaperTexture() {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: theme.paper.opacity,
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }}
    >
      <filter id="paper-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={4} seed={theme.paper.seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-texture)" />
    </svg>
  );
}
