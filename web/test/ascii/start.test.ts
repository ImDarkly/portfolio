// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const teardown = vi.fn()
const mountBackdrop = vi.fn<(canvas: HTMLCanvasElement, scene: object) => () => void>(() => teardown)

vi.mock("@/lib/ascii/engine", () => ({ mountBackdrop }))

let release: () => void = () => {}
vi.mock("@/lib/ascii/scenes", () => ({
  sceneLoaders: {
    clouds: () => Promise.resolve({ default: () => ({}) }),
    mova: () => Promise.resolve({ default: () => ({}) }),
    broken: () => Promise.reject(new Error("chunk failed")),
    slow: () =>
      new Promise((resolve) => {
        release = () => resolve({ default: () => ({}) })
      }),
  },
}))

const idle = (cb: () => void) => cb()
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function page(scene?: string) {
  document.body.innerHTML = scene ? `<canvas data-ascii-backdrop data-scene="${scene}"></canvas>` : "<main></main>"
  return document.querySelector("canvas")
}

describe("startBackdrops", () => {
  const listeners: [string, EventListener][] = []

  afterEach(() => {
    listeners.forEach(([type, fn]) => document.removeEventListener(type, fn))
    listeners.length = 0
  })

  beforeEach(async () => {
    const add = document.addEventListener.bind(document)
    vi.spyOn(document, "addEventListener").mockImplementation(
      (type: string, fn: EventListenerOrEventListenerObject) => {
        listeners.push([type, fn as EventListener])
        add(type, fn)
      },
    )
    vi.resetModules()
    mountBackdrop.mockClear()
    teardown.mockClear()
    const { startBackdrops } = await import("@/lib/ascii/start")
    startBackdrops({ idle })
    startBackdrops({ idle })
    vi.restoreAllMocks()
  })

  it("mounts the page's scene on page load", async () => {
    const canvas = page("clouds")
    document.dispatchEvent(new Event("astro:page-load"))
    await flush()

    expect(mountBackdrop).toHaveBeenCalledTimes(1)
    expect(mountBackdrop.mock.calls[0][0]).toBe(canvas)
  })

  it("tears down before a swap and mounts the next page", async () => {
    page("clouds")
    document.dispatchEvent(new Event("astro:page-load"))
    await flush()
    document.dispatchEvent(new Event("astro:before-swap"))
    expect(teardown).toHaveBeenCalledTimes(1)

    const next = page("mova")
    document.dispatchEvent(new Event("astro:page-load"))
    await flush()

    expect(mountBackdrop).toHaveBeenCalledTimes(2)
    expect(mountBackdrop.mock.calls[1][0]).toBe(next)
    expect(teardown).toHaveBeenCalledTimes(1)
  })

  it("mounts nothing on pages without a canvas", async () => {
    page()
    document.dispatchEvent(new Event("astro:page-load"))
    await flush()

    expect(mountBackdrop).not.toHaveBeenCalled()
    expect(() => document.dispatchEvent(new Event("astro:before-swap"))).not.toThrow()
  })

  it("does not mount if the page changed before the scene loaded", async () => {
    page("slow")
    document.dispatchEvent(new Event("astro:page-load"))
    document.dispatchEvent(new Event("astro:before-swap"))
    release()
    await flush()

    expect(mountBackdrop).not.toHaveBeenCalled()
  })

  it("shows no backdrop when the scene chunk fails to load", async () => {
    page("broken")
    expect(() => document.dispatchEvent(new Event("astro:page-load"))).not.toThrow()
    await flush()

    expect(mountBackdrop).not.toHaveBeenCalled()
  })

  it("does nothing for unknown scene names", async () => {
    page("nope")
    document.dispatchEvent(new Event("astro:page-load"))
    await flush()

    expect(mountBackdrop).not.toHaveBeenCalled()
  })
})
