import { theme } from "../theme";

export function ProgressBar({
  current,
  total,
  frame,
  currentPhaseStart,
}: {
  current: number;
  total: number;
  frame: number;
  currentPhaseStart: number;
}) {
  const { wipeFrames, dotSize, dotGap, dotColorActive, dotColorInactive } = theme.progress;
  const wipeT = Math.max(0, Math.min(1, (frame - currentPhaseStart) / wipeFrames));

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: theme.fonts.family,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 20, color: theme.colors.ink, opacity: 0.55, fontVariantNumeric: "tabular-nums", letterSpacing: 1 }}>
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <div style={{ display: "flex", gap: dotGap, flexShrink: 0 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: dotColorInactive,
              overflow: "hidden",
            }}
          >
            {i === current && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: dotColorActive,
                  clipPath: `inset(0 ${(1 - wipeT) * 100}% 0 0)`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
