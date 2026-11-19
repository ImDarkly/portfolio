type PersonInput = {
  name: string
  url: string
  sameAs: string[]
}

export function personJsonLd({ name, url, sameAs }: PersonInput) {
  const links = sameAs.filter((link) => link.length > 0)

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    ...(links.length > 0 ? { sameAs: links } : {}),
  }
}

export function serializeJsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
