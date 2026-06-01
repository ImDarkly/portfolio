import { useEffect, useMemo, useState } from "react"
import { RiArrowRightUpLine } from "@remixicon/react"
import imageUrlBuilder from "@sanity/image-url"

import { Section } from "@/components/section"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel"
import { getProjects, sanityClient, type Project } from "@/lib/sanity"

function getImageUrl(source: Project["image"]) {
  return imageUrlBuilder(sanityClient).image(source).width(1200).height(900).url()
}

function CarouselFraction() {
  const { api } = useCarousel()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [totalSlides, setTotalSlides] = useState(0)

  useEffect(() => {
    if (!api) return

    const update = () => {
      setCurrentSlide(api.selectedScrollSnap() + 1)
      setTotalSlides(api.scrollSnapList().length)
    }

    update()
    api.on("select", update)
    api.on("reInit", update)

    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  return (
    <p className="font-heading text-xs text-muted-foreground sm:text-sm">
      {currentSlide} / {totalSlides}
    </p>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const imageUrl = getImageUrl(project.image)

  return (
    <article className="flex h-full flex-col gap-4 border border-border bg-background p-4 text-sm text-muted-foreground sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-medium lowercase text-white sm:text-xl">
            {project.title}
          </h3>
          <p className="mt-1 lowercase leading-6">{project.description}</p>
        </div>
        {project.note ? (
          <p className="shrink-0 font-heading text-[11px] uppercase tracking-[0.2em] text-white">
            {project.note}
          </p>
        ) : null}
      </div>

      <img
        src={imageUrl}
        alt={project.title}
        className="aspect-[4/3] w-full border border-border object-cover"
        loading="lazy"
      />

      <div className="flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={`${project.title}-${tech}`}
            className="border border-border px-2 py-1 font-heading text-[11px] uppercase tracking-[0.16em] text-white"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-2 font-heading text-[11px] uppercase tracking-[0.18em] text-white">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1"
        >
          Code
          <RiArrowRightUpLine className="size-3.5" />
        </a>
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1"
          >
            Live
            <RiArrowRightUpLine className="size-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  )
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      try {
        const items = await getProjects()

        if (!cancelled) {
          setProjects(items)
        }
      } catch {
        if (!cancelled) {
          setError("projects unavailable")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      cancelled = true
    }
  }, [])

  const content = useMemo(() => {
    if (isLoading) {
      return <p className="lowercase text-sm text-muted-foreground">loading projects</p>
    }

    if (error || projects.length === 0) {
      return (
        <p className="lowercase text-sm text-muted-foreground">
          no projects available
        </p>
      )
    }

    return (
      <Carousel className="w-full" opts={{ loop: true }}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <CarouselFraction />
          <div className="flex items-center gap-2">
            <CarouselPrevious className="static translate-x-0 translate-y-0" />
            <CarouselNext className="static translate-x-0 translate-y-0" />
          </div>
        </div>
        <CarouselContent className="-ml-4">
          {projects.map((project) => (
            <CarouselItem key={project.title} className="basis-full pl-4">
              <ProjectCard project={project} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    )
  }, [error, isLoading, projects])

  return <Section label="Projects">{content}</Section>
}
