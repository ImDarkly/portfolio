import { mountBackdrop } from "./engine"
import { type SceneName, sceneLoaders } from "./scenes"

interface StartOptions {
  idle?: (cb: () => void) => void
}

const defaultIdle = (cb: () => void) => {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(cb, { timeout: 1500 })
  } else {
    setTimeout(cb, 200)
  }
}

let started = false

export function startBackdrops({ idle = defaultIdle }: StartOptions = {}) {
  if (started) return
  started = true

  let teardown: (() => void) | null = null
  // Bumped on every page change so a slow scene load can tell it is stale.
  let generation = 0

  document.addEventListener("astro:page-load", () => {
    const current = ++generation
    const canvas = document.querySelector<HTMLCanvasElement>(
      "canvas[data-ascii-backdrop]"
    )
    const load = canvas && sceneLoaders[canvas.dataset.scene as SceneName]
    if (!canvas || !load) return

    idle(() => {
      load()
        .then((mod) => {
          if (current !== generation) return
          teardown = mountBackdrop(canvas, mod.default())
        })
        // A failed chunk (e.g. a stale tab after a deploy) just means no backdrop.
        .catch(() => {})
    })
  })

  document.addEventListener("astro:before-swap", () => {
    generation++
    teardown?.()
    teardown = null
  })
}
