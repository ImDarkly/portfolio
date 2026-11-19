// @vitest-environment jsdom
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Carousel } from "../src/components/ui/carousel"
import { CarouselFraction } from "../src/components/projects/carousel-fraction"

type Listener = () => void

function createFakeApi(total: number) {
  const listeners = new Map<string, Set<Listener>>()
  let selected = 0

  return {
    selectedScrollSnap: () => selected,
    scrollSnapList: () => Array.from({ length: total }, (_, index) => index),
    canScrollPrev: () => true,
    canScrollNext: () => true,
    on(event: string, listener: Listener) {
      listeners.set(event, (listeners.get(event) ?? new Set()).add(listener))
    },
    off(event: string, listener: Listener) {
      listeners.get(event)?.delete(listener)
    },
    select(index: number) {
      selected = index
      listeners.get("select")?.forEach((listener) => listener())
    },
  }
}

// The component under test reads the Embla api from the real Carousel
// context, so only the Embla hook is replaced: tests decide when (and with
// what) the api is reported.
let currentApi: ReturnType<typeof createFakeApi> | undefined

vi.mock("embla-carousel-react", () => ({
  default: () => [() => undefined, currentApi],
}))

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true

describe("CarouselFraction", () => {
  let container: HTMLDivElement
  let root: Root

  const render = () =>
    act(() => {
      root.render(
        <Carousel>
          <CarouselFraction />
        </Carousel>
      )
    })

  beforeEach(() => {
    currentApi = undefined
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it("renders nothing before the carousel reports a count", () => {
    render()

    expect(container.querySelector("p")).toBeNull()
    expect(container.textContent).not.toContain("0 / 0")
  })

  it("renders nothing while the api reports no slides", () => {
    currentApi = createFakeApi(0)
    render()

    expect(container.querySelector("p")).toBeNull()
  })

  it("shows current / total once the api reports a count and follows select", () => {
    currentApi = createFakeApi(5)
    render()

    expect(container.querySelector("p")?.textContent).toBe("1 / 5")

    act(() => currentApi?.select(2))

    expect(container.querySelector("p")?.textContent).toBe("3 / 5")
  })
})
