import { random } from "remotion";
import { theme } from "../theme";

export function MarkerText({
  text,
  marked,
  frame,
  fontSize,
  drawProgress = 1,
}: {
  text: string;
  marked?: boolean;
  frame: number;
  fontSize: number;
  drawProgress?: number;
}) {
  const boilFrame = Math.floor((frame / theme.fps) * theme.marker.boilFps);
  const height = fontSize * 1.2;
  const { segments, wobblePx, sagPx, overshootPct, strokeWidth } = theme.marker;

  // Hand-drawn underline: a wobbly polyline that sags slightly in the middle,
  // overshoots both ends, and jitters frame-to-frame like a felt-tip stroke.
  const points = Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments;
    const overshoot = i === 0 ? -overshootPct : i === segments ? overshootPct : 0;
    const wobble = (random(`marker-${text}-${boilFrame}-${i}`) - 0.5) * 2 * wobblePx;
    const bow = Math.sin(Math.PI * t) * sagPx;
    return { xPct: t * 100 + overshoot, y: height + bow + wobble };
  });

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontSize,
        color: theme.colors.ink,
        height,
      }}
    >
      {text}
      {marked && drawProgress > 0 && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height,
            pointerEvents: "none",
            overflow: "visible",
            clipPath: `inset(-50% ${(1 - drawProgress) * 100}% -50% -50%)`,
          }}
        >
          {points.slice(1).map((p, i) => {
            const a = points[i];
            return (
              <line
                key={i}
                x1={`${a.xPct}%`}
                y1={a.y}
                x2={`${p.xPct}%`}
                y2={p.y}
                stroke={theme.colors.marker}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}
    </span>
  );
}
