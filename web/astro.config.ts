import { fileURLToPath } from "node:url"

import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import type { AstroIntegration } from "astro"
import { defineConfig } from "astro/config"

import { checkProjects } from "./scripts/check-projects"

const projectsDir = fileURLToPath(
  new URL("./src/content/projects", import.meta.url)
)

function contentIntegrity(): AstroIntegration {
  return {
    name: "content-integrity",
    hooks: {
      "astro:build:start": () => {
        const errors = checkProjects(projectsDir)

        if (errors.length > 0) {
          throw new Error(
            `Content integrity check failed:\n${errors
              .map((error) => `- ${error}`)
              .join("\n")}`
          )
        }
      },
    },
  }
}

export default defineConfig({
  site: "https://hryhorchuk.vercel.app",
  trailingSlash: "ignore",
  integrations: [mdx(), react(), contentIntegrity()],
  vite: {
    plugins: [tailwindcss()],
  },
})
