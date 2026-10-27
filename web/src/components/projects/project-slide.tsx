import type { ProjectCard } from "./types"

type ProjectSlideProps = {
  project: ProjectCard
}

export function ProjectSlide({ project }: ProjectSlideProps) {
  return (
    <a href={`/project/${project.slug}`} className="block w-full cursor-pointer">
      <img
        src={project.image.src}
        srcSet={project.image.srcSet}
        sizes="(min-width: 672px) 672px, calc(100vw - 2rem)"
        alt=""
        className="aspect-[16/9] w-full object-cover"
        loading="lazy"
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
