export const theme = {
  colors: { bg: "#FFFFFF", ink: "#111111", skeleton: "#E5E5E5", marker: "#111111" },
  fonts: {
    family: "Noto Sans, Noto Sans TC, sans-serif",
    titleSize: 64,
    bodySize: 44,
    headerSize: 24,
  },
  timing: { revealDurationMs: 400, detailGapMs: 300 },
  camera: {
    baseZoomStart: 1.0,
    baseZoomEnd: 1.06,
    switchPushPct: 0.04,
    switchPushFrames: 10,
  },
  marker: { boilFps: 10, boilJitterPx: 1.5, strokeWidth: 3 },
  tts: { voice: "zh-TW-HsiaoChenNeural", rate: "+0%" },
  sfx: { begin: "sfx/Tink.m4a", click: "sfx/Pop.m4a", end: "sfx/Glass.m4a" },
  safeZone: { shorts: { w: 1080, h: 1350 } },
  fps: 30,
} as const;
