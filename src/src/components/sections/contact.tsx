import { Section } from "@/components/layout/section"

type ContactLink = {
  label: string
  href: string
  external?: boolean
}

const contactLinks: ContactLink[] = [
  {
    label: "GitHub",
    href: import.meta.env.VITE_PUBLIC_GITHUB ?? "",
    external: true,
  },
  {
    label: "LinkedIn",
    href: import.meta.env.VITE_PUBLIC_LINKEDIN ?? "",
    external: true,
  },
  {
    label: import.meta.env.VITE_PUBLIC_EMAIL ?? "",
    href: import.meta.env.VITE_PUBLIC_EMAIL ?? "",
  },
].filter((link) => link.href.length > 0)

export function Contact() {
  return (
    <Section label="contact">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-normal sm:text-base">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            className="text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary"
            href={link.external ? link.href : `mailto:${link.href}`}
            rel={link.external ? "noreferrer" : undefined}
            target={link.external ? "_blank" : undefined}
          >
            {link.label}
          </a>
        ))}
      </div>
    </Section>
  )
}
