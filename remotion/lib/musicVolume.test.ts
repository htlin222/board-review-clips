import { describe, expect, it } from "vitest";
import { musicVolume, type MusicEnvelope } from "./musicVolume";

const env: MusicEnvelope = {
  narrationEndFrame: 100,
  totalFrames: 220,
  low: 0.12,
  high: 0.34,
  fadeInFrames: 15,
  swellFrames: 15,
};

describe("musicVolume", () => {
  it("starts silent and fades in to the quiet bed", () => {
    expect(musicVolume(0, env)).toBe(0);
    expect(musicVolume(15, env)).toBeCloseTo(0.12, 5);
    expect(musicVolume(7, env)).toBeGreaterThan(0);
    expect(musicVolume(7, env)).toBeLessThan(0.12);
  });

  it("holds the quiet bed under the narration", () => {
    expect(musicVolume(40, env)).toBe(0.12);
    expect(musicVolume(100, env)).toBe(0.12);
  });

  it("swells up to the peak after the narration ends", () => {
    expect(musicVolume(107, env)).toBeGreaterThan(0.12);
    expect(musicVolume(107, env)).toBeLessThan(0.34);
    expect(musicVolume(115, env)).toBeCloseTo(0.34, 5);
  });

  it("fades gradually from the peak to silence at the end", () => {
    expect(musicVolume(115, env)).toBeCloseTo(0.34, 5);
    expect(musicVolume(220, env)).toBeCloseTo(0, 5);
    const mid = musicVolume(167, env); // halfway through the fade
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(0.34);
  });

  it("never exceeds the peak or drops below zero", () => {
    for (let f = 0; f <= env.totalFrames; f++) {
      const v = musicVolume(f, env);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(env.high + 1e-9);
    }
  });
});
