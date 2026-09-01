import { describe, expect, it } from "vitest";

import { getProjectRowSizes } from "@/lib/projectRows";

describe("getProjectRowSizes", () => {
  const expected: Record<number, number[]> = {
    0: [],
    1: [1],
    2: [2],
    3: [1, 2],
    4: [1, 2, 1],
    5: [1, 2, 2],
    6: [1, 2, 3],
    7: [1, 2, 3, 1],
    8: [1, 2, 3, 2],
    9: [1, 2, 3, 2, 1],
    10: [1, 2, 3, 2, 2],
    11: [1, 2, 3, 2, 1, 2],
    12: [1, 2, 3, 2, 1, 2, 1],
  };

  for (const [count, rows] of Object.entries(expected)) {
    it(`returns ${rows.join(", ") || "an empty array"} for ${count} projects`, () => {
      expect(getProjectRowSizes(Number(count))).toEqual(rows);
    });
  }

  it("preserves every project and valid row constraints for larger counts", () => {
    for (let count = 13; count <= 100; count += 1) {
      const rows = getProjectRowSizes(count);

      expect(rows.reduce((total, size) => total + size, 0)).toBe(count);
      expect(rows.every((size) => size >= 1 && size <= 3)).toBe(true);
      expect(rows.some((size, index) => size === 1 && rows[index + 1] === 1)).toBe(false);
    }
  });

  it("returns an empty array for non-positive or non-finite counts", () => {
    expect(getProjectRowSizes(-3)).toEqual([]);
    expect(getProjectRowSizes(Number.NaN)).toEqual([]);
    expect(getProjectRowSizes(Number.POSITIVE_INFINITY)).toEqual([]);
  });
});