import { useCurrentFrame, interpolate } from "remotion";
import { theme } from "../theme";

export function Skeleton({ width, height }: { width: number; height: number }) {
  const frame = useCurrentFrame();
  const shimmer = interpolate(frame % 40, [0, 40], [-width, width]);
  return (
    <div style={{ width, height, background: theme.colors.skeleton, borderRadius: 12, overflow: "hidden", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: shimmer,
          width: width * 0.4,
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
        }}
      />
    </div>
  );
}
