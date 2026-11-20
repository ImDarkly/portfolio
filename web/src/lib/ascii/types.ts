export type Tone = "fg" | "muted" | "accent"

export interface Grid {
  cols: number
  rows: number
  cellW: number
  cellH: number
  width: number
  height: number
}

export interface Pointer {
  x: number
  y: number
  vx: number
  vy: number
  inside: boolean
}

export interface Painter {
  put(ch: string, col: number, row: number, tone: Tone, alpha?: number): void
  text(s: string, col: number, row: number, tone: Tone, alpha?: number): void // skips spaces
}

export interface Scene {
  resize(grid: Grid): void
  update(dt: number, time: number, pointer: Pointer): void // dt in 60fps frames, time in ms
  draw(p: Painter, time: number): void
  action(x: number, y: number, time: number): void // click/tap on empty space, px
  demo(x: number, y: number, time: number): void // the one-time self-demo
}

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}
