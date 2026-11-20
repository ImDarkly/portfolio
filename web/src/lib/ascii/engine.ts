import { buildFadeMask, findOpenPoint } from "./fade-mask"
import { CONTENT_SELECTOR, isEmptySpace } from "./surface"
import type { Grid, Painter, Pointer, Rect, Scene, Tone } from "./types"

export interface MountOptions {
  reducedMotion?: boolean
  now?: () => number
}

export const CELL_W = 7
export const CELL_H = 12
export const DEMO_DELAY_MS = 1000
export const STILL_TIME_MS = 8000
export const REDUCED_ACTION_AGE_MS = 300

const FRAME_MS = 16.67
const MIN_FRAME_MS = 33 // cap the loop at ~30fps
const MAX_JUMP = 200
const VELOCITY_DECAY = 0.85
const VELOCITY_REST = 0.05
const ALPHA_LEVELS = 8
const TONES: Tone[] = ["fg", "muted", "accent"]

interface Bucket {
  ch: string[]
  x: number[]
  y: number[]
  n: number
}
const GLYPH_BOOST = 1.3

export function mountBackdrop(
  canvas: HTMLCanvasElement,
  scene: Scene,
  options: MountOptions = {},
): () => void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return () => {}

  const now = options.now ?? (() => performance.now())
  const reduced =
    options.reducedMotion ??
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)

  const root = document.documentElement
  const pointer: Pointer = { x: -9999, y: -9999, vx: 0, vy: 0, inside: false }
  let grid: Grid = { cols: 0, rows: 0, cellW: CELL_W, cellH: CELL_H, width: 0, height: 0 }
  let mask: Float32Array = new Float32Array(0)
  let dpr = 1
  let colors: Record<Tone, string> = { fg: "", muted: "", accent: "" }
  let baseAlpha = 0.45
  let frame = 0
  let demoTimer: ReturnType<typeof setTimeout> | undefined
  let lastTime = now()
  let disposed = false

  // Glyphs never overlap, so draw order is irrelevant: batch them per
  // (tone, alpha level) and set canvas state once per bucket.
  const buckets: Bucket[] = Array.from({ length: TONES.length * (ALPHA_LEVELS + 1) }, () => ({
    ch: [],
    x: [],
    y: [],
    n: 0,
  }))

  const painter: Painter = {
    put(ch, col, row, tone, alpha = 1) {
      if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return
      const a = Math.min(Math.max(alpha * baseAlpha * GLYPH_BOOST * mask[row * grid.cols + col], 0), 1)
      // Quantised in sqrt space: perceptually even, and faint glyphs stay faint.
      const level = Math.round(Math.sqrt(a) * ALPHA_LEVELS)
      if (level <= 0) return
      const b = buckets[TONES.indexOf(tone) * (ALPHA_LEVELS + 1) + level]
      b.ch[b.n] = ch
      b.x[b.n] = col * grid.cellW
      b.y[b.n] = row * grid.cellH
      b.n++
    },
    text(s, col, row, tone, alpha) {
      for (let i = 0; i < s.length; i++) {
        if (s[i] !== " ") painter.put(s[i], col + i, row, tone, alpha)
      }
    },
  }

  const readColors = () => {
    const style = getComputedStyle(root)
    const read = (name: string) => style.getPropertyValue(name).trim()
    colors = {
      fg: read("--foreground"),
      muted: read("--muted-foreground"),
      accent: read("--primary"),
    }
    baseAlpha = root.classList.contains("dark") ? 0.45 : 0.55
  }

  const rebuildMask = () => {
    const rects: Rect[] = []
    document.querySelectorAll(CONTENT_SELECTOR).forEach((el) => {
      const r = el.getBoundingClientRect()
      rects.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom })
    })
    mask = buildFadeMask(grid, rects, mask)
  }

  const render = (time: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, grid.width, grid.height)
    ctx.font = `${CELL_H - 1}px "JetBrains Mono Variable", monospace`
    ctx.textBaseline = "top"
    scene.draw(painter, time)
    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i]
      if (b.n === 0) continue
      ctx.fillStyle = colors[TONES[Math.floor(i / (ALPHA_LEVELS + 1))]]
      ctx.globalAlpha = ((i % (ALPHA_LEVELS + 1)) / ALPHA_LEVELS) ** 2
      for (let k = 0; k < b.n; k++) ctx.fillText(b.ch[k], b.x[k], b.y[k])
      b.n = 0
    }
  }

  const drawStill = () => {
    // No loop decays velocity here, so a moved pointer would leave a mark forever.
    scene.update(0, STILL_TIME_MS, { ...pointer, vx: 0, vy: 0 })
    render(STILL_TIME_MS)
  }

  const redraw = () => {
    if (reduced) drawStill()
  }

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = canvas.clientWidth || window.innerWidth
    const height = canvas.clientHeight || window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    grid = {
      cols: Math.ceil(width / CELL_W),
      rows: Math.ceil(height / CELL_H),
      cellW: CELL_W,
      cellH: CELL_H,
      width,
      height,
    }
    scene.resize(grid)
    rebuildMask()
    redraw()
  }

  const onScroll = () => {
    rebuildMask()
    redraw()
  }

  const onTheme = () => {
    readColors()
    redraw()
  }

  const tick = () => {
    frame = requestAnimationFrame(tick)
    if (document.visibilityState === "hidden") {
      lastTime = now()
      return
    }

    const time = now()
    if (time - lastTime < MIN_FRAME_MS) return
    const dt = Math.min(3, (time - lastTime) / FRAME_MS)
    lastTime = time
    const decay = VELOCITY_DECAY ** dt // per 60fps frame, whatever the frame rate
    pointer.vx *= decay
    pointer.vy *= decay
    if (Math.abs(pointer.vx) < VELOCITY_REST) pointer.vx = 0
    if (Math.abs(pointer.vy) < VELOCITY_REST) pointer.vy = 0
    scene.update(dt, time, pointer)
    render(time)
  }

  const onPointerMove = (event: PointerEvent) => {
    const dx = event.clientX - pointer.x
    const dy = event.clientY - pointer.y
    if (pointer.inside && Math.hypot(dx, dy) <= MAX_JUMP) {
      pointer.vx = dx
      pointer.vy = dy
    }
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.inside = true
  }

  const onPointerOut = (event: PointerEvent) => {
    if (event.relatedTarget === null) pointer.inside = false
  }

  const onPointerEnd = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") pointer.inside = false
  }

  const onClick = (event: MouseEvent) => {
    if (!isEmptySpace(event.target)) return
    if (window.getSelection?.()?.toString()) return
    scene.action(event.clientX, event.clientY, reduced ? STILL_TIME_MS - REDUCED_ACTION_AGE_MS : now())
    redraw()
  }

  const passive = { passive: true } as const

  readColors()
  const resizeObserver =
    typeof ResizeObserver === "function" ? new ResizeObserver(onScroll) : undefined
  resizeObserver?.observe(document.body)
  const themeObserver =
    typeof MutationObserver === "function" ? new MutationObserver(onTheme) : undefined
  themeObserver?.observe(root, { attributes: true, attributeFilter: ["class"] })

  window.addEventListener("resize", resize, passive)
  window.addEventListener("scroll", onScroll, passive)
  window.addEventListener("themechange", onTheme, passive)
  window.addEventListener("pointermove", onPointerMove, passive)
  window.addEventListener("pointerout", onPointerOut, passive)
  window.addEventListener("pointerup", onPointerEnd, passive)
  window.addEventListener("pointercancel", onPointerEnd, passive)
  window.addEventListener("click", onClick, passive)

  resize()
  document.fonts?.ready.then(() => {
    if (disposed) return
    rebuildMask()
    redraw()
  })

  if (!reduced) {
    frame = requestAnimationFrame(tick)
    demoTimer = setTimeout(() => {
      const { x, y } = findOpenPoint(grid, mask, Math.round(grid.rows * 0.7))
      scene.demo(x, y, now())
    }, DEMO_DELAY_MS)
  }

  return () => {
    disposed = true
    cancelAnimationFrame(frame)
    clearTimeout(demoTimer)
    resizeObserver?.disconnect()
    themeObserver?.disconnect()
    window.removeEventListener("resize", resize)
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("themechange", onTheme)
    window.removeEventListener("pointermove", onPointerMove)
    window.removeEventListener("pointerout", onPointerOut)
    window.removeEventListener("pointerup", onPointerEnd)
    window.removeEventListener("pointercancel", onPointerEnd)
    window.removeEventListener("click", onClick)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}
