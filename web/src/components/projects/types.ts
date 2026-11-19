export type ProjectImage = {
  src: string
  srcSet: string
}

export type ProjectCard = {
  title: string
  slug: string
  summary: string
  description: string
  tech: string[]
  image: ProjectImage
}
