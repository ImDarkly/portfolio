import type { ReactNode } from "react"

type SectionProps = {
  label: string
  children: ReactNode
}

export function Section({ label, children }: SectionProps) {
  return (
    <section className="flex w-full flex-col items-start gap-2">
      <h2 className="font-heading text-2xl font-medium lowercase text-white sm:text-3xl">
        {label}
      </h2>
      <div className="w-full">{children}</div>
    </section>
  )
}
