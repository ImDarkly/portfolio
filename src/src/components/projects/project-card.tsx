import { RiArrowRightUpLine } from "@remixicon/react"
import imageUrlBuilder from "@sanity/image-url"

import { sanityClient, type Project } from "@/lib/sanity"

function getImageUrl(source: Project["image"]) {
  return imageUrlBuilder(sanityClient)
    .image(source)
    .width(1200)
    .height(900)
    .url()
}

export function ProjectCard({ project }: { project: Project }) {
  const imageUrl = getImageUrl(project.image)

  return (
    <article className="flex h-full flex-col gap-4 border border-border bg-background p-4 text-sm text-muted-foreground sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-medium text-white lowercase sm:text-xl">
            {project.title}
          </h3>
          <p className="mt-1 leading-6 lowercase">{project.description}</p>
        </div>
        {project.note ? (
          <p className="shrink-0 font-heading text-[11px] tracking-[0.2em] text-white uppercase">
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
            className="border border-border px-2 py-1 font-heading text-[11px] tracking-[0.16em] text-white uppercase"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-2 font-heading text-[11px] tracking-[0.18em] text-white uppercase">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1"
        >
          Code
          <RiArrowRightUpLine />
        </a>
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1"
          >
            Live
            <RiArrowRightUpLine />
          </a>
        ) : null}
      </div>
    </article>
  )
}
