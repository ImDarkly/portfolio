import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { checkProjects } from "../scripts/check-projects"

const temporaryDirs: string[] = []

function makeProjectsDir(files: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "portfolio-projects-"))
  temporaryDirs.push(dir)

  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), contents)
  }

  return dir
}

afterEach(() => {
  for (const dir of temporaryDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe("checkProjects", () => {
  it("reports files without a frontmatter block", () => {
    const dir = makeProjectsDir({ "no-frontmatter.mdx": "# Project" })

    expect(checkProjects(dir)).toEqual([
      "no-frontmatter.mdx: missing frontmatter block",
    ])
  })

  it("reports missing slug and image fields", () => {
    const dir = makeProjectsDir({
      "incomplete.mdx": "---\ntitle: Project\n---\n",
    })

    expect(checkProjects(dir)).toEqual([
      'incomplete.mdx: missing "slug"',
      'incomplete.mdx: missing "image"',
    ])
  })

  it("reports duplicate slugs with both file names", () => {
    const dir = makeProjectsDir({
      "first.mdx": '---\nslug: "project"\nimage: "./cover.png"\n---\n',
      "second.mdx": '---\nslug: "project"\nimage: "./cover.png"\n---\n',
    })

    const errors = checkProjects(dir)

    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('duplicate slug "project"')
    expect(errors[0]).toContain("first.mdx")
    expect(errors[0]).toContain("second.mdx")
  })
})
