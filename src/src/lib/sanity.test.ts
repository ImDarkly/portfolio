import { afterEach, describe, expect, it, vi } from "vitest"

import { getProjects, sanityClient } from "./sanity"

describe("getProjects", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("maps, normalizes nulls, and sorts projects by order", async () => {
    vi.stubEnv("VITE_SANITY_PROJECT_ID", "project-id")
    vi.stubEnv("VITE_SANITY_DATASET", "dataset")

    const fetchSpy = vi.spyOn(sanityClient, "fetch").mockResolvedValue([
      {
        title: "B project",
        description: "Second",
        techStack: ["TypeScript"],
        image: { _type: "image", asset: { _ref: "image-b" } },
        liveUrl: null,
        githubUrl: "https://github.com/example/b",
        note: null,
        order: 20,
      },
      {
        title: "A project",
        description: "First",
        techStack: ["React", "Sanity"],
        image: { _type: "image", asset: { _ref: "image-a" } },
        liveUrl: "https://example.com/a",
        githubUrl: "https://github.com/example/a",
        note: "Featured",
        order: 10,
      },
    ])

    const projects = await getProjects()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(projects).toEqual([
      {
        title: "A project",
        description: "First",
        techStack: ["React", "Sanity"],
        image: { _type: "image", asset: { _ref: "image-a" } },
        liveUrl: "https://example.com/a",
        githubUrl: "https://github.com/example/a",
        note: "Featured",
        order: 10,
      },
      {
        title: "B project",
        description: "Second",
        techStack: ["TypeScript"],
        image: { _type: "image", asset: { _ref: "image-b" } },
        liveUrl: null,
        githubUrl: "https://github.com/example/b",
        note: null,
        order: 20,
      },
    ])
  })
})
