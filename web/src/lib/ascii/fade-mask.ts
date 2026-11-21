import type { Grid, Rect } from "./types"

export const MASK_FLOOR = 0.22
export const MASK_START = 8
export const MASK_RANGE = 56

const REACH = MASK_START + MASK_RANGE

export function buildFadeMask(grid: Grid, rects: Rect[], out?: Float32Array): Float32Array {
  const { cols, rows, cellW, cellH } = grid
  const mask = out && out.length === cols * rows ? out : new Float32Array(cols * rows)
  mask.fill(1)

  // Only cells within REACH of a rect can be dimmed; the mask is monotone in
  // distance, so the min over rects equals the value at the nearest rect.
  for (const r of rects) {
    const c0 = Math.max(0, Math.ceil((r.left - REACH) / cellW - 0.5))
    const c1 = Math.min(cols - 1, Math.floor((r.right + REACH) / cellW - 0.5))
    const r0 = Math.max(0, Math.ceil((r.top - REACH) / cellH - 0.5))
    const r1 = Math.min(rows - 1, Math.floor((r.bottom + REACH) / cellH - 0.5))
    for (let row = r0; row <= r1; row++) {
      const y = (row + 0.5) * cellH
      const dy = Math.max(r.top - y, 0, y - r.bottom)
      for (let col = c0; col <= c1; col++) {
        const x = (col + 0.5) * cellW
        const dx = Math.max(r.left - x, 0, x - r.right)
        const d = Math.sqrt(dx * dx + dy * dy)
        const k = Math.min(Math.max((d - MASK_START) / MASK_RANGE, 0), 1)
        const v = MASK_FLOOR + (1 - MASK_FLOOR) * (k * k * (3 - 2 * k))
        const i = row * cols + col
        if (v < mask[i]) mask[i] = v
      }
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
