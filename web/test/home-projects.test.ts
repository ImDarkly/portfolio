import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"
import { parse } from "yaml"

const projectsDir = fileURLToPath(
  new URL("../src/content/projects", import.meta.url)
)

type Frontmatter = {
  slug?: string
  order?: number
  hideFromHome?: boolean
}

function readFrontmatter(): Frontmatter[] {
  return readdirSync(projectsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = readFileSync(path.join(projectsDir, file), "utf8")
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)

      return (parse(match?.[1] ?? "") ?? {}) as Frontmatter
    })
}

describe("home carousel projects", () => {
  it("shows the projects in the configured order", () => {
    const slugs = readFrontmatter()
      .filter((data) => !data.hideFromHome)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((data) => data.slug)

    expect(slugs).toEqual([
      "space2study",
      "mova",
      "skattjakt",
      "rollify",
      "rinthloader",
    ])
  })

  it("hides mausam and bastet from the home carousel", () => {
    const hidden = readFrontmatter()
      .filter((data) => data.hideFromHome)
      .map((data) => data.slug)
      .sort()

    expect(hidden).toEqual(["bastet", "mausam"])
  })
})
