import imageUrlBuilder from "@sanity/image-url"

import { navigate } from "@/hooks/use-location-path"
import { sanityClient, projectSlug, type Project } from "@/lib/sanity"

type ProjectSlideProps = {
  project: Project
}

export function ProjectSlide({ project }: ProjectSlideProps) {
  const slug = projectSlug(project.title)
  const imageUrl = imageUrlBuilder(sanityClient)
    .image(project.image)
    .width(1600)
    .height(900)
    .url()

  return (
    <a
      href={`/project/${slug}`}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }

        event.preventDefault()
        navigate(`/project/${slug}`)
      }}
      className="block w-full cursor-pointer"
    >
      <img
        src={imageUrl}
        alt={project.title}
        className="aspect-[16/9] w-full object-cover"
        loading="lazy"
      />
    </a>
  )
}
