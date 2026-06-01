import { Section } from "@/components/section"

const projects = [
  "Portfolio redesign for a product designer",
  "Fast landing page for a SaaS launch",
  "Internal dashboard UI for a small team",
]

export function Projects() {
  return (
    <Section label="Projects">
      <ul className="grid gap-1 lowercase text-sm text-muted-foreground sm:text-base">
        {projects.map((project) => (
          <li key={project}>{project}</li>
        ))}
      </ul>
    </Section>
  )
}
