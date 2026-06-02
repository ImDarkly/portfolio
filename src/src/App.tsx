import { HomePage } from "@/pages/home-page"
import { ProjectPage } from "@/pages/project-page"
import { useLocationPath } from "@/hooks/use-location-path"

export function App() {
  const path = useLocationPath()

  if (path.startsWith("/project/")) {
    const slug = path.split("/").filter(Boolean).at(-1) ?? ""

    return <ProjectPage slug={slug} />
  }

  return <HomePage />
}

export default App
