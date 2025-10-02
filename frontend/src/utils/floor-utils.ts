/**
 * Formats a floor number into a human-readable label
 * @param floor - The floor number (can be negative for basements)
 * @returns Formatted floor label (e.g., "G" for 0, "B1" for -1, "5" for 5)
 */
export function formatFloorLabel(floor: number): string {
  if (floor === 0) return 'G';
  if (floor > 0) return `${floor}`;
  return `B${Math.abs(floor)}`;
}

