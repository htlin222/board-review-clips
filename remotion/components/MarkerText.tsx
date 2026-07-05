import { random } from "remotion";
import { theme } from "../theme";
import { parseMarkers } from "../lib/markers";

export function MarkerText({ text, frame, fontSize }: { text: string; frame: number; fontSize: number }) {
  const { plainText, markers } = parseMarkers(text);
  const boilFrame = Math.floor((frame / 30) * theme.marker.boilFps);

  return (
    <span style={{ position: "relative", fontFamily: theme.fonts.family, fontSize, color: theme.colors.ink }}>
      {plainText}
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {markers.map((m, i) => {
          const jitter = (seed: number) =>
            (random(`marker-${i}-${boilFrame}-${seed}`) - 0.5) * 2 * theme.marker.boilJitterPx;
          // Approximate horizontal position by character fraction; refine visually once real text renders.
          const startFrac = m.start / plainText.length;
          const endFrac = m.end / plainText.length;
          return (
            <line
              key={i}
              x1={`${startFrac * 100 + jitter(1)}%`}
              x2={`${endFrac * 100 + jitter(2)}%`}
              y1={`${100 + jitter(3)}%`}
              y2={`${100 + jitter(4)}%`}
              stroke={theme.colors.marker}
              strokeWidth={theme.marker.strokeWidth}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </span>
  );
}
