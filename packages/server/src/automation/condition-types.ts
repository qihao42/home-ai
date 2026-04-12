export function compareNumeric(
  value: number,
  above?: number,
  below?: number,
): boolean {
  if (above !== undefined && value <= above) {
    return false
  }
  if (below !== undefined && value >= below) {
    return false
  }
  return true
}

export function matchState(current: string, expected: string): boolean {
  return current === expected
}
