import { fileURLToPath } from "node:url"

import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import type { AstroIntegration } from "astro"
import { defineConfig } from "astro/config"
import { loadEnv } from "vite"

import { checkEnv } from "./scripts/check-env"
import { checkProjects } from "./scripts/check-projects"

const projectsDir = fileURLToPath(
  new URL("./src/content/projects", import.meta.url)
)

const envDir = fileURLToPath(new URL("./", import.meta.url))

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

function requiredEnv(): AstroIntegration {
  return {
    name: "required-env",
    hooks: {
      "astro:build:start": () => {
        const env = loadEnv("production", envDir, "PUBLIC_")
        const errors = checkEnv(env)

        if (errors.length > 0) {
          throw new Error(
            `Required environment variables check failed:\n${errors
              .map((error) => `- ${error}`)
              .join("\n")}\nCopy web/.env.example to web/.env and fill in the values.`
          )
        }
      },
    },
  }
}

export default defineConfig({
  site: "https://hryhorchuk.vercel.app",
  trailingSlash: "ignore",
  integrations: [mdx(), react(), contentIntegrity(), requiredEnv()],
  vite: {
    plugins: [tailwindcss()],
  },
})
