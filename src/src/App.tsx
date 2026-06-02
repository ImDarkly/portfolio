import { HomePage } from "@/pages/home-page"
import { ProjectPage } from "@/pages/project-page"
import { useLocationPath } from "@/hooks/use-location-path"

export function App() {
  const path = useLocationPath()

  if (path.startsWith("/project/")) {
    const slug = path.split("/").at(-1) ?? ""

    return <ProjectPage slug={slug} />
  }

  return <HomePage />
}

export default App
