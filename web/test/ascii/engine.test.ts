// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  DEMO_DELAY_MS,
  DEMO_REPEAT_MS,
  mountBackdrop,
  REDUCED_ACTION_AGE_MS,
  STILL_TIME_MS,
} from "../../src/lib/ascii/engine"
import createClouds from "../../src/lib/ascii/scenes/clouds"
import type { Grid, Painter, Pointer, Scene } from "../../src/lib/ascii/types"

interface Glyph {
  ch: string
  alpha: number
  fill: string
}

let glyphs: Glyph[]
let frames: FrameRequestCallback[]
let rafCalls: number
let teardown: (() => void) | undefined

function makeScene() {
  const scene = {
    resize: vi.fn(),
    update: vi.fn(),
    draw: vi.fn((p: Painter) => p.put("x", 0, 0, "fg")),
    action: vi.fn(),
    demo: vi.fn(),
  }
  return scene satisfies Scene
}

// Engine alpha is quantised to 8 levels in sqrt space.
const q = (a: number) => (Math.round(Math.sqrt(a) * 8) / 8) ** 2

// Advances the fake clock between frames: the engine skips frames under 33ms.
function flush(n = 1, stepMs = 34) {
  for (let i = 0; i < n; i++) {
    vi.advanceTimersByTime(stepMs)
    const queue = frames
    frames = []
    queue.forEach((cb) => cb(performance.now()))
  }
}

function mount(scene: Scene, options?: Parameters<typeof mountBackdrop>[2]) {
  const canvas = document.createElement("canvas")
  document.body.append(canvas)
  teardown = mountBackdrop(canvas, scene, options)
  return canvas
}

function last() {
  return glyphs[glyphs.length - 1]
}

beforeEach(() => {
  vi.useFakeTimers()
  glyphs = []
  frames = []
  rafCalls = 0

  document.documentElement.className = "dark"
  document.documentElement.style.setProperty("--foreground", "#111111")
  document.documentElement.style.setProperty("--muted-foreground", "#222222")
  document.documentElement.style.setProperty("--primary", "#333333")

  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafCalls++
    frames.push(cb)
    return rafCalls
  })
  vi.stubGlobal("cancelAnimationFrame", () => {
    frames = []
  })

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function () {
    const ctx = {
      globalAlpha: 1,
      fillStyle: "",
      font: "",
      textBaseline: "",
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillText(ch: string) {
        glyphs.push({ ch, alpha: ctx.globalAlpha, fill: String(ctx.fillStyle) })
      },
    }
    return ctx as unknown as CanvasRenderingContext2D
  } as never)
})

afterEach(() => {
  teardown?.()
  teardown = undefined
  document.body.innerHTML = ""
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute("style")
})

describe("mountBackdrop", () => {
  it("draws scene glyphs each frame", () => {
    mount(makeScene())
    flush(2)

    expect(glyphs.some((g) => g.ch === "x")).toBe(true)
    expect(last().fill).toBe("#111111")
  })

  it("dims glyphs over content blocks", () => {
    mount(makeScene())
    flush(2)
    const open = last().alpha

    teardown?.()
    glyphs = []
    const block = document.createElement("div")
    block.setAttribute("data-ascii-block", "")
    block.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 60, bottom: 60, width: 60, height: 60 }) as DOMRect
    document.body.append(block)
    mount(makeScene())
    flush(2)

    expect(open).toBeCloseTo(q(0.45 * 1.3), 5)
    expect(last().alpha).toBeCloseTo(q(0.22 * 0.45 * 1.3), 5)
  })

  it("follows theme class changes without a themechange event", async () => {
    mount(makeScene())
    flush(2)

    document.documentElement.style.setProperty("--foreground", "#abcdef")
    document.documentElement.classList.replace("dark", "light")
    await Promise.resolve()
    flush(2)

    expect(last().fill).toBe("#abcdef")
    expect(last().alpha).toBeCloseTo(q(0.55 * 1.3), 5)
  })

  it("runs the self-demo after 1000ms, then every 5000ms", () => {
    const scene = makeScene()
    mount(scene)

    vi.advanceTimersByTime(DEMO_DELAY_MS - 1)
    expect(scene.demo).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(scene.demo).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(DEMO_REPEAT_MS - 1)
    expect(scene.demo).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(scene.demo).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(DEMO_REPEAT_MS)
    expect(scene.demo).toHaveBeenCalledTimes(3)
  })

  it("triggers action on a click on empty space only", () => {
    const scene = makeScene()
    const main = document.createElement("main")
    main.setAttribute("data-ascii-layout", "")
    const section = document.createElement("section")
    const link = document.createElement("a")
    section.append(link)
    main.append(section)
    document.body.append(main)
    mount(scene)

    main.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 20 }))
    expect(scene.action).toHaveBeenCalledTimes(1)
    expect(scene.action.mock.calls[0].slice(0, 2)).toEqual([10, 20])

    link.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(scene.action).toHaveBeenCalledTimes(1)

    vi.spyOn(window, "getSelection").mockReturnValue({ toString: () => "text" } as Selection)
    main.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(scene.action).toHaveBeenCalledTimes(1)
  })

  it("never prevents default", () => {
    const main = document.createElement("main")
    document.body.append(main)
    mount(makeScene())

    for (const type of ["pointermove", "pointerdown", "click"]) {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true })
      main.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
  })

  it("does not animate or demo under reduced motion", () => {
    const scene = makeScene()
    const main = document.createElement("main")
    document.body.append(main)
    mount(scene, { reducedMotion: true })

    expect(scene.update).toHaveBeenCalledTimes(1)
    expect(scene.update.mock.calls[0][0]).toBe(0)
    expect(scene.update.mock.calls[0][1]).toBe(STILL_TIME_MS)
    expect(scene.draw).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5000)
    expect(rafCalls).toBe(0)
    expect(scene.demo).not.toHaveBeenCalled()

    main.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(scene.action).toHaveBeenCalledTimes(1)
    expect(scene.draw).toHaveBeenCalledTimes(2)
    expect(rafCalls).toBe(0)
  })

  it("caps the loop at 30fps", () => {
    const scene = makeScene()
    mount(scene)
    flush(10, 16.67)

    expect(scene.update).toHaveBeenCalledTimes(5)
    expect(scene.update.mock.calls[0][0]).toBeCloseTo(2, 1)
  })

  it("sizes the grid from the canvas box", () => {
    const scene = makeScene()
    vi.spyOn(HTMLCanvasElement.prototype, "clientWidth", "get").mockReturnValue(700)
    vi.spyOn(HTMLCanvasElement.prototype, "clientHeight", "get").mockReturnValue(600)
    const canvas = mount(scene)

    expect(scene.resize.mock.calls[0][0]).toMatchObject({ width: 700, height: 600, cols: 100, rows: 50 })
    expect([canvas.width, canvas.height]).toEqual([700, 600])
  })

  it("passes a still pointer to the reduced-motion frame", () => {
    const scene = makeScene()
    const main = document.createElement("main")
    document.body.append(main)
    mount(scene, { reducedMotion: true })
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 10, clientY: 10 }))
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 40, clientY: 30 }))

    main.dispatchEvent(new MouseEvent("click", { bubbles: true }))

    const pointer = scene.update.mock.calls[scene.update.mock.calls.length - 1][2]
    expect(pointer).toMatchObject({ x: 40, y: 30, vx: 0, vy: 0, inside: true })
  })

  it("lets parted clouds refill once the pointer rests", () => {
    function lcg(seed: number) {
      let s = seed
      return () => {
        s = (s * 1664525 + 1013904223) % 4294967296
        return s / 4294967296
      }
    }
    // jsdom has no layout, so the engine falls back to the 1024x768 window.
    const grid: Grid = { cols: 147, rows: 64, cellW: 7, cellH: 12, width: 1024, height: 768 }
    const scene = createClouds(lcg(7))
    const reference = createClouds(lcg(7))
    reference.resize(grid)
    const speeds: number[] = []
    const update = scene.update
    scene.update = (dt: number, time: number, p: Pointer) => {
      speeds.push(Math.hypot(p.vx, p.vy))
      update(dt, time, p)
    }

    const MOVE = 10
    const REST = 90 // ~3s of 30fps frames
    const start = performance.now()
    const stop = start + MOVE * 34
    const end = stop + REST * 34
    let cell: { col: number; row: number } | undefined
    for (let row = grid.rows - 1; row >= 0 && !cell; row--) {
      for (let col = 20; col < grid.cols - 20 && !cell; col++) {
        if (reference.density(col, row, stop) > 0.3 && reference.density(col, row, end) > 0.3) cell = { col, row }
      }
    }
    const { col, row } = cell!
    const x = (col + 0.5) * grid.cellW
    const y = (row + 0.5) * grid.cellH

    mount(scene)
    for (let i = MOVE; i > 0; i--) {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: x - i * 6, clientY: y }))
      flush(1)
    }
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: x, clientY: y }))
    expect(scene.density(col, row, stop)).toBeLessThan(reference.density(col, row, stop) * 0.5)

    const moving = speeds.length
    flush(REST)

    // Velocity snaps to exactly 0 within ~0.5s, after which no trail marks are stamped.
    expect(speeds.slice(moving + 15).every((s) => s === 0)).toBe(true)
    const undisturbed = reference.density(col, row, end)
    expect(Math.abs(scene.density(col, row, end) - undisturbed)).toBeLessThanOrEqual(undisturbed * 0.05)
    // Any mark stamped after the rest would still be alive and dimming the cell.
    expect(scene.density(col, row, end)).toBe(undisturbed)
  })

  it("pauses while the tab is hidden", () => {
    const scene = makeScene()
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden")
    mount(scene)
    flush(3)

    expect(scene.update).not.toHaveBeenCalled()
  })

  it("stops everything on teardown", () => {
    const scene = makeScene()
    const main = document.createElement("main")
    document.body.append(main)
    mount(scene)
    flush(1)
    scene.update.mockClear()
    scene.draw.mockClear()

    teardown?.()
    teardown = undefined
    flush(3)
    vi.advanceTimersByTime(5000)
    main.dispatchEvent(new MouseEvent("click", { bubbles: true }))

    expect(scene.update).not.toHaveBeenCalled()
    expect(scene.draw).not.toHaveBeenCalled()
    expect(scene.demo).not.toHaveBeenCalled()
    expect(scene.action).not.toHaveBeenCalled()
  })

  it("ages the action so the still frame shows it under reduced motion", () => {
    const scene = makeScene()
    const main = document.createElement("main")
    document.body.append(main)
    mount(scene, { reducedMotion: true })
    scene.update.mockClear()
    scene.draw.mockClear()

    main.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 5, clientY: 6 }))

    expect(scene.action.mock.calls[0]).toEqual([5, 6, STILL_TIME_MS - REDUCED_ACTION_AGE_MS])
    expect(scene.action.mock.calls[0][2]).toBe(7700)
    expect(scene.update).toHaveBeenCalledTimes(1)
    expect(scene.update.mock.calls[0].slice(0, 2)).toEqual([0, STILL_TIME_MS])
    expect(scene.draw).toHaveBeenCalledTimes(1)
  })

  describe("pointer presence", () => {
    function fire(type: string, extra: Record<string, unknown> = {}) {
      const event = new MouseEvent(type, { bubbles: true, clientX: 10, clientY: 10 })
      for (const [k, v] of Object.entries(extra)) Object.defineProperty(event, k, { value: v })
      window.dispatchEvent(event)
    }
    function inside(scene: ReturnType<typeof makeScene>) {
      flush(1)
      return scene.update.mock.calls[scene.update.mock.calls.length - 1][2].inside
    }

    it("clears inside on pointerout with null relatedTarget", () => {
      const scene = makeScene()
      mount(scene)
      fire("pointermove")
      expect(inside(scene)).toBe(true)
      fire("pointerout", { relatedTarget: null })
      expect(inside(scene)).toBe(false)
    })

    it("clears inside on touch pointerup but not mouse pointerup", () => {
      const scene = makeScene()
      mount(scene)
      fire("pointermove")
      fire("pointerup", { pointerType: "mouse" })
      expect(inside(scene)).toBe(true)
      fire("pointerup", { pointerType: "touch" })
      expect(inside(scene)).toBe(false)
    })
  })
})
