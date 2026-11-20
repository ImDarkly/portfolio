import { describe, expect, it } from "vitest"

import { sceneForProject, sceneLoaders } from "@/lib/ascii/scenes"

describe("sceneForProject", () => {
  it("maps mova to the mova scene", () => {
    expect(sceneForProject("mova")).toBe("mova")
  })

  it("returns null for other projects", () => {
    expect(sceneForProject("rollify")).toBeNull()
    expect(sceneForProject("unknown")).toBeNull()
  })
})

describe("sceneLoaders", () => {
  it.each(Object.entries(sceneLoaders))("%s loads a scene", async (_, load) => {
    const mod = await load()
    const scene = mod.default()

    for (const method of ["resize", "update", "draw", "action", "demo"]) {
      expect(typeof (scene as unknown as Record<string, unknown>)[method]).toBe(
        "function"
      )
    }
  })
})
