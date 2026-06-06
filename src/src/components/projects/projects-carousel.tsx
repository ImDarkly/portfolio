import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Project } from "@/lib/sanity"

import { CarouselFraction } from "./carousel-fraction"
import { ProjectSlide } from "./project-slide"

type ProjectsCarouselProps = {
  projects: Project[]
}

export function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <div className="mb-4 flex items-center justify-between">
        <CarouselFraction />
        <div className="flex gap-2">
          <CarouselPrevious className="static translate-x-0 translate-y-0" />
          <CarouselNext className="static translate-x-0 translate-y-0" />
        </div>
      </div>
      <div className="relative">
        <CarouselContent className="-ml-4">
          {projects.map((project) => (
            <CarouselItem key={project.title} className="basis-full pl-4">
              <ProjectSlide project={project} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
    </Carousel>
  )
}
