import { describe, expect, it } from "vitest"

import { buildFadeMask, findOpenPoint } from "../../src/lib/ascii/fade-mask"
import type { Grid } from "../../src/lib/ascii/types"

const grid: Grid = { cols: 10, rows: 4, cellW: 10, cellH: 10, width: 100, height: 40 }
const rects = [{ left: 0, top: 0, right: 20, bottom: 40 }]

describe("buildFadeMask", () => {
  it("is 0.22 inside and within 8px of a block", () => {
    const mask = buildFadeMask(grid, rects)

    expect(mask[0]).toBeCloseTo(0.22, 5)
    expect(mask[2]).toBeCloseTo(0.22, 5)
  })

  it("reaches 1 at 64px or more away", () => {
    const mask = buildFadeMask(grid, rects)

    expect(mask[9]).toBe(1)
  })

  it("rises monotonically between", () => {
    const mask = buildFadeMask(grid, rects)

    for (let col = 3; col < 8; col++) {
      expect(mask[col + 1]).toBeGreaterThanOrEqual(mask[col])
    }
  })

  it("is 1 everywhere with no blocks", () => {
    const mask = buildFadeMask(grid, [])

    expect(mask).toHaveLength(40)
    expect(Array.from(mask).every((v) => v === 1)).toBe(true)
  })
})

describe("findOpenPoint", () => {
  it("picks the brightest cell on the row, leftmost on ties", () => {
    const mask = buildFadeMask(grid, rects)

    expect(findOpenPoint(grid, mask, 2)).toEqual({ x: 85, y: 25 })
  })
})
