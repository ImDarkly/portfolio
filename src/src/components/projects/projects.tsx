import { useEffect, useMemo, useState } from "react"

import { Section } from "@/components/layout/section"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel"
import { getProjects, type Project } from "@/lib/sanity"

import { ProjectCard } from "./project-card"

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
