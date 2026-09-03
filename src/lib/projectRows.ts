const PROJECT_ROW_CYCLE = [1, 2, 3, 2] as const;

/**
 * Splits a project count into full-width rows following the repeating
 * 1, 2, 3, 2 rhythm. The final remainder always fills its own row.
 */
export function getProjectRowSizes(projectCount: number): number[] {
  if (!Number.isFinite(projectCount) || projectCount <= 0) return [];

  let remaining = Math.floor(projectCount);
  let cycleIndex = 0;
  const rows: number[] = [];

  while (remaining > 0) {
    const nextSize = PROJECT_ROW_CYCLE[cycleIndex % PROJECT_ROW_CYCLE.length]!;

    if (remaining < nextSize) {
      rows.push(remaining);
      break;
    }

    rows.push(nextSize);
    remaining -= nextSize;
    cycleIndex += 1;
  }

  const lastIndex = rows.length - 1;
  if (lastIndex > 0 && rows[lastIndex] === 1 && rows[lastIndex - 1] === 1) {
    rows.splice(lastIndex - 1, 2, 2);
  }

  return rows;
}