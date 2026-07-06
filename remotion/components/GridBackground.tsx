import { random, useVideoConfig } from "remotion";
import { theme } from "../theme";

export function GridBackground() {
  const { width, height } = useVideoConfig();
  const { size, color, dotColor, dotMinRadius, dotMaxRadius, dotChance } = theme.grid;
  const cols = Math.floor(width / size) + 1;
  const rows = Math.floor(height / size) + 1;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    >
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: cols }).map((_, i) =>
          Array.from({ length: rows }).map((_, j) => {
            if (random(`grid-dot-show-${i}-${j}`) > dotChance) return null;
            const r = dotMinRadius + random(`grid-dot-${i}-${j}`) * (dotMaxRadius - dotMinRadius);
            return <circle key={`${i}-${j}`} cx={i * size} cy={j * size} r={r} fill={dotColor} />;
          })
        )}
      </svg>
    </div>
  );
}
