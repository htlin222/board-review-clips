import { theme } from "../theme";

export function GrainOverlay({
  frame,
  opacity = theme.grain.opacity,
  id = "grain-filter",
  radius,
}: {
  frame: number;
  opacity?: number;
  id?: string;
  radius?: number;
}) {
  const seed = frame % 100;
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        borderRadius: radius,
      }}
    >
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
