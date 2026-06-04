import { HomePage } from "@/pages/home-page"
import { ProjectPage } from "@/pages/project-page"
import { useLocationPath } from "@/hooks/use-location-path"

export function App() {
  const path = useLocationPath()

  if (path.startsWith("/project/")) {
    const rawSlug = path.split("/").filter(Boolean).at(-1) ?? ""
    let slug = rawSlug
    try {
      slug = decodeURIComponent(rawSlug)
    } catch {
      // Malformed percent-encoding; fall back to raw segment
    }

    return <ProjectPage slug={slug} />
  }

  return <HomePage />
}

export default App
