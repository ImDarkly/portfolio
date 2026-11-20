import { describe, expect, it } from "vitest"

import createMovaTiles, { WORDS } from "../../src/lib/ascii/scenes/mova-tiles"
import type { Grid, Pointer } from "../../src/lib/ascii/types"

function lcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const cell = { cellW: 7, cellH: 12 }
const gridOf = (width: number, height: number): Grid => ({
  ...cell,
  width,
  height,
  cols: Math.floor(width / cell.cellW),
  rows: Math.floor(height / cell.cellH),
})
const idle: Pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false }

function setup(width = 1280, height = 800) {
  const scene = createMovaTiles(lcg(11))
  scene.resize(gridOf(width, height))
  return scene
}

const targets = (scene: ReturnType<typeof setup>) =>
  scene.tiles.flatMap((t) => (t.target ? [t.target] : [])).sort((a, b) => a.x - b.x)

describe("createMovaTiles", () => {
  it("starts with 9 tiles on desktop and 6 on phones", () => {
    expect(setup(1280, 800).tiles).toHaveLength(9)
    expect(setup(600, 800).tiles).toHaveLength(6)
  })

  it("spells the word in order, centred on the point", () => {
    const scene = setup()
    scene.spell("mova", 640, 400, 0)
    const t = targets(scene)

    expect(t.map((x) => x.ch)).toEqual(["M", "O", "V", "A"])
    expect(t.map((x) => x.x)).toEqual([0, 1, 2, 3].map((i) => 640 - 2 * 28 + i * 28))
    expect(t.every((x) => x.y === 388)).toBe(true)
  })

  it("keeps a long word fully on screen near an edge", () => {
    const scene = setup()
    scene.spell("tenerife", 10, 400, 0)
    const xs = targets(scene).map((x) => x.x)

    expect(Math.min(...xs)).toBeGreaterThanOrEqual(8)
    expect(Math.max(...xs) + 3 * 7).toBeLessThanOrEqual(1280 - 8)
  })

  it("leaves a gap for spaces", () => {
    const scene = setup()
    scene.spell("ship it", 640, 400, 0)
    const t = targets(scene)
    const p = t.find((x) => x.ch === "P")!
    const i = t.find((x) => x.ch === "I" && x.x > p.x)!

    expect(t).toHaveLength(6)
    expect(i.x - p.x).toBe(2 * 28)
  })

  it("shows target letters once arrived and releases after 3800ms", () => {
    const scene = setup()
    scene.spell("mova", 640, 400, 0)
    for (let i = 0; i < 150; i++) scene.update(1, i * 16, idle)

    const placed = scene.tiles.filter((t) => t.target)
    expect(placed).toHaveLength(4)
    for (const t of placed) expect(t.ch).toBe(t.target!.ch)

    scene.update(1, 3801, idle)
    expect(scene.tiles.every((t) => t.target === null)).toBe(true)
  })

  it("places the word at once when there are no frames (dt 0, reduced motion)", () => {
    const scene = setup()
    scene.spell("mova", 640, 400, 7700)
    scene.update(0, 8000, idle)

    const placed = scene.tiles.filter((t) => t.target)
    expect(placed).toHaveLength(4)
    for (const t of placed) {
      expect(t.ch).toBe(t.target!.ch)
      expect([t.x, t.y]).toEqual([t.target!.x, t.target!.y])
    }
  })

  it("picks only words that fit", () => {
    const scene = setup(600, 800)
    const fitting = WORDS.filter((w) => w.replace(/ /g, "").length <= 6).map((w) => w.replace(/ /g, "").toUpperCase())
    expect(fitting.length).toBeLessThan(WORDS.length)

    for (let i = 0; i < 50; i++) {
      scene.action(300, 400, 0)
      const spelled = targets(scene).map((t) => t.ch).join("")
      expect(fitting).toContain(spelled)
    }
  })

  it("releases a spelled word immediately on resize", () => {
    const scene = setup()
    scene.spell("tenerife", 1270, 400, 0)
    scene.resize(gridOf(400, 600))
    for (let i = 0; i < 10; i++) scene.update(1, 100 + i * 16, idle)

    expect(scene.tiles.every((t) => t.target === null)).toBe(true)
    for (const t of scene.tiles) {
      expect(t.x).toBeGreaterThanOrEqual(4)
      expect(t.x).toBeLessThanOrEqual(400 - 21 - 4)
      expect(t.y).toBeGreaterThanOrEqual(4)
      expect(t.y).toBeLessThanOrEqual(600 - 36 - 4)
    }
  })

  it("demo spells MOVA", () => {
    const scene = setup()
    scene.demo(640, 400, 0)

    expect(targets(scene).map((x) => x.ch)).toEqual(["M", "O", "V", "A"])
  })

  it("keeps tiles on screen after shrinking the viewport", () => {
    const scene = setup(600, 800)
    scene.resize(gridOf(400, 600))

    expect(scene.tiles).toHaveLength(6)
    for (const t of scene.tiles) {
      expect(t.x).toBeGreaterThanOrEqual(4)
      expect(t.x).toBeLessThanOrEqual(400 - 21 - 4)
      expect(t.y).toBeGreaterThanOrEqual(4)
      expect(t.y).toBeLessThanOrEqual(600 - 36 - 4)
    }
  })

  it("draws framed tiles", () => {
    const scene = setup()
    const calls: string[] = []
    scene.update(1, 0, idle)
    scene.draw({ put: (ch) => calls.push(ch), text: (s) => calls.push(s) }, 0)

    expect(calls).toContain("┌─┐")
  })
})
