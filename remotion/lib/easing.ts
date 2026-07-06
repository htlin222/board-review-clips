export const easeInCubic = (x: number) => x * x * x;
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
