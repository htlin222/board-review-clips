import { random } from "remotion";
import { theme } from "../theme";

export function MarkerText({
  text,
  marked,
  frame,
  fontSize,
}: {
  text: string;
  marked?: boolean;
  frame: number;
  fontSize: number;
}) {
  const boilFrame = Math.floor((frame / theme.fps) * theme.marker.boilFps);
  const height = fontSize * 1.2;

  const jitter = (seed: number) =>
    (random(`marker-${text}-${boilFrame}-${seed}`) - 0.5) * 2 * theme.marker.boilJitterPx;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: theme.fonts.family,
        fontSize,
        color: theme.colors.ink,
        height,
      }}
    >
      {text}
      {marked && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height, pointerEvents: "none", overflow: "visible" }}
        >
          <line
            x1={`${0 + jitter(1)}%`}
            x2={`${100 + jitter(2)}%`}
            y1={height + jitter(3)}
            y2={height + jitter(4)}
            stroke={theme.colors.marker}
            strokeWidth={theme.marker.strokeWidth}
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}
