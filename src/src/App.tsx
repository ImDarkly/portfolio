import { Contact } from "@/components/contact"
import { Hero } from "@/components/hero"
import { Projects } from "@/components/projects"

export function App() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6">
      <div className="flex w-full max-w-2xl flex-col items-start justify-center gap-5 text-left">
        <Hero />
        <Projects />
        <Contact />
      </div>
    </main>
  )
}

export default App
