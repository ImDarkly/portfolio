import type { Scene } from "../types"

export type SceneName = "clouds" | "mova"

export const sceneLoaders: Record<
  SceneName,
  () => Promise<{ default: () => Scene }>
> = {
  clouds: () => import("./clouds"),
  mova: () => import("./mova-tiles"),
}

export function sceneForProject(slug: string): SceneName | null {
  return slug === "mova" ? "mova" : null
}
