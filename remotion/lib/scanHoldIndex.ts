export function scanHoldIndex<T extends { startMs: number }>(
  items: T[],
  currentMs: number,
  beforeFirst: number
): number {
  // Deliberately ignores endMs: holding on an item until the NEXT item's
  // startMs is what makes "stay on the current item during a gap" work.
  // Switching this to check endMs reintroduces the gap bug this function
  // was extracted to fix once and for all (see karaoke.ts / captions.ts history).
  if (items.length === 0) return -1;
  if (currentMs < items[0].startMs) return beforeFirst;

  let result = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].startMs <= currentMs) {
      result = i;
    } else {
      break;
    }
  }
  return result;
}
