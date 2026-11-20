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

const emptyGrid: Grid = { cols: 0, rows: 0, cellW: 1, cellH: 1, width: 0, height: 0 }

export default function createClouds(rng: () => number = Math.random): Scene & {
  density(col: number, row: number, time: number): number
} {
  const fbm = createNoise(rng)
  let grid = emptyGrid
  let marks: Mark[] = []
  let lastMark = -Infinity

  function density(col: number, row: number, time: number) {
    const { rows, cellW, cellH } = grid
    if (row < Math.floor(rows * 0.42)) return 0
    const band = Math.min(1, Math.max(0, (row / rows - 0.52) / 0.2))
    const t = time / 1000
    let d = (fbm(col * 0.04 + t * 0.06, row * 0.13 + t * 0.01) - 0.38) * 2.4 * band
    if (d <= 0) return d

    const cx = (col + 0.5) * cellW
    const cy = (row + 0.5) * cellH
    for (const m of marks) {
      const age = (time - m.t) / 1000
      if (age < 0 || age * 1000 >= (m.gust ? GUST_LIFE : TRAIL_LIFE)) continue
      const dist = Math.hypot(cx - m.x, (cy - m.y) * 1.4)
      if (m.gust) {
        const ring = Math.abs(dist - age * 380)
        if (ring < 50) d *= 1 - 0.85 * (1 - ring / 50) * (1 - age / 1.6)
      } else {
        d *= 1 - 0.9 * Math.exp(-((dist / 70) ** 2)) * (1 - age / 2.6)
      }
    }
    return d
  }

  function gust(x: number, y: number, time: number) {
    marks.push({ x, y, t: time, gust: true })
  }

  return {
    density,
    resize(next) {
      grid = next
    },
    update(_dt, time, pointer: Pointer) {
      marks = marks.filter((m) => time - m.t < (m.gust ? GUST_LIFE : TRAIL_LIFE))
      if (!pointer.inside || (pointer.vx === 0 && pointer.vy === 0)) return
      if (time - lastMark < MARK_GAP) return
      lastMark = time
      marks.push({ x: pointer.x, y: pointer.y, t: time, gust: false })
      if (marks.length > MAX_MARKS) marks.shift()
    },
    draw(p: Painter, time) {
      const { cols, rows } = grid
      const top = Math.floor(rows * 0.42)
      const apex = cols * (grid.width < 1024 ? 0.78 : 0.93)
      const peakTop = rows * 0.6
      for (let row = top; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const d = density(col, row, time)
          if (d > 0.1) {
            p.put(RAMP[Math.min(6, Math.floor(d * 7))], col, row, "fg", 0.25 + d * 0.6)
            continue
          }
          const rise = row - peakTop
          if (rise < 0) continue
          const half = rise * 1.6
          const dx = col - apex
          if (Math.abs(Math.abs(dx) - half) < 0.8) {
            p.put(rise < 1 ? "^" : dx < 0 ? "/" : "\\", col, row, rise < 2 ? "accent" : "fg", 0.7)
          } else if (Math.abs(dx) < half && (col + row) % 3 === 0) {
            p.put(".", col, row, "fg", 0.35)
          }
        }
      }
    },
    action: gust,
    demo: gust,
  }
}
