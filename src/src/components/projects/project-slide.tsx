import imageUrlBuilder from "@sanity/image-url"

import { sanityClient, projectSlug, type Project } from "@/lib/sanity"

type ProjectSlideProps = {
  project: Project
}

export function ProjectSlide({ project }: ProjectSlideProps) {
  const slug = projectSlug(project.title)
  const imageUrl = imageUrlBuilder(sanityClient).image(project.image).width(1600).height(900).url()

  return (
    <a
      href={`/project/${slug}`}
      onClick={(event) => {
        event.preventDefault()
        window.history.pushState({}, "", `/project/${slug}`)
        window.dispatchEvent(new PopStateEvent("popstate"))
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
