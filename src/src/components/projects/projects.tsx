import { Section } from "@/components/layout/section"

import { ProjectsCarousel } from "./projects-carousel"
import { useProjects } from "./use-projects"

export function Projects() {
  const { projects, isLoading, error } = useProjects()

  if (isLoading) {
    return (
      <Section label="Projects">
        <p className="lowercase text-sm text-muted-foreground">loading projects</p>
      </Section>
    )
  }

  if (error || projects.length === 0) {
    return (
      <Section label="Projects">
        <p className="lowercase text-sm text-muted-foreground">no projects available</p>
      </Section>
    )
  }

  return (
    <Section label="Projects">
      <ProjectsCarousel projects={projects} />
    </Section>
  )
}
