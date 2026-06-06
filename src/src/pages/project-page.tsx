import { useEffect, useState } from "react"

import { RiArrowRightLine, RiArrowLeftLine } from "@remixicon/react"
import imageUrlBuilder from "@sanity/image-url"

import { navigate } from "@/hooks/use-location-path"
import { sanityClient, getProjectBySlug, type Project } from "@/lib/sanity"

type ProjectPageProps = {
  slug: string
}

function getImageUrl(source: Project["image"]) {
  return imageUrlBuilder(sanityClient)
    .image(source)
    .width(1600)
    .height(900)
    .url()
}

function LoadingState() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6">
      <div className="flex w-full max-w-2xl flex-col gap-4 text-left">
        <p className="font-heading text-xs text-muted-foreground uppercase">
          Project
        </p>
        <p className="font-sans text-sm text-muted-foreground lowercase">
          loading project
        </p>
      </div>
    </main>
  )
}

function NotFoundState() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6">
      <div className="flex w-full max-w-2xl flex-col gap-6 text-left">
        <div className="flex flex-col gap-3">
          <p className="font-heading text-xs text-muted-foreground uppercase">
            404
          </p>
          <h1 className="font-heading text-3xl text-foreground sm:text-5xl">
            project not found
          </h1>
          <p className="max-w-prose font-sans text-sm leading-6 text-muted-foreground sm:text-base">
            We could not find a project for this slug.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 self-start border border-border bg-transparent px-4 py-2 font-heading text-xs text-muted-foreground lowercase transition-colors hover:text-foreground"
          >
            <RiArrowLeftLine className="size-3.5" />
            back home
          </button>
        </div>
      </div>
    </main>
  )
}

function ProjectDetail({ project }: { project: Project }) {
  const imageUrl = getImageUrl(project.image)

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6">
      <div className="flex w-full max-w-2xl flex-col gap-5 text-left">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 self-start border border-border bg-transparent px-4 py-2 font-heading text-xs text-muted-foreground lowercase transition-colors hover:text-foreground"
        >
          <RiArrowLeftLine className="size-3.5" />
          back home
        </button>

        <div className="flex flex-col gap-5">
          <h1 className="font-heading text-4xl leading-none font-medium break-words text-foreground sm:text-6xl">
            {project.title}
          </h1>

          <img
            src={imageUrl}
            alt={project.title}
            loading="lazy"
            className="aspect-video w-full border border-border object-cover"
          />

          <div className="flex flex-col gap-4">
            <p className="max-w-3xl font-sans text-sm leading-6 text-foreground sm:text-base">
              {project.description}
            </p>

            {project.note ? (
              <p className="max-w-3xl font-sans text-sm leading-6 text-muted-foreground">
                {project.note}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={`${project.title}-${tech}`}
                  className="border border-border px-2 py-1 font-heading text-[11px] text-foreground lowercase"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-[#181717] bg-[#181717] px-4 py-2 font-heading text-xs text-white lowercase transition-colors hover:bg-[#181717]/90"
              >
                github
                <RiArrowRightLine className="size-3.5" />
              </a>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-emerald-500 bg-emerald-500 px-4 py-2 font-heading text-xs text-background lowercase transition-colors hover:bg-emerald-500/90"
                >
                  live demo
                  <RiArrowRightLine className="size-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export function ProjectPage({ slug }: ProjectPageProps) {
  const [project, setProject] = useState<Project | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    async function loadProject() {
      try {
        setProject(undefined)
        const foundProject = await getProjectBySlug(slug)

        if (!cancelled) {
          setProject(foundProject)
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load project:", error)
          setProject(null)
        }
      }
    }

    loadProject()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (project === undefined) {
    return <LoadingState />
  }

  if (project === null) {
    return <NotFoundState />
  }

  return <ProjectDetail project={project} />
}
