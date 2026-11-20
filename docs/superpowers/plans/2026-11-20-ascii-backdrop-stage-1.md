# ASCII Backdrop Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a faint, interactive character-art canvas behind the homepage (sea of clouds) and the Mova project page (letter tiles), built on a small reusable engine.

**Architecture:** A framework-free TypeScript engine in `web/src/lib/ascii/` owns the canvas, grid, loop, pointer, theme colours, fade mask and lifecycle. Scenes are plain modules implementing one interface; each page loads only its own scene with a dynamic import after the page is idle. One Astro component renders the canvas and a script mounts/unmounts it across `ClientRouter` page swaps.

**Tech Stack:** Astro 7 (`ClientRouter`), TypeScript (strict), Tailwind 4, Vitest + jsdom. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-20-ascii-backdrop-design.md` (approved). Feel reference: `docs/superpowers/specs/2026-11-20-ascii-backdrop-prototype/prototype.html` (clouds and tiles scenes, fade mask).

All paths below are relative to the repo root; run commands from `web/`.

## Global Constraints

- No new runtime or dev dependencies; no React on project pages.
- Page layout, copy, carousel and cover images unchanged (only `relative z-10` and `data-ascii-*` attributes are added).
- No hint text anywhere.
- Lighthouse CI must still pass: performance ≥ 0.9, accessibility ≥ 0.95 on `/` and `/project/mova` (`web/lighthouserc.json`).
- Colours only from tokens `--foreground`, `--muted-foreground`, `--primary`; glyph font JetBrains Mono Variable.
- Grid cell 7 × 12 px. Base alpha: dark 0.45, light 0.55. Full strength (no content near) = base × 1.3.
- Fade mask: 0.22 inside and within 8 px of a content block, easing (smoothstep) to 1.0 at 64 px away.
- Self-demo once, 1000 ms after mount; never under reduced motion.
- Reduced motion: one still frame drawn at time 8000 ms; interactions redraw the still frame with `dt = 0`.
- Never `preventDefault` on pointer, touch or wheel events.
- Pages without a scene (other projects, 404) render no canvas.
- Code style: match repo (no semicolons, double quotes, `@/` alias).

## Review Focus

1. Client-side navigation home → Mova → another project → home: the previous loop must stop, no duplicate loops, no canvas on pages without a scene. (Test in Task 5.)
2. Theme is "system" and the OS scheme flips: `theme.ts` changes the `<html>` class without firing `themechange`; glyph colours must still update. (Test in Task 2.)
3. Clicking a link, button, tag, carousel control or card, or releasing after selecting text, must not trigger a scene action. (Tests in Tasks 1 and 2.)
4. Resizing or rotating the window mid-animation: the scene re-lays out and tiles stay fully on screen. (Test in Task 4.)
5. Touch: a tap on empty space triggers the action, and nothing calls `preventDefault`, so scrolling is never blocked. (Test in Task 2.)

---

### Task 1: Shared types, fade mask and empty-space detection

**Files:**
- Create: `web/src/lib/ascii/types.ts`
- Create: `web/src/lib/ascii/fade-mask.ts`
- Create: `web/src/lib/ascii/surface.ts`
- Test: `web/test/ascii/fade-mask.test.ts`, `web/test/ascii/surface.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  ```ts
  export type Tone = "fg" | "muted" | "accent"
  export interface Grid { cols: number; rows: number; cellW: number; cellH: number; width: number; height: number }
  export interface Pointer { x: number; y: number; vx: number; vy: number; inside: boolean }
  export interface Painter {
    put(ch: string, col: number, row: number, tone: Tone, alpha?: number): void
    text(s: string, col: number, row: number, tone: Tone, alpha?: number): void // skips spaces
  }
  export interface Scene {
    resize(grid: Grid): void
    update(dt: number, time: number, pointer: Pointer): void // dt in 60fps frames, time in ms
    draw(p: Painter, time: number): void
    action(x: number, y: number, time: number): void // click/tap on empty space, px
    demo(x: number, y: number, time: number): void   // the one-time self-demo
  }
  export interface Rect { left: number; top: number; right: number; bottom: number }
  ```
- Produces (`fade-mask.ts`):
  `buildFadeMask(grid: Grid, rects: Rect[]): Float32Array` (length `cols*rows`, row-major, value per cell centre) and
  `findOpenPoint(grid: Grid, mask: Float32Array, preferRow: number): { x: number; y: number }` (px centre of the highest-mask cell on row `preferRow`, leftmost on ties).
- Produces (`surface.ts`):
  `CONTENT_SELECTOR = "[data-ascii-layout] > *, [data-ascii-block]"` and
  `isEmptySpace(target: EventTarget | null): boolean` — true only for `<html>`, `<body>`, `<main>`, or an element with `data-ascii-layout` itself (gaps between blocks).

- [ ] **Step 1: Write the failing tests**

`fade-mask.test.ts` (grid 10 cols × 4 rows, cell 10 × 10, one rect `{left:0,top:0,right:20,bottom:40}`):
- `it("is 0.22 inside and within 8px of a block")` → mask at col 0 and col 2 (centre 25px, 5px away) is `0.22` (`toBeCloseTo(0.22, 5)`).
- `it("reaches 1 at 64px or more away")` → col 9 (centre 95px, 75px away) is `1`.
- `it("rises monotonically between")` → cols 3..8 on row 0 are non-decreasing.
- `it("is 1 everywhere with no blocks")`.
- `it("findOpenPoint picks the brightest cell on the row, leftmost on ties")` → with the rect above, cols 8 and 9 (65 px and 75 px away) are both 1, so `findOpenPoint(grid, mask, 2)` returns `{ x: 85, y: 25 }`.

`surface.test.ts` (`// @vitest-environment jsdom`), markup: `<main><div data-ascii-layout><section><h1>t</h1><a href="#">l</a></section></div></main><div data-ascii-block><button>b</button></div>`:
- true for `document.documentElement`, `document.body`, `main`, the `[data-ascii-layout]` div.
- false for `h1`, `a`, `section`, `button`, the `[data-ascii-block]` div, and `null`.
- `document.querySelectorAll(CONTENT_SELECTOR)` returns exactly the `section` and the `[data-ascii-block]` div.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/ascii`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `types.ts`, `buildFadeMask`, `findOpenPoint`, `isEmptySpace`**

Mask per cell: `d` = shortest distance from the cell centre to any rect (0 inside); `k = clamp((d - 8) / 56, 0, 1)`; value `0.22 + 0.78 * smoothstep(k)` where `smoothstep(k) = k*k*(3-2k)`. Export the constants `MASK_FLOOR = 0.22`, `MASK_START = 8`, `MASK_RANGE = 56`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/ascii`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ascii test/ascii
git commit -m "feat(ascii): add backdrop types, fade mask and empty-space detection"
```

---

### Task 2: Engine

**Files:**
- Create: `web/src/lib/ascii/engine.ts`
- Test: `web/test/ascii/engine.test.ts`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces:
  ```ts
  export interface MountOptions { reducedMotion?: boolean; now?: () => number }
  export function mountBackdrop(canvas: HTMLCanvasElement, scene: Scene, options?: MountOptions): () => void // returns teardown
  export const CELL_W = 7, CELL_H = 12, DEMO_DELAY_MS = 1000, STILL_TIME_MS = 8000
  ```

Responsibilities (each is pinned by a test below):
- Size canvas to the viewport × `min(devicePixelRatio, 2)`; build `Grid`; call `scene.resize`; rebuild fade mask from `document.querySelectorAll(CONTENT_SELECTOR)` rects on resize, `scroll` (passive), `document.fonts.ready`, and a `ResizeObserver` on `document.body`.
- Colours: read `--foreground`, `--muted-foreground`, `--primary` and the resolved theme (`html.classList.contains("dark")`) on mount, on `themechange`, and via a `MutationObserver` on `<html>`'s `class` attribute. Base alpha 0.45 dark / 0.55 light.
- Painter alpha = `clamp(alpha × base × 1.3 × mask[cell], 0, 1)`; font `` `${CELL_H - 1}px "JetBrains Mono Variable", monospace` ``, `textBaseline = "top"`.
- Loop with `requestAnimationFrame`: `dt = min(3, elapsedMs / 16.67)`; pointer velocity decays ×0.85 per frame; skip frames while `document.visibilityState === "hidden"`.
- Pointer: `pointermove` on `window` updates position/velocity (ignore jumps > 200 px); `pointerleave` on `document` sets `inside = false`. All listeners `{ passive: true }`.
- `click` on `window`: if `isEmptySpace(event.target)` and `getSelection()?.toString()` is empty → `scene.action(clientX, clientY, now)`.
- Self-demo: `setTimeout(DEMO_DELAY_MS)` → `scene.demo(...findOpenPoint(grid, mask, round(rows * 0.7)), now)`; not scheduled when reduced motion.
- Reduced motion (`options.reducedMotion ?? matchMedia("(prefers-reduced-motion: reduce)").matches`): no loop; draw once with `update(0, STILL_TIME_MS, pointer)`; after an action, draw once again the same way.
- Teardown: cancel frame and timer, disconnect observers, remove every listener, clear the canvas.
- If `canvas.getContext("2d")` is null, return a no-op teardown.

- [ ] **Step 1: Write the failing tests** (`// @vitest-environment jsdom`)

Setup: stub `HTMLCanvasElement.prototype.getContext` to return a fake context recording `fillText(ch, x, y)` calls with the current `globalAlpha` and `fillStyle`; stub `requestAnimationFrame`/`cancelAnimationFrame` with a manual queue; `vi.useFakeTimers()`; a fake scene whose `draw` puts `"x"` at (0, 0) with tone `"fg"` and records calls to `update`, `action`, `demo`. Set `--foreground` etc. with `document.documentElement.style.setProperty`.

Tests:
- `it("draws scene glyphs each frame")` → after flushing two frames, `fillText` called with `"x"`.
- `it("dims glyphs over content blocks")` → add `<div data-ascii-block>` absolutely covering (0,0) via a stubbed `getBoundingClientRect`; glyph alpha ≈ `0.22 × base × 1.3` vs ≈ `base × 1.3` without it.
- `it("follows theme class changes without a themechange event")` → toggle `html.classList` `dark` ↔ `light` and change `--foreground`; after a microtask + frame, `fillStyle` is the new value and alpha uses the new base.
- `it("runs the self-demo once after 1000ms")` → `demo` not called at 999 ms, called once at 1000 ms, still once at 5000 ms.
- `it("triggers action on a click on empty space only")` → click dispatched on `main` calls `action`; click on an `<a>` inside `[data-ascii-layout] > section` does not; click on `main` while `getSelection` returns `"text"` does not.
- `it("never prevents default")` → dispatched `pointermove`, `pointerdown`, `click` events all have `defaultPrevented === false`.
- `it("does not animate or demo under reduced motion")` → `mountBackdrop(canvas, scene, { reducedMotion: true })`: `update` called once with `dt` 0 and time 8000; `requestAnimationFrame` never called; no `demo` after 5000 ms; a click on `main` calls `action` then one more `draw`.
- `it("pauses while the tab is hidden")` → with `visibilityState` stubbed `"hidden"`, flushing frames does not call `update`.
- `it("stops everything on teardown")` → after teardown, flushing frames and timers calls nothing; a click calls no `action`.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/ascii/engine.test.ts`
Expected: FAIL, `mountBackdrop` not found.

- [ ] **Step 3: Implement `mountBackdrop` in `web/src/lib/ascii/engine.ts`** as specified above.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run test/ascii`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ascii/engine.ts test/ascii/engine.test.ts
git commit -m "feat(ascii): add backdrop engine with fade mask, theme and lifecycle"
```

---

### Task 3: Sea of clouds scene

**Files:**
- Create: `web/src/lib/ascii/noise.ts`
- Create: `web/src/lib/ascii/scenes/clouds.ts`
- Test: `web/test/ascii/clouds.test.ts`

**Interfaces:**
- Consumes: `Scene`, `Grid`, `Pointer`, `Painter` (Task 1).
- Produces:
  `createNoise(rng?: () => number): (x: number, y: number) => number` (fbm, 3 octaves weighted 0.55 / 0.3 / 0.15 at frequency ×1, ×2.1, ×4.3, output in [0, 1]);
  `export default function createClouds(rng?: () => number): Scene & { density(col: number, row: number, time: number): number }`.

Values from the prototype (`prototype.html`, `clouds` object), keep them:
- Cloud band from `rows × 0.42` down; strength ramps from 0 at `rows × 0.52` to full at `rows × 0.72`.
- Density `(fbm(col × 0.04 + t × 0.06, row × 0.13 + t × 0.01) − 0.38) × 2.4 × band`, `t` in seconds. Draw when > 0.1 using `" .-:=+*"` by density, tone `"fg"`, alpha `0.25 + d × 0.6`.
- Pointer marks: one every 40 ms while the pointer moves inside; up to 60; life 2600 ms; effect `d *= 1 − 0.9 × exp(−(dist/70)²) × (1 − age/2.6s)`, `dist = hypot(dx, dy × 1.4)` in px.
- Gust (action and demo): ring radius `age × 380 px/s`, half-width 50 px, life 1600 ms, `d *= 1 − 0.85 × (1 − ring/50) × (1 − age/1.6s)`.
- Teide summit where there is no cloud: apex column `cols × (width < 1024 ? 0.78 : 0.93)`, apex row `rows × 0.6`, half-width `rise × 1.6`; edges `/` `\`, apex `^`, top two rows tone `"accent"`, sparse `.` fill every third cell, alpha 0.7 / 0.35.

- [ ] **Step 1: Write the failing tests** (deterministic `rng` from a seeded LCG)
- `it("noise stays within 0..1")` over a 50 × 50 sample.
- `it("has no clouds above the band")` → `density(c, floor(rows × 0.4), t) === 0` for all `c`.
- `it("parts clouds where the pointer moved")` → pick a cell with density > 0.3 at time T; `update(1, T, pointer at that cell's centre, moving)`; density there at T+10 is < 30% of before; at T+3000 it is back within 5% of the undisturbed value.
- `it("a gust clears a ring that travels outward")` → `action(x, y, T)`; at T+200 a cell ~76 px away is reduced by > 50%; at T+2000 it is undisturbed.
- `it("demo is a gust")` → `demo(x, y, T)` has the same effect as `action` in the previous test.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/ascii/clouds.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `createNoise` and `createClouds`.**

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run test/ascii` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ascii/noise.ts src/lib/ascii/scenes/clouds.ts test/ascii/clouds.test.ts
git commit -m "feat(ascii): add sea of clouds scene"
```

---

### Task 4: Mova letter tiles scene

**Files:**
- Create: `web/src/lib/ascii/scenes/mova-tiles.ts`
- Test: `web/test/ascii/mova-tiles.test.ts`

**Interfaces:**
- Consumes: Task 1 types.
- Produces:
  `export const WORDS = ["hello", "react", "ship it", "tenerife", "hola", "mova", "hi there"]`;
  `export default function createMovaTiles(rng?: () => number): Scene & { tiles: readonly Tile[]; spell(word: string, x: number, y: number, time: number): void }`
  where `interface Tile { x: number; y: number; vx: number; vy: number; ch: string; target: { x: number; y: number; ch: string } | null }` (px, top-left of the 3 × 3-cell tile).

Behaviour (values from the prototype `tiles` object):
- Tile count: 6 when `width < 640`, else 9. Initial letters cycle `"MOVA"`. Tile drawn as `┌─┐` / `│L│` / `└─┘`, frame tone `"fg"` alpha 0.6, letter tone `"accent"` alpha 1.6 once placed, else `"fg"` 0.9.
- Drift: random nudge ±0.02 per frame, max speed 1.6 px/frame, damping 0.985, minimum-motion kick below 0.15; bounce inside `[4, width − 3·cellW − 4] × [4, height − 3·cellH − 4]`; repel from pointer within 110 px with force 0.25.
- `spell(word, x, y, time)`: uppercase; letters spaced 4 cells; row centred on `x`, clamped so the whole word is ≥ 8 px from both edges; row top at `y − cellH`, clamped to `[8, height − 4·cellH]`; spaces leave a gap; the tiles nearest to `(x, y)` get the targets, others get `target = null`; release at `time + 3800`.
- Targeted tiles ease at `0.12 × dt`; until within 3 px they flicker a random letter every 3 frames from `"ABCDEFGHIJKLMNOPRSTUVWY"`, then show the target letter.
- On release: clear targets and give each released tile velocity ±1.5.
- `action` spells a random word from `WORDS` whose letter count (spaces removed) ≤ tile count; `demo` spells `"MOVA"`.
- `resize` keeps existing tiles and clamps them into the new bounds; it re-creates tiles only when the count changes.

- [ ] **Step 1: Write the failing tests** (`rng` seeded; grid 1280 × 800, cell 7 × 12)
- `it("starts with 9 tiles on desktop and 6 on phones")`.
- `it("spells the word in order, centred on the point")` → `spell("mova", 640, 400, 0)`: 4 targets with letters `M,O,V,A`, x positions `640 − 2·28 + i·28`, all `y === 388`.
- `it("keeps a long word fully on screen near an edge")` → `spell("tenerife", 10, 400, 0)`: min target x ≥ 8 and max target x + 3·7 ≤ 1280 − 8.
- `it("leaves a gap for spaces")` → `spell("ship it", ...)`: 6 targets, gap of 2 steps between `P` and `I`.
- `it("shows target letters once arrived and releases after 3800ms")` → after enough `update` calls the targeted tiles show their target letters; `update(1, 3801, pointer)` clears all targets.
- `it("picks only words that fit")` → with 6 tiles, 50 `action` calls never target more than 6 tiles.
- `it("demo spells MOVA")`.
- `it("keeps tiles on screen after shrinking the viewport")` → start at 600 × 800 (6 tiles), `resize` to 400 × 600: still 6 tiles, every tile within the new bounds.

- [ ] **Step 2: Run to verify failure** — `npx vitest run test/ascii/mova-tiles.test.ts`, Expected: FAIL.

- [ ] **Step 3: Implement `createMovaTiles`.**

- [ ] **Step 4: Run to verify pass** — `npx vitest run test/ascii`, Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ascii/scenes/mova-tiles.ts test/ascii/mova-tiles.test.ts
git commit -m "feat(ascii): add mova letter tiles scene"
```

---

### Task 5: Wire into the site

**Files:**
- Create: `web/src/lib/ascii/scenes/index.ts`
- Create: `web/src/lib/ascii/start.ts`
- Create: `web/src/components/ascii/AsciiBackdrop.astro`
- Modify: `web/src/pages/index.astro` (add backdrop; `relative z-10` on `<main>`; `data-ascii-layout` on the grid `div`)
- Modify: `web/src/pages/project/[slug].astro` (backdrop when the slug has a scene; `relative z-10` on `<main>`; `data-ascii-layout` on the inner `flex flex-col gap-5` column div)
- Modify: `web/src/components/ui/ThemeToggle.astro` (add `data-ascii-block` to the group div)
- Test: `web/test/ascii/start.test.ts`, `web/test/ascii/scenes.test.ts`

**Interfaces:**
- Consumes: `mountBackdrop` (Task 2), `createClouds` (Task 3), `createMovaTiles` (Task 4).
- Produces:
  ```ts
  // scenes/index.ts
  export type SceneName = "clouds" | "mova"
  export const sceneLoaders: Record<SceneName, () => Promise<{ default: () => Scene }>> // dynamic import() per scene
  export function sceneForProject(slug: string): SceneName | null // "mova" → "mova", else null
  // start.ts
  export function startBackdrops(options?: { idle?: (cb: () => void) => void }): void
  ```
- `startBackdrops` listens to `astro:page-load`: finds `canvas[data-ascii-backdrop]`; if present, waits for `idle` (default `requestIdleCallback` with `{ timeout: 1500 }`, falling back to `setTimeout(cb, 200)`), loads `sceneLoaders[canvas.dataset.scene]`, and mounts unless the page changed meanwhile. On `astro:before-swap` it tears down the current mount. Unknown scene names do nothing.
- `AsciiBackdrop.astro` props `{ scene: SceneName }`, renders
  `<canvas data-ascii-backdrop data-scene={scene} aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 h-svh w-screen" />` plus `<script>import { startBackdrops } from "@/lib/ascii/start"; startBackdrops()</script>`.

- [ ] **Step 1: Write the failing tests**

`scenes.test.ts`:
- `sceneForProject("mova") === "mova"`; `sceneForProject("rollify") === null`; `sceneForProject("unknown") === null`.
- every `sceneLoaders` entry resolves to a module whose `default()` returns an object with `resize`, `update`, `draw`, `action`, `demo` functions.

`start.test.ts` (`// @vitest-environment jsdom`, `vi.mock("@/lib/ascii/engine")` so `mountBackdrop` returns a spy teardown; `idle` runs the callback synchronously):
- `it("mounts the page's scene on page load")` → body with `<canvas data-ascii-backdrop data-scene="clouds">`, dispatch `astro:page-load`, await loader → `mountBackdrop` called once with that canvas.
- `it("tears down before a swap and mounts the next page")` → page-load (clouds), `astro:before-swap` → teardown called once; replace body with `data-scene="mova"` canvas; page-load → second mount; exactly one live mount.
- `it("mounts nothing on pages without a canvas")` → page-load with no canvas → `mountBackdrop` not called, and a later `astro:before-swap` does not throw.
- `it("does not mount if the page changed before the scene loaded")` → page-load, then `astro:before-swap` before the loader resolves → `mountBackdrop` never called.

- [ ] **Step 2: Run to verify failure** — `npx vitest run test/ascii`, Expected: FAIL.

- [ ] **Step 3: Implement `scenes/index.ts`, `start.ts`, `AsciiBackdrop.astro`, and the page/ThemeToggle edits listed above.** On `[slug].astro`, compute `const scene = sceneForProject(entry.data.slug)` and render `{scene ? <AsciiBackdrop scene={scene} /> : null}` as the first child inside `<BaseLayout>`.

- [ ] **Step 4: Run the full checks**

Run: `npm run test && npm run check && npm run lint`
Expected: all pass, 0 errors.

- [ ] **Step 5: Build and run Lighthouse**

Run: `npm run build && npm run lighthouse`
Expected: assertions pass (performance ≥ 0.9, accessibility ≥ 0.95 on both URLs).

- [ ] **Step 6: Check it in the browser** (`npm run dev`)

Verify and note results:
- `/`: clouds visible in margins, faint behind text; moving the cursor parts them; clicking empty space sends a gust; a gust plays by itself about 1 s after load; links, theme toggle and carousel work normally.
- `/project/mova`: tiles; self-demo spells MOVA; click on empty space spells a word.
- `/project/rollify`: no canvas.
- Navigate home → mova → rollify → home via links: one animation at a time, nothing left over.
- Theme light / dark / system (and press `d`): glyph colours follow immediately.
- DevTools "Emulate prefers-reduced-motion: reduce": still frame, no self-demo, click updates the still frame.
- Phone width (375 px): art faint behind content, taps on gaps trigger the action, page scrolls normally.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ascii src/components/ascii src/pages src/components/ui/ThemeToggle.astro test/ascii
git commit -m "feat(ascii): show clouds on home and tiles on the mova page"
```
