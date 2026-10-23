import { describe, expect, it } from "vitest"

import { cn } from "../src/lib/utils"

describe("cn", () => {
  it("merges conflicting Tailwind classes with the last one winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  it("joins conditional class names", () => {
    expect(cn("text-sm", false, null, undefined, "font-bold")).toBe(
      "text-sm font-bold"
    )
  })
})
