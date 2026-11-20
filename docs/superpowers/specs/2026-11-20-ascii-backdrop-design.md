# Interactive ASCII backdrops

Date: 2026-11-20
Status: approved 2026-11-20

## Intent

Give the portfolio a small, memorable, interactive visual signature while
keeping it a professional frontend-developer site. Every page gets a faint
full-screen canvas behind its content, drawn as text characters (ASCII art),
that reacts to the visitor:

- the homepage shows a **sea of clouds** (mar de nubes) with Teide's summit,
  a nod to Tenerife, where the owner lives and wants to work;
- each project page shows a **scene of its own** that plays on what the
  project does (dice for the dice roller, letter tiles for the word game...).

Why: recruiters skim dozens of portfolios. A quiet, well-crafted interactive
detail shows frontend skill and personality without getting in the way of the
content. It was inspired by the koi pond on daoho.dev, but the subjects must be
the owner's own: no fish, no koi, nothing that reads as a copy of that site.

## Goals

- One full-viewport interactive canvas behind the content on the homepage and
  on every project page (`/project/[slug]`).
- Each scene is visibly tied to its subject (Tenerife, or the project).
- Each scene **plays its own action once**, about a second after the page
  loads, so visitors discover that it is interactive without any hint text.
- Reads as a "small visual touch": faint, calm, never competes with text.
- Works in light and dark themes and follows theme changes live.
- Keeps the existing Lighthouse CI budget: performance ≥ 0.9, accessibility
  ≥ 0.95 on `/` and `/project/mova` (see `web/lighthouserc.json`).

## Non-goals

- No change to page layout, copy, the carousel, or the cover screenshots.
- No hint text ("psst, click...") anywhere. This was considered and rejected.
- No new runtime dependencies (no three.js, no canvas libraries).
- No 80s / synthwave / CRT styling. This was tried and rejected; the site's
  existing tokens, fonts and light/dark themes stay as they are.
- No sound.

## Anti-goals (it fails even if it "works" when...)

- Text becomes harder to read in either theme, anywhere on the page.
- Links, buttons, the carousel, text selection or touch scrolling stop working
  normally, or feel intercepted.
- It looks like daoho.dev's koi pond.
- Lighthouse performance or accessibility drops below the CI thresholds.
- It keeps animating with the tab hidden, or burns CPU when nobody is looking.
- It feels like a toy or a game page rather than a professional portfolio.

## Constraints from the existing site

- Astro 7 static site with `ClientRouter` (client-side page transitions). Page
  scripts run once; anything per-page must mount on `astro:page-load` and clean
  up before the next swap (`astro:before-swap`). A recent fix
  (`bc7b52d`, theme toggle after transitions) is the precedent to follow.
- Theme: `web/src/lib/theme.ts` toggles `light` / `dark` classes on `<html>`
  and dispatches `themechange` on `window` when the user picks a theme. When
  the theme is `system` and the OS scheme changes, it re-applies the class but
  does **not** dispatch `themechange`, so the canvas must not rely on that
  event alone (for example, also watch the `<html>` class).
- Colours come from CSS tokens in `web/src/styles/global.css`: `--foreground`,
  `--muted-foreground`, `--primary` (emerald). Glyphs use these, at low alpha.
- Fonts: JetBrains Mono Variable (`--font-heading`) for glyphs.
- Project pages currently ship no React. Keep it that way.
- The project page's cover image is the LCP element (`loading="eager"`,
  `fetchpriority="high"`). The canvas must not delay it.
- Tests: Vitest with jsdom in `web/test/`.

## Approaches considered

1. **Plain TypeScript engine + one module per scene, mounted by one Astro
   component.** *Chosen.* Each page renders `<AsciiBackdrop scene="..." />`;
   its script dynamically imports only that page's scene after the page is
   interactive. Smallest JS, fits Astro, no React on project pages, scene logic
   unit-testable without a browser. The throwaway prototypes already work this
   way.
2. **A React island per scene.** Rejected: adds the React runtime (~45 KB) to
   project pages just to drive a canvas, for no benefit.
3. **WebGL or a library such as three.js.** Rejected: heavier, harder to keep
   glyphs crisp, real pressure on the Lighthouse budget, and nothing here needs
   the GPU.

## Design

### Pieces

- **Engine** (`web/src/lib/ascii/` or similar): owns the canvas, device-pixel
  ratio, the character grid (cell size about 7 × 12 px), the animation loop,
  pointer tracking (position and velocity), theme colours, pause/resume, and
  teardown. Scenes never touch the DOM directly.
- **Scenes** (one module each): implement a small interface, roughly
  `init(size)`, `frame(time, dt)` drawing through engine helpers,
  `pointer(...)`, `action(x, y)` for a click/tap on empty space, and
  `demo()` for the one-time self-demo. Exact shape is the builder's call.
- **`AsciiBackdrop.astro`**: renders the fixed canvas (`aria-hidden`,
  `pointer-events: none`, behind content) and a script that mounts the named
  scene on `astro:page-load` and tears it down before swaps.

### Behaviour shared by all scenes

- Canvas is fixed to the viewport, behind all content.
- **Fade behind content** (chosen by the owner after comparing it with a
  uniform faint strength in the prototype): glyphs are at full strength in
  empty areas such as the side margins, and fade to roughly a fifth of that
  behind content blocks (heading, paragraphs, tags, cards, buttons, nav). The
  fade starts a few pixels outside each block and eases over roughly 50–60 px,
  so there is no hard edge. The engine measures the content blocks' on-screen
  rectangles and rebuilds this mask on resize, scroll, page swap, font load,
  and whenever the layout under it changes (e.g. carousel). On phones, where
  content covers most of the screen, the art is therefore faint almost
  everywhere; that is intended. Full-strength alpha is tuned per theme; the
  readability anti-goal is the test.
- Pointer movement anywhere on the page influences the scene. Listeners sit on
  `window`, so content stays fully clickable.
- A click or tap on **empty space** triggers the scene's action. Clicks on
  links, buttons, the carousel, cards, tags or selected text do not.
- Never call `preventDefault` on touch or wheel events, and never block
  scrolling. Dragging (only the dice scene) starts only when the pointer goes
  down on a die.
- **Self-demo:** about one second after the scene mounts, it plays its action
  once on its own (for example at a sensible spot such as the free side
  margin). It plays once per page view, not repeatedly.
- **Reduced motion** (`prefers-reduced-motion: reduce`): draw one still,
  composed frame, with no animation and no self-demo. Interactions may update
  the still frame; they must not animate.
- **Lifecycle:** start after the page has loaded (do not compete with LCP);
  pause when the tab is hidden; release
  everything on page swap and on resize rebuild.
- **Density:** fewer objects on narrow screens (phones), where content covers
  most of the background.

### Scenes

| Page | Scene | Pointer | Action (click / tap, and the self-demo) |
|---|---|---|---|
| Home | **Sea of clouds**: a band of drifting cloud glyphs across the lower part of the viewport, Teide's summit poking out on one side | Moving through the clouds parts them; the gap slowly refills | A gust: a ring that clears a path outward from the point |
| Space2Study | **Students and tutors**: two sets of dots drifting | Lines form between nearby student–tutor pairs near the cursor | Nearby pairs "match" and pull together briefly |
| Mova | **Letter tiles**: framed letter tiles drift | Tiles drift away from the cursor | Tiles fly to the point and spell a word (e.g. MOVA, HELLO, REACT), then scatter after a few seconds |
| Skattjakt | **Bingo card**: a 5 × 5 grid of small item glyphs | Hovered square highlights | Marks the nearest square; completing a line plays a short celebration, then the card resets |
| Rollify | **Dice**: two standard dice plus one custom-range die | Dice can be dragged and flicked | All dice roll and settle; a faint "rolled N" appears briefly |
| Rinthloader | **Mod blocks**: small package blocks fall into a download queue | Blocks nudge away from the cursor | A burst of blocks streams into the queue faster |
| Mausam | **Weather**: rain on one side, sun on the other, a small figure whose outfit matches | The cursor's side sets the local weather | Cycles the weather (sun, rain, wind, snow) and the outfit changes |
| Bastet | **A cat**: a small ASCII cat that idles, naps when left alone | Follows the pointer, purrs (visual) when petted | Pounces toward the point |

Prototypes of the homepage clouds, the Mova tiles, the Rollify dice and a
fourth idea (a boat that "ships chum", not chosen) are in
`2026-11-20-ascii-backdrop-prototype/prototype.html` next to this document
(open it from a local static server; switch scenes with the dashed control at
the bottom). They are the reference for feel (motion, density, the cloud
parting and gust, the tile word-forming, the dice roll), not code to copy as is.
Note they predate two decisions: they show a hint line (now rejected) and have
no self-demo.

### Rollout (staged)

1. Engine, `AsciiBackdrop`, homepage clouds, and the Mova scene. Ship, look at
   it on the real site, adjust feel (alpha, density, speed).
2. The remaining six project scenes, using what stage 1 taught.

Until stage 2 ships, project pages without a scene show no backdrop. The same
applies to any project added later without its own scene, and to the 404 page.
There is no generic default scene.

## Decided with the owner

- Clouds on the homepage; a unique interactive scene for every project.
- Scenes fill the entire page background behind unchanged content.
- Professional and subtle: a small touch, not a redesign or a themed site.
- No hint text; each scene plays its action once on its own instead.
- Fade behind content, not one uniform faint strength.
- Build approach 1 (plain TypeScript engine + scene modules + Astro component).

## Calls made by Claude (open to correction)

- Staged rollout, with stage 1 = engine + clouds + Mova.
- Self-demo delay about one second, once per page view.
- Still frame (not hidden) for reduced motion.
- Fewer objects on phones.
- The concrete scene ideas for the six projects other than Mova (table above).
- No backdrop on pages without a scene (unbuilt projects, 404); no generic
  default scene.
- Which elements count as "content blocks" for the fade: the page's direct
  layout blocks, not individual words.

## Left to the builder

- Module layout, scene interface details, file names.
- Cell size, alpha, speeds, counts, and other tuning values.
- How scene logic is split from drawing for unit tests, and which tests.
- How to detect "empty space" precisely for click handling.
- Whether the canvas persists across `ClientRouter` swaps or is recreated per
  page, as long as the lifecycle rules above hold.
