import { useEffect, useState } from "react"

import { getProjects, type Project } from "@/lib/sanity"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      try {
        const items = await getProjects()

        if (!cancelled) {
          setProjects(items)
        }
      } catch {
        if (!cancelled) {
          setError("projects unavailable")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      cancelled = true
    }
  }, [])

  return { projects, isLoading, error }
}
