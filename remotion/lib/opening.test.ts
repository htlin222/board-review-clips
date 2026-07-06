import { describe, it, expect } from "vitest";
import { closingEffect, openingEffect } from "./opening";
import { theme } from "../theme";

describe("openingEffect", () => {
  it("starts zoomed in and blurred", () => {
    const { scale, blurPx } = openingEffect(0, theme);
    expect(scale).toBeCloseTo(theme.opening.startScale);
    expect(blurPx).toBeCloseTo(theme.opening.maxBlur);
  });

  it("settles to no zoom and no blur by settleFrames", () => {
    const { scale, blurPx } = openingEffect(theme.opening.settleFrames, theme);
    expect(scale).toBeCloseTo(1);
    expect(blurPx).toBeCloseTo(0);
  });

  it("stays settled after the intro", () => {
    const { scale, blurPx } = openingEffect(theme.opening.settleFrames + 30, theme);
    expect(scale).toBeCloseTo(1);
    expect(blurPx).toBeCloseTo(0);
  });

  it("keeps blur non-negative and within the configured max", () => {
    for (let f = 0; f <= theme.opening.settleFrames; f++) {
      const { blurPx } = openingEffect(f, theme);
      expect(blurPx).toBeGreaterThanOrEqual(0);
      expect(blurPx).toBeLessThanOrEqual(theme.opening.maxBlur + 1e-9);
    }
  });
});

describe("closingEffect", () => {
  const totalFrames = 300;
  const fadeStart = totalFrames - theme.timing.endFadeFrames;

  it("stays settled before the end fade begins", () => {
    const { scale, blurPx } = closingEffect(fadeStart - 30, totalFrames, theme);
    expect(scale).toBeCloseTo(1);
    expect(blurPx).toBeCloseTo(0);
  });

  it("is sharp and unscaled at the start of the end fade", () => {
    const { scale, blurPx } = closingEffect(fadeStart, totalFrames, theme);
    expect(scale).toBeCloseTo(1);
    expect(blurPx).toBeCloseTo(0);
  });

  it("ends zoomed out and fully blurred at the last frame", () => {
    const { scale, blurPx } = closingEffect(totalFrames, totalFrames, theme);
    expect(scale).toBeCloseTo(theme.opening.startScale);
    expect(blurPx).toBeCloseTo(theme.opening.maxBlur);
  });

  it("keeps blur non-negative and within the configured max across the fade", () => {
    for (let f = fadeStart; f <= totalFrames; f++) {
      const { blurPx } = closingEffect(f, totalFrames, theme);
      expect(blurPx).toBeGreaterThanOrEqual(0);
      expect(blurPx).toBeLessThanOrEqual(theme.opening.maxBlur + 1e-9);
    }
  });
});
