import { createNoise } from "../noise"
import type { Grid, Painter, Pointer, Scene } from "../types"

interface Mark {
  x: number
  y: number
  t: number
  gust: boolean
}

const RAMP = " .-:=+*"
const MARK_GAP = 40
const MAX_MARKS = 60
const TRAIL_LIFE = 2600
const GUST_LIFE = 1600
const MAX_GUSTS = 8
const TRAIL_REACH = 210 // beyond this a trail mark's effect is < 0.0002
const RING_HALF = 50
const MOVING_SPEED = 0.5
// Noise above this becomes cloud; high enough that clouds come in scattered patches.
const CUT = 0.5

const emptyGrid: Grid = { cols: 0, rows: 0, cellW: 1, cellH: 1, width: 0, height: 0 }

export default function createClouds(rng: () => number = Math.random): Scene & {
  density(col: number, row: number, time: number): number
} {
  const fbm = createNoise(rng)
  let grid = emptyGrid
  const marks: Mark[] = []
  let lastMark = -Infinity

  const rowMarks: Mark[] = []

  function density(col: number, row: number, time: number) {
    return shade(col, row, time, marks)
  }

  // Only marks that can reach this row's cells; trail marks are stretched 1.4x vertically.
  function marksNearRow(row: number, time: number) {
    const cy = (row + 0.5) * grid.cellH
    rowMarks.length = 0
    for (const m of marks) {
      const age = time - m.t
      if (age < 0) continue
      const reach = m.gust ? (age * 0.38 + RING_HALF) / 1.4 : TRAIL_REACH / 1.4
      if (Math.abs(cy - m.y) <= reach) rowMarks.push(m)
    }
    return rowMarks
  }

  function shade(col: number, row: number, time: number, near: readonly Mark[]) {
    const { cellW, cellH } = grid
    const t = time / 1000
    let d = (fbm(col * 0.04 + t * 0.06, row * 0.13 + t * 0.01) - CUT) * 2.4
    if (d <= 0) return d

    const cx = (col + 0.5) * cellW
    const cy = (row + 0.5) * cellH
    for (const m of near) {
      const age = (time - m.t) / 1000
      if (age < 0 || age * 1000 >= (m.gust ? GUST_LIFE : TRAIL_LIFE)) continue
      const dx = cx - m.x
      const dy = (cy - m.y) * 1.4
      if (m.gust) {
        const outer = age * 380 + RING_HALF
        if (dx > outer || dx < -outer || dy > outer || dy < -outer) continue
        const ring = Math.abs(Math.sqrt(dx * dx + dy * dy) - age * 380)
        if (ring < RING_HALF) d *= 1 - 0.85 * (1 - ring / RING_HALF) * (1 - age / 1.6)
      } else {
        if (dx > TRAIL_REACH || dx < -TRAIL_REACH || dy > TRAIL_REACH || dy < -TRAIL_REACH) continue
        d *= 1 - 0.9 * Math.exp(-(dx * dx + dy * dy) / 4900) * (1 - age / 2.6)
      }
    }
    return d
  }

  function gust(x: number, y: number, time: number) {
    marks.push({ x, y, t: time, gust: true })
    let gusts = 0
    for (const m of marks) if (m.gust) gusts++
    if (gusts > MAX_GUSTS) marks.splice(marks.findIndex((m) => m.gust), 1)
  }

  return {
    density,
    resize(next) {
      grid = next
    },
    update(_dt, time, pointer: Pointer) {
      let kept = 0
      for (const m of marks) {
        if (time - m.t < (m.gust ? GUST_LIFE : TRAIL_LIFE)) marks[kept++] = m
      }
      marks.length = kept
      if (!pointer.inside || Math.sqrt(pointer.vx ** 2 + pointer.vy ** 2) <= MOVING_SPEED) return
      if (time - lastMark < MARK_GAP) return
      lastMark = time
      marks.push({ x: pointer.x, y: pointer.y, t: time, gust: false })
      if (marks.length > MAX_MARKS) marks.shift()
    },
    draw(p: Painter, time) {
      const { cols, rows } = grid
      for (let row = 0; row < rows; row++) {
        const near = marksNearRow(row, time)
        for (let col = 0; col < cols; col++) {
          const d = shade(col, row, time, near)
          if (d > 0.1) p.put(RAMP[Math.min(6, Math.floor(d * 7))], col, row, "fg", 0.25 + d * 0.6)
        }
      }
    },
    action: gust,
    demo: gust,
  }
}
