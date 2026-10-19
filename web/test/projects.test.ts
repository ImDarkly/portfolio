import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { checkProjects } from "../scripts/check-projects"

const projectsDir = fileURLToPath(
  new URL("../src/content/projects", import.meta.url)
)

describe("projects content integrity", () => {
  it("has no missing slug/image and no duplicate slugs", () => {
    expect(checkProjects(projectsDir)).toEqual([])
  })
})
