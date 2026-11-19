import { describe, expect, it } from "vitest"

import { personJsonLd, serializeJsonLd } from "../src/lib/json-ld"

describe("personJsonLd", () => {
  it("uses only the given name, url and profile links", () => {
    expect(
      personJsonLd({
        name: "Jane Doe",
        url: "https://example.com/",
        sameAs: ["https://github.com/jane", "https://www.linkedin.com/in/jane"],
      })
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Jane Doe",
      url: "https://example.com/",
      sameAs: ["https://github.com/jane", "https://www.linkedin.com/in/jane"],
    })
  })

  it("drops empty profile links and omits sameAs when none remain", () => {
    expect(
      personJsonLd({ name: "Jane Doe", url: "https://example.com/", sameAs: ["", ""] })
    ).not.toHaveProperty("sameAs")
  })
})

describe("serializeJsonLd", () => {
  it("cannot close the surrounding script tag", () => {
    const json = serializeJsonLd({ name: "</script><b>" })

    expect(json).not.toContain("<")
    expect(JSON.parse(json)).toEqual({ name: "</script><b>" })
  })
})
