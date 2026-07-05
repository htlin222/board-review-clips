export const theme = {
  colors: { bg: "#EAE6DE", ink: "#111111", marker: "#111111", answerBg: "#FFDD57" },
  fonts: {
    family: "Noto Sans, sans-serif",
    titleSize: 72,
    titleWeight: 800,
    shortsTitleSize: 44,
    answerSize: 56,
    detailSize: 48,
    headerSize: 24,
  },
  layout: { headerMargin: 56 },
  timing: { revealDurationMs: 400, detailGapMs: 300, endFadeFrames: 30 },
  camera: {
    baseZoomStart: 1.0,
    baseZoomEnd: 1.06,
    switchPushPct: 0.075,
    switchPushFrames: 6,
    switchRampInFrames: 9,
  },
  marker: { boilFps: 10, boilJitterPx: 1.5, strokeWidth: 3 },
  boil: { boilFps: 10, jitterPx: 0.8 },
  breathe: { hz: 0.4, amount: 0.012 },
  grid: { size: 40, color: "rgba(17,17,17,0.08)" },
  progress: { wipeFrames: 5, dotSize: 10, dotGap: 8, dotColorActive: "#111111", dotColorInactive: "rgba(17,17,17,0.18)" },
  tts: { voice: "en-US-AvaNeural", rate: "+0%" },
  sfx: { begin: "sfx/Tink.m4a", click: "sfx/Pop.m4a" },
  // w=900: maxZoom = baseZoomEnd(1.06) + switchPushPct(0.075) = 1.135;
  // theoretical max safe width = 1080/1.135 ≈ 951.5px; 900 leaves ~5.4% margin below that.
  safeZone: { shorts: { w: 900, h: 1350 } },
  fps: 30,
} as const;
