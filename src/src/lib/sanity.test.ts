import { afterEach, describe, expect, it, vi } from "vitest"

import { getProjectBySlug, getProjects, sanityClient } from "./sanity"

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
    ] as never)

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

describe("getProjectBySlug", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("finds a project by slug generated from its title", async () => {
    vi.stubEnv("VITE_SANITY_PROJECT_ID", "project-id")
    vi.stubEnv("VITE_SANITY_DATASET", "dataset")

    vi.spyOn(sanityClient, "fetch").mockResolvedValue([
      {
        title: "My First Project",
        description: "Desc",
        techStack: ["React"],
        image: { _type: "image", asset: { _ref: "image-a" } },
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/example/a",
        note: null,
        order: 1,
      },
    ] as never)

    await expect(getProjectBySlug("my-first-project")).resolves.toEqual({
      title: "My First Project",
      description: "Desc",
      techStack: ["React"],
      image: { _type: "image", asset: { _ref: "image-a" } },
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example/a",
      note: null,
      order: 1,
    })
  })

  it("returns null when no slug matches", async () => {
    vi.stubEnv("VITE_SANITY_PROJECT_ID", "project-id")
    vi.stubEnv("VITE_SANITY_DATASET", "dataset")

    vi.spyOn(sanityClient, "fetch").mockResolvedValue([
      {
        title: "Another Project",
        description: "Desc",
        techStack: ["React"],
        image: { _type: "image", asset: { _ref: "image-a" } },
        liveUrl: null,
        githubUrl: "https://github.com/example/a",
        note: null,
        order: 1,
      },
    ] as never)

    await expect(getProjectBySlug("missing")).resolves.toBeNull()
  })
})
