import type { Grid, Painter, Pointer, Scene } from "../types"

export interface Tile {
  x: number
  y: number
  vx: number
  vy: number
  ch: string
  target: { x: number; y: number; ch: string } | null
}

interface LiveTile extends Tile {
  flicker: number
}

export const WORDS = ["hello", "react", "ship it", "tenerife", "hola", "mova", "hi there"]

const ABC = "ABCDEFGHIJKLMNOPRSTUVWY"
const HOLD = 3800
const MAX_SPEED = 1.6

const emptyGrid: Grid = { cols: 0, rows: 0, cellW: 1, cellH: 1, width: 0, height: 0 }

export default function createMovaTiles(rng: () => number = Math.random): Scene & {
  tiles: readonly Tile[]
  spell(word: string, x: number, y: number, time: number): void
} {
  let grid = emptyGrid
  let list: LiveTile[] = []
  let release = 0

  const rand = (min: number, max: number) => min + rng() * (max - min)
  const maxX = () => grid.width - 3 * grid.cellW - 4
  const maxY = () => grid.height - 3 * grid.cellH - 4
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  function spell(word: string, x: number, y: number, time: number) {
    const letters = word.toUpperCase()
    const step = 4 * grid.cellW
    const sx = clamp(x - (letters.length * step) / 2, 8, grid.width - letters.length * step - 8)
    const sy = clamp(y - grid.cellH, 8, grid.height - 4 * grid.cellH)
    const free = [...list].sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
    for (const tile of list) tile.target = null
    let k = 0
    for (let i = 0; i < letters.length && k < free.length; i++) {
      if (letters[i] !== " ") free[k++].target = { x: sx + i * step, y: sy, ch: letters[i] }
    }
    release = time + HOLD
  }

  return {
    get tiles() {
      return list
    },
    spell,
    resize(next) {
      grid = next
      const count = next.width < 640 ? 6 : 9
      if (list.length !== count) {
        list = Array.from({ length: count }, (_, i) => ({
          x: rand(40, Math.max(40, next.width - 40)),
          y: rand(40, Math.max(40, next.height - 60)),
          vx: rand(-0.3, 0.3),
          vy: rand(-0.3, 0.3),
          ch: "MOVA"[i % 4],
          target: null,
          flicker: 0,
        }))
      }
      for (const tile of list) {
        tile.x = clamp(tile.x, 4, maxX())
        tile.y = clamp(tile.y, 4, maxY())
      }
    },
    update(dt, time, pointer: Pointer) {
      if (release && time > release) {
        release = 0
        for (const tile of list) {
          if (!tile.target) continue
          tile.target = null
          tile.vx = rand(-1.5, 1.5)
          tile.vy = rand(-1.5, 1.5)
        }
      }
      for (const tile of list) {
        if (tile.target) {
          tile.x += (tile.target.x - tile.x) * 0.12 * dt
          tile.y += (tile.target.y - tile.y) * 0.12 * dt
          if (Math.hypot(tile.target.x - tile.x, tile.target.y - tile.y) < 3) {
            tile.ch = tile.target.ch
          } else if ((tile.flicker += dt) > 3) {
            tile.flicker = 0
            tile.ch = ABC[Math.floor(rng() * ABC.length)]
          }
          continue
        }
        tile.vx += rand(-0.02, 0.02) * dt
        tile.vy += rand(-0.02, 0.02) * dt
        if (pointer.inside) {
          const dx = tile.x - pointer.x
          const dy = tile.y - pointer.y
          const d = Math.hypot(dx, dy)
          if (d < 110 && d > 0) {
            tile.vx += (dx / d) * 0.25 * dt
            tile.vy += (dy / d) * 0.25 * dt
          }
        }
        const speed = Math.hypot(tile.vx, tile.vy)
        if (speed > MAX_SPEED) {
          tile.vx *= MAX_SPEED / speed
          tile.vy *= MAX_SPEED / speed
        }
        tile.vx *= 0.985
        tile.vy *= 0.985
        if (Math.hypot(tile.vx, tile.vy) < 0.15) {
          tile.vx += rand(-0.05, 0.05)
          tile.vy += rand(-0.05, 0.05)
        }
        tile.x += tile.vx * dt
        tile.y += tile.vy * dt
        if (tile.x < 4 || tile.x > maxX()) tile.vx *= -1
        if (tile.y < 4 || tile.y > maxY()) tile.vy *= -1
        tile.x = clamp(tile.x, 4, maxX())
        tile.y = clamp(tile.y, 4, maxY())
      }
    },
    draw(p: Painter) {
      for (const tile of list) {
        const col = Math.round(tile.x / grid.cellW)
        const row = Math.round(tile.y / grid.cellH)
        const placed = tile.target !== null && tile.ch === tile.target.ch
        p.text("┌─┐", col, row, "fg", 0.6)
        p.put("│", col, row + 1, "fg", 0.6)
        p.put(tile.ch, col + 1, row + 1, placed ? "accent" : "fg", placed ? 1.6 : 0.9)
        p.put("│", col + 2, row + 1, "fg", 0.6)
        p.text("└─┘", col, row + 2, "fg", 0.6)
      }
    },
    action(x, y, time) {
      const pool = WORDS.filter((w) => w.replace(/ /g, "").length <= list.length)
      spell(pool[Math.floor(rng() * pool.length)], x, y, time)
    },
    demo(x, y, time) {
      spell("MOVA", x, y, time)
    },
  }
}
