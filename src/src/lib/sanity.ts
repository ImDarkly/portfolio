import { createClient } from "@sanity/client"
import type { SanityClient } from "@sanity/client"
import type { SanityImageSource } from "@sanity/image-url"

export type Project = {
  title: string
  description: string
  techStack: string[]
  image: SanityImageSource
  liveUrl: string | null
  githubUrl: string
  note: string | null
  order: number
}

export function projectSlug(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "untitled"
}

type SanityProjectDocument = {
  title?: string
  description?: string
  techStack?: string[]
  image?: SanityImageSource
  liveUrl?: string | null
  githubUrl?: string
  note?: string | null
  order?: number
}

function getSanityConfig() {
  return {
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,
  }
}

function createMissingClient(): SanityClient {
  const missingConfigError = new Error("Missing VITE_SANITY_PROJECT_ID or VITE_SANITY_DATASET")

  return {
    config() {
      const { projectId, dataset } = getSanityConfig()

      return {
        projectId: projectId ?? "",
        dataset: dataset ?? "",
      }
    },
    fetch() {
      return Promise.reject(missingConfigError)
    },
  } as unknown as SanityClient
}

const { projectId, dataset } = getSanityConfig()

export const sanityClient =
  projectId && dataset
    ? createClient({
        projectId,
        dataset,
        apiVersion: "2025-05-31",
        useCdn: false,
      })
    : createMissingClient()

const projectsQuery = /* groq */ `
  *[_type == "project"]{
    title,
    description,
    techStack,
    image,
    liveUrl,
    githubUrl,
    note,
    order
  } | order(order asc)
`

function isProjectDocument(value: SanityProjectDocument): value is Required<SanityProjectDocument> {
  return (
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    Array.isArray(value.techStack) &&
    value.techStack.every((tech) => typeof tech === "string") &&
    value.image != null &&
    typeof value.githubUrl === "string" &&
    typeof value.order === "number"
  )
}

function mapProject(document: Required<SanityProjectDocument>): Project {
  return {
    title: document.title,
    description: document.description,
    techStack: document.techStack,
    image: document.image,
    liveUrl: document.liveUrl ?? null,
    githubUrl: document.githubUrl,
    note: document.note ?? null,
    order: document.order,
  }
}

export async function getProjects(): Promise<Project[]> {
  const { projectId: currentProjectId, dataset: currentDataset } = getSanityConfig()

  if (!currentProjectId) {
    throw new Error("Missing VITE_SANITY_PROJECT_ID")
  }

  if (!currentDataset) {
    throw new Error("Missing VITE_SANITY_DATASET")
  }

  const documents = await sanityClient.fetch<SanityProjectDocument[]>(projectsQuery)

  return documents.filter(isProjectDocument).map(mapProject).sort((a, b) => a.order - b.order)
}
