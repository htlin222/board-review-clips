import { AbsoluteFill } from "remotion";
import { theme } from "../theme";

// Soft documentary-style vignette: a faint darkening of the frame edges that
// pulls the eye to the center. Sits on top of everything as a lens trait.
export function Vignette() {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 48%, rgba(17,17,17,${theme.vignette.opacity}) 100%)`,
      }}
    />
  );
}
