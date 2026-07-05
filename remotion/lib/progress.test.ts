import { describe, it, expect } from "vitest";
import { currentPhaseIndex } from "./progress";

const phases = [
  { key: "title", startFrame: 0, endFrame: 30 },
  { key: "answer", startFrame: 40, endFrame: 70 },
  { key: "detail-0", startFrame: 80, endFrame: 110 },
];

describe("currentPhaseIndex", () => {
  it("returns 0 at the start", () => {
    expect(currentPhaseIndex(phases, 0)).toBe(0);
  });

  it("advances once a later phase has started", () => {
    expect(currentPhaseIndex(phases, 45)).toBe(1);
  });

  it("stays on the last phase that started, even mid-gap", () => {
    expect(currentPhaseIndex(phases, 75)).toBe(1);
  });

  it("reaches the final index once the last phase starts", () => {
    expect(currentPhaseIndex(phases, 200)).toBe(2);
  });

  it("returns 0 for an empty phase list", () => {
    expect(currentPhaseIndex([], 10)).toBe(0);
  });
});
