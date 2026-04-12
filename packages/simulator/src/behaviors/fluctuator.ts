export function fluctuate(
  current: number,
  min: number,
  max: number,
  maxStep: number = 0.5
): number {
  const delta = (Math.random() * 2 - 1) * maxStep;
  const next = current + delta;
  return Math.min(max, Math.max(min, next));
}
