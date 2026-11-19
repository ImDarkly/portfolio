import type { ProjectCard } from "./types"

type ProjectSlideProps = {
  project: ProjectCard
  priority?: boolean
}

export function ProjectSlide({ project, priority = false }: ProjectSlideProps) {
  return (
    <a
      href={`/project/${project.slug}`}
      className="group relative block w-full cursor-pointer"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex aspect-[16/9] flex-col justify-end gap-2 bg-background/95 p-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      >
        <span className="font-sans text-xs leading-5 lowercase text-foreground sm:text-sm">
          {project.description}
        </span>
        <span className="flex flex-wrap gap-1.5">
          {project.tech.map((item) => (
            <span
              key={item}
              className="border border-border px-1.5 py-0.5 font-heading text-[11px] lowercase text-foreground"
            >
              {item}
            </span>
          ))}
        </span>
      </div>
      <img
        src={project.image.src}
        srcSet={project.image.srcSet}
        sizes="(min-width: 672px) 672px, calc(100vw - 2rem)"
        alt=""
        width={1600}
        height={900}
        className="aspect-[16/9] w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
      <div className="mt-2 flex flex-col gap-1">
        <h3 className="font-heading text-sm font-medium lowercase text-foreground">
          {project.title}
        </h3>
        <p className="font-sans text-xs leading-5 lowercase text-muted-foreground sm:text-sm">
          {project.summary}
        </p>
      </div>
    </a>
  )
}
