import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      summary: z.string().min(1),
      tech: z.array(z.string()).min(1),
      image: image(),
      liveUrl: z.url().optional(),
      githubUrl: z.url(),
      note: z.string().optional(),
      order: z.number().int().positive(),
      hideFromHome: z.boolean().default(false),
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
    }),
})

export const collections = { projects }
