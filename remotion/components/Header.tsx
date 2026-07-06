import { useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/LibreBaskerville";
import { theme } from "../theme";
import { easeInCubic } from "../lib/easing";
import { scrambleText } from "../lib/scramble";

const { fontFamily } = loadFont("italic", { weights: ["400"] });

const REVEAL_FRAMES = 18;

export function Header({
  main,
  section,
  topic,
  author,
  position,
  top,
  sideInset = theme.layout.headerMargin,
}: {
  main: string;
  section: string;
  topic: string;
  author?: string;
  position: "top" | "bottom";
  top?: number;
  sideInset?: number;
}) {
  const frame = useCurrentFrame();
  const breadcrumb = [main, section, topic].filter(Boolean).join(" · ");
  const revealT = interpolate(frame, [0, REVEAL_FRAMES], [0, 1], {
    easing: easeInCubic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        [position]: top ?? theme.layout.headerMargin,
        left: sideInset,
        right: sideInset,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontFamily,
        fontStyle: "italic",
        fontSize: theme.fonts.headerSize,
        color: theme.colors.header,
        opacity: 0.85,
      }}
    >
      <span style={{ clipPath: `inset(0 ${(1 - revealT) * 100}% 0 0)` }}>{breadcrumb}</span>
      {author && <span style={{ whiteSpace: "pre" }}>{scrambleText(author, frame, theme)}</span>}
    </div>
  );
}
