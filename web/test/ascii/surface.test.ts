// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"

import { CONTENT_SELECTOR, isEmptySpace } from "../../src/lib/ascii/surface"

beforeEach(() => {
  document.body.innerHTML =
    '<main><div data-ascii-layout><section><h1>t</h1><a href="#">l</a></section></div></main><div data-ascii-block><button>b</button></div>'
})

describe("isEmptySpace", () => {
  it("is true for html, body, main and the layout element", () => {
    expect(isEmptySpace(document.documentElement)).toBe(true)
    expect(isEmptySpace(document.body)).toBe(true)
    expect(isEmptySpace(document.querySelector("main"))).toBe(true)
    expect(isEmptySpace(document.querySelector("[data-ascii-layout]"))).toBe(true)
  })

  it("is false for content and null", () => {
    for (const selector of ["h1", "a", "section", "button", "[data-ascii-block]"]) {
      expect(isEmptySpace(document.querySelector(selector))).toBe(false)
    }
    expect(isEmptySpace(null)).toBe(false)
  })
})

describe("CONTENT_SELECTOR", () => {
  it("matches the layout children and block elements only", () => {
    const matched = Array.from(document.querySelectorAll(CONTENT_SELECTOR))

    expect(matched).toEqual([
      document.querySelector("section"),
      document.querySelector("[data-ascii-block]"),
    ])
  })
})
