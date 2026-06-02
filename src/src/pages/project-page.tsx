import { navigate } from "@/hooks/use-location-path"

type ProjectPageProps = {
  slug: string
}

export function ProjectPage({ slug }: ProjectPageProps) {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6">
      <div className="flex w-full max-w-2xl flex-col gap-4 text-left">
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Project
        </p>
        <h1 className="font-heading text-3xl lowercase text-white sm:text-4xl">
          {slug || "project"}
        </h1>
        <p className="text-sm lowercase text-muted-foreground">
          full project details will be added in a future issue.
        </p>
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault()
            navigate("/")
          }}
          className="font-heading text-xs uppercase tracking-[0.18em] text-white"
        >
          back home
        </a>
      </div>
    </main>
  )
}
