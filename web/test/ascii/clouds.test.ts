import { describe, expect, it } from "vitest"

import { createNoise } from "../../src/lib/ascii/noise"
import createClouds from "../../src/lib/ascii/scenes/clouds"
import type { Grid, Pointer } from "../../src/lib/ascii/types"

function lcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const grid: Grid = { cols: 120, rows: 50, cellW: 10, cellH: 20, width: 1200, height: 1000 }
const T = 5000
const idle: Pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false }

function setup() {
  const scene = createClouds(lcg(7))
  scene.resize(grid)
  return scene
}

function findDenseCell(time: number) {
  const scene = setup()
  for (let row = grid.rows - 1; row >= 0; row--) {
    for (let col = 0; col < grid.cols; col++) {
      if (scene.density(col, row, time) > 0.3) return { col, row }
    }
  }
  throw new Error("no dense cell")
}

const centre = (col: number, row: number) => ({
  x: (col + 0.5) * grid.cellW,
  y: (row + 0.5) * grid.cellH,
})

describe("createNoise", () => {
  it("stays within 0..1", () => {
    const noise = createNoise(lcg(3))

    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const v = noise(x * 0.37, y * 0.51)
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe("createClouds", () => {
  it("scatters clouds over the whole page, with clear sky between", () => {
    const scene = setup()
    const covered = (rows: number[]) =>
      rows.flatMap((row) => Array.from({ length: grid.cols }, (_, col) => scene.density(col, row, T) > 0.1))

    for (const half of [[...Array(25).keys()], [...Array(25).keys()].map((r) => r + 25)]) {
      const share = covered(half).filter(Boolean).length / (25 * grid.cols)
      expect(share).toBeGreaterThan(0.05)
      expect(share).toBeLessThan(0.7)
    }
  })

  it("parts clouds where the pointer moved", () => {
    const { col, row } = findDenseCell(T)
    const scene = setup()
    const reference = createClouds(lcg(7))
    reference.resize(grid)
    const before = scene.density(col, row, T)
    const { x, y } = centre(col, row)

    scene.update(1, T, { x, y, vx: 5, vy: 0, inside: true })

    expect(scene.density(col, row, T + 10)).toBeLessThan(before * 0.3)
    const undisturbed = reference.density(col, row, T + 3000)
    expect(Math.abs(scene.density(col, row, T + 3000) - undisturbed)).toBeLessThanOrEqual(undisturbed * 0.05)
  })

  it("ignores a pointer that is outside or still", () => {
    const { col, row } = findDenseCell(T)
    const scene = setup()
    const before = scene.density(col, row, T)
    const { x, y } = centre(col, row)

    scene.update(1, T, { x, y, vx: 5, vy: 0, inside: false })
    scene.update(1, T, { x, y, vx: 0, vy: 0, inside: true })

    expect(scene.density(col, row, T)).toBe(before)
  })

  describe.each([["action"], ["demo"]] as const)("%s", (method) => {
    it("is a gust that clears a ring travelling outward", () => {
      const { col, row } = findDenseCell(T + 200)
      const scene = setup()
      const reference = createClouds(lcg(7))
      reference.resize(grid)
      const target = centre(col, row)
      // origin 76px left of the target cell
      scene[method](target.x - 76, target.y, T)

      const free = reference.density(col, row, T + 200)
      expect(scene.density(col, row, T + 200)).toBeLessThan(free * 0.5)

      const late = findDenseCell(T + 2000)
      const lateScene = setup()
      const lateRef = createClouds(lcg(7))
      lateRef.resize(grid)
      const lateTarget = centre(late.col, late.row)
      lateScene[method](lateTarget.x - 76, lateTarget.y, T)
      expect(lateScene.density(late.col, late.row, T + 2000)).toBe(lateRef.density(late.col, late.row, T + 2000))
    })
  })

  it("ignores a pointer that is barely drifting", () => {
    const { col, row } = findDenseCell(T)
    const scene = setup()
    const before = scene.density(col, row, T)
    const { x, y } = centre(col, row)

    scene.update(1, T, { x, y, vx: 0.3, vy: 0.3, inside: true })

    expect(scene.density(col, row, T)).toBe(before)
  })

  it("keeps at most 8 gusts, dropping the oldest", () => {
    const { col, row } = findDenseCell(T + 200)
    const target = centre(col, row)
    const scene = setup()
    const reference = createClouds(lcg(7))
    reference.resize(grid)

    // The oldest gust would clear the target cell; eight later ones are far away.
    scene.action(target.x - 76, target.y, T)
    for (let i = 0; i < 8; i++) scene.action(-5000, -5000, T)

    expect(scene.density(col, row, T + 200)).toBe(reference.density(col, row, T + 200))
  })

  it("keeps clouds plain, tinting only a gust's wave front", () => {
    const tones = (scene: ReturnType<typeof setup>, time: number) => {
      let accent = 0
      scene.draw({ put: (_ch, _col, _row, tone) => { if (tone === "accent") accent++ }, text: () => {} }, time)
      return accent
    }
    const { col, row } = findDenseCell(T + 200)
    const target = centre(col, row)
    const scene = setup()
    expect(tones(setup(), T + 200)).toBe(0)

    scene.action(target.x - 76, target.y, T)

    expect(tones(scene, T + 200)).toBeGreaterThan(0)
  })

  it("draws without throwing", () => {
    const scene = setup()
    const calls: string[] = []
    scene.update(1, T, idle)
    scene.draw({ put: (ch) => calls.push(ch), text: (s) => calls.push(s) }, T)

    expect(calls.length).toBeGreaterThan(0)
  })
})
