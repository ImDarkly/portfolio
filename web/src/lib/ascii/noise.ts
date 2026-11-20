const fade = (t: number) => t * t * (3 - 2 * t)

export function createNoise(rng: () => number = Math.random): (x: number, y: number) => number {
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  const value = (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = fade(x - xi)
    const yf = fade(y - yi)
    // Inlined hash lookups (hot path): perm[(perm[x & 255] + y) & 255] / 255.
    const p0 = perm[xi & 255]
    const p1 = perm[(xi + 1) & 255]
    const a = perm[(p0 + yi) & 255] / 255
    const b = perm[(p1 + yi) & 255] / 255
    const c = perm[(p0 + yi + 1) & 255] / 255
    const d = perm[(p1 + yi + 1) & 255] / 255
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf
  }

  return (x, y) => value(x, y) * 0.55 + value(x * 2.1, y * 2.1) * 0.3 + value(x * 4.3, y * 4.3) * 0.15
}
