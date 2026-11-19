import { describe, expect, it } from "vitest"

import { getProjectNeighbours } from "../src/lib/project-nav"

const projects = [
  { slug: "c", order: 3, hideFromHome: false },
  { slug: "a", order: 1, hideFromHome: false },
  { slug: "hidden", order: 4, hideFromHome: true },
  { slug: "b", order: 2, hideFromHome: false },
]

describe("getProjectNeighbours", () => {
  it("links to the previous and next visible project by order", () => {
    const result = getProjectNeighbours(projects, "b")

    expect(result?.prev.slug).toBe("a")
    expect(result?.next.slug).toBe("c")
  })

  it("wraps around at the first and last project", () => {
    expect(getProjectNeighbours(projects, "a")?.prev.slug).toBe("c")
    expect(getProjectNeighbours(projects, "c")?.next.slug).toBe("a")
  })

  it("skips hidden projects and gives them no links", () => {
    expect(getProjectNeighbours(projects, "hidden")).toBeNull()
    expect(getProjectNeighbours(projects, "c")?.prev.slug).toBe("b")
  })

  it("gives no links when fewer than two projects are visible", () => {
    expect(getProjectNeighbours([projects[0]], "c")).toBeNull()
  })

  it("does not reorder the array it receives", () => {
    const input = [...projects]

    getProjectNeighbours(input, "b")

    expect(input.map((project) => project.slug)).toEqual(
      projects.map((project) => project.slug)
    )
  })
})
