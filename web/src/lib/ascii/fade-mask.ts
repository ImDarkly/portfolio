import type { Grid, Rect } from "./types"

export const MASK_FLOOR = 0.22
export const MASK_START = 8
export const MASK_RANGE = 56

function distanceToRect(x: number, y: number, r: Rect): number {
  const dx = Math.max(r.left - x, 0, x - r.right)
  const dy = Math.max(r.top - y, 0, y - r.bottom)
  return Math.hypot(dx, dy)
}

export function buildFadeMask(grid: Grid, rects: Rect[]): Float32Array {
  const mask = new Float32Array(grid.cols * grid.rows)

  for (let row = 0; row < grid.rows; row++) {
    const y = (row + 0.5) * grid.cellH
    for (let col = 0; col < grid.cols; col++) {
      const x = (col + 0.5) * grid.cellW
      let d = Infinity
      for (const r of rects) d = Math.min(d, distanceToRect(x, y, r))

      const k = Math.min(Math.max((d - MASK_START) / MASK_RANGE, 0), 1)
      mask[row * grid.cols + col] = MASK_FLOOR + (1 - MASK_FLOOR) * (k * k * (3 - 2 * k))
    }
  }

  return mask
}

export function findOpenPoint(
  grid: Grid,
  mask: Float32Array,
  preferRow: number,
): { x: number; y: number } {
  const row = Math.min(Math.max(preferRow, 0), grid.rows - 1)
  let best = 0
  for (let col = 1; col < grid.cols; col++) {
    if (mask[row * grid.cols + col] > mask[row * grid.cols + best]) best = col
  }

  return { x: (best + 0.5) * grid.cellW, y: (row + 0.5) * grid.cellH }
}
