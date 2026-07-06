// Volume envelope for the background-music bed, as a function of the composition
// frame. Four phases: fade in from silence, hold quietly under the narration,
// swell up once the voice-over ends, then fade gradually to silence by the end.

export type MusicEnvelope = {
  narrationEndFrame: number;
  totalFrames: number;
  low: number;
  high: number;
  fadeInFrames: number;
  swellFrames: number;
};

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

export function musicVolume(frame: number, env: MusicEnvelope): number {
  const { narrationEndFrame, totalFrames, low, high, fadeInFrames, swellFrames } = env;

  // Fade in from silence to the quiet bed.
  if (frame < fadeInFrames) return lerp(0, low, frame / Math.max(1, fadeInFrames));

  // Quiet bed under the narration.
  if (frame <= narrationEndFrame) return low;

  // Swell up over swellFrames once the voice-over ends.
  const peakFrame = narrationEndFrame + swellFrames;
  if (frame < peakFrame) return lerp(low, high, (frame - narrationEndFrame) / Math.max(1, swellFrames));

  // Gradual fade from the peak down to silence at the end.
  return lerp(high, 0, (frame - peakFrame) / Math.max(1, totalFrames - peakFrame));
}
