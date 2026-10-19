import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { parse } from "yaml"

export function checkProjects(projectsDir: string): string[] {
  const errors: string[] = []
  const files = readdirSync(projectsDir).filter((file) => file.endsWith(".mdx"))
  const seen = new Map<string, string>()

  for (const file of files) {
    const raw = readFileSync(path.join(projectsDir, file), "utf8")
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)

    if (!match) {
      errors.push(`${file}: missing frontmatter block`)
      continue
    }

    const data = (parse(match[1]) ?? {}) as Record<string, unknown>

    if (!data.slug) errors.push(`${file}: missing "slug"`)
    if (!data.image) errors.push(`${file}: missing "image"`)

    if (typeof data.slug === "string") {
      const previous = seen.get(data.slug)

      if (previous) {
        errors.push(
          `${file}: duplicate slug "${data.slug}" (already used by ${previous})`
        )
      } else {
        seen.set(data.slug, file)
      }
    }
  }

  return errors
}
