const faviconFrames = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect fill="oklch(0.153 0.006 107.1)" width="64" height="64" rx="12"/><text x="32" y="34" fill="#ffffff" font-family="JetBrains Mono, IBM Plex Mono, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="34" font-weight="600" text-anchor="middle" dominant-baseline="central">&gt;_</text></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect fill="oklch(0.153 0.006 107.1)" width="64" height="64" rx="12"/><text x="32" y="34" fill="#ffffff" font-family="JetBrains Mono, IBM Plex Mono, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="34" font-weight="600" text-anchor="middle" dominant-baseline="central">&gt;<tspan opacity="0">_</tspan></text></svg>`,
]

const faviconHref = faviconFrames.map(
  (frame) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(frame)}`
)

let faviconIntervalId: number | undefined
let frameIndex = 0

let listening = false

export function startFaviconBlink() {
  const faviconLink =
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!faviconLink) return

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

  const sync = () => {
    if (faviconIntervalId !== undefined) {
      clearInterval(faviconIntervalId)
      faviconIntervalId = undefined
    }

    frameIndex = 0
    faviconLink.href = faviconHref[frameIndex]

    if (reducedMotion.matches || document.hidden) return

    faviconIntervalId = window.setInterval(() => {
      frameIndex = (frameIndex + 1) % faviconHref.length
      faviconLink.href = faviconHref[frameIndex]
    }, 500)
  }

  sync()

  if (!listening) {
    listening = true
    reducedMotion.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)
  }
}
