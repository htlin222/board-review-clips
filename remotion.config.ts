import { Config } from "@remotion/cli/config";

// Serve static assets (sfx, music, generated TTS audio) from assets/ instead of
// the default public/. Keep in sync with the publicDir passed to bundle() in
// scripts/render.ts and scripts/still.ts — bundle() does not read this file.
Config.setPublicDir("./assets");
