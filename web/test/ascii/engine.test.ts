// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DEMO_DELAY_MS, mountBackdrop, STILL_TIME_MS } from "../../src/lib/ascii/engine"
import type { Painter, Scene } from "../../src/lib/ascii/types"

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

function flush(n = 1) {
  for (let i = 0; i < n; i++) {
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

    expect(open).toBeCloseTo(0.45 * 1.3, 5)
    expect(last().alpha).toBeCloseTo(0.22 * 0.45 * 1.3, 5)
  })

  it("follows theme class changes without a themechange event", async () => {
    mount(makeScene())
    flush(2)

    document.documentElement.style.setProperty("--foreground", "#abcdef")
    document.documentElement.classList.replace("dark", "light")
    await Promise.resolve()
    flush(2)

    expect(last().fill).toBe("#abcdef")
    expect(last().alpha).toBeCloseTo(0.55 * 1.3, 5)
  })

  it("runs the self-demo once after 1000ms", () => {
    const scene = makeScene()
    mount(scene)

    vi.advanceTimersByTime(DEMO_DELAY_MS - 1)
    expect(scene.demo).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(scene.demo).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(4000)
    expect(scene.demo).toHaveBeenCalledTimes(1)
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
})
