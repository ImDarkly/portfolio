import type { Scene } from "../types"

export type SceneName = "clouds"

export const sceneLoaders: Record<
  SceneName,
  () => Promise<{ default: () => Scene }>
> = {
  clouds: () => import("./clouds"),
}
