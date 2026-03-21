export const BASIS_POINTS = 10_000;

export function percentOf(amount: number, bps: number) {
  return (amount * bps) / BASIS_POINTS;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
