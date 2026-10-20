import { describe, expect, it } from "vitest"

import { checkEnv } from "../scripts/check-env"

describe("required environment variables", () => {
  it("reports every missing variable", () => {
    expect(checkEnv({})).toEqual([
      "PUBLIC_GITHUB is missing or empty",
      "PUBLIC_LINKEDIN is missing or empty",
      "PUBLIC_EMAIL is missing or empty",
    ])
  })

  it("treats empty and whitespace-only values as missing", () => {
    expect(
      checkEnv({
        PUBLIC_GITHUB: "",
        PUBLIC_LINKEDIN: "  ",
        PUBLIC_EMAIL: "you@example.com",
      })
    ).toEqual([
      "PUBLIC_GITHUB is missing or empty",
      "PUBLIC_LINKEDIN is missing or empty",
    ])
  })

  it("passes when every variable is set", () => {
    expect(
      checkEnv({
        PUBLIC_GITHUB: "https://github.com/your-handle",
        PUBLIC_LINKEDIN: "https://www.linkedin.com/in/your-handle",
        PUBLIC_EMAIL: "you@example.com",
      })
    ).toEqual([])
  })
})
