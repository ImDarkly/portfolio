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
        alt={project.title}
        className="aspect-[16/9] w-full object-cover"
        loading="lazy"
      />
    </a>
  )
}
