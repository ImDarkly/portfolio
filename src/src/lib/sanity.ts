import { createClient } from "@sanity/client"
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

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET

export const sanityClient = createClient({
  projectId: projectId ?? "",
  dataset: dataset ?? "",
  apiVersion: "2025-05-31",
  useCdn: false,
})

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
  if (!projectId) {
    throw new Error("Missing VITE_SANITY_PROJECT_ID")
  }

  if (!dataset) {
    throw new Error("Missing VITE_SANITY_DATASET")
  }

  const documents = await sanityClient.fetch<SanityProjectDocument[]>(projectsQuery)

  return documents.filter(isProjectDocument).map(mapProject).sort((a, b) => a.order - b.order)
}
