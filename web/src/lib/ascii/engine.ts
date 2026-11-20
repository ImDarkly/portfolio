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
const MAX_JUMP = 200
const VELOCITY_DECAY = 0.85
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

  const painter: Painter = {
    put(ch, col, row, tone, alpha = 1) {
      if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return
      const a = Math.min(Math.max(alpha * baseAlpha * GLYPH_BOOST * mask[row * grid.cols + col], 0), 1)
      if (a <= 0) return
      ctx.globalAlpha = a
      ctx.fillStyle = colors[tone]
      ctx.fillText(ch, col * grid.cellW, row * grid.cellH)
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
    mask = buildFadeMask(grid, rects)
  }

  const render = (time: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, grid.width, grid.height)
    ctx.font = `${CELL_H - 1}px "JetBrains Mono Variable", monospace`
    ctx.textBaseline = "top"
    scene.draw(painter, time)
  }

  const drawStill = () => {
    scene.update(0, STILL_TIME_MS, pointer)
    render(STILL_TIME_MS)
  }

  const redraw = () => {
    if (reduced) drawStill()
  }

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = window.innerWidth
    const height = window.innerHeight
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
    const dt = Math.min(3, (time - lastTime) / FRAME_MS)
    lastTime = time
    pointer.vx *= VELOCITY_DECAY
    pointer.vy *= VELOCITY_DECAY
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
