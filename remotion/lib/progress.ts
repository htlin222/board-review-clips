import type { PhaseFrame } from "./useCardTimeline";

export function currentPhaseIndex(phases: PhaseFrame[], frame: number): number {
  if (phases.length === 0) return 0;
  let idx = 0;
  for (let i = 0; i < phases.length; i++) {
    if (phases[i].startFrame <= frame) idx = i;
  }
  return idx;
}
