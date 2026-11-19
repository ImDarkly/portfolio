type NavProject = {
  slug: string
  order: number
  hideFromHome: boolean
}

export function getProjectNeighbours<T extends NavProject>(
  projects: T[],
  slug: string
): { prev: T; next: T } | null {
  const visible = projects
    .filter((project) => !project.hideFromHome)
    .sort((a, b) => a.order - b.order)
  const index = visible.findIndex((project) => project.slug === slug)

  if (index === -1 || visible.length < 2) {
    return null
  }

  return {
    prev: visible[(index - 1 + visible.length) % visible.length],
    next: visible[(index + 1) % visible.length],
  }
}
