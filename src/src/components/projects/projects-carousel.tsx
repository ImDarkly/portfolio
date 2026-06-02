import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import type { Project } from "@/lib/sanity"

import { CarouselFraction } from "./carousel-fraction"
import { ProjectSlide } from "./project-slide"

type ProjectsCarouselProps = {
  projects: Project[]
}

export function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <div className="relative">
        <CarouselPrevious />
        <CarouselNext />
        <CarouselContent className="-ml-4">
          {projects.map((project) => (
            <CarouselItem key={project.title} className="basis-full pl-4">
              <ProjectSlide project={project} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
      <div className="mt-2 flex justify-center">
        <CarouselFraction />
      </div>
    </Carousel>
  )
}
