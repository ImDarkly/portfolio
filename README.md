A portfolio website built with Astro, React, TypeScript, Tailwind CSS, and MDX.

## Overview

Static portfolio with a carousel of featured projects. Projects are authored as MDX files and rendered at build time. Deployed as a static site.

### Live

[https://hryhorchuk.vercel.app/](https://hryhorchuk.vercel.app/)

### Stack

Astro 7, React 19 (carousel island), TypeScript, Tailwind CSS 4, MDX, Embla Carousel

## Project Structure

```
portfolio/
└── web/
    ├── public/                 # Static assets
    ├── scripts/                # Build-time content and env checks
    ├── src/
    │   ├── components/        # Astro components and React islands
    │   ├── content/projects/  # Project MDX files and covers
    │   ├── layouts/           # Page layouts
    │   ├── lib/               # Utilities
    │   ├── pages/             # Routes
    │   ├── styles/            # Global styles
    │   └── content.config.ts  # Content collection schema
    ├── test/                   # Vitest tests
    ├── astro.config.ts
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 22.22+
- npm 10.9.4+

### Installation

```bash
git clone <repo>
cd portfolio/web
npm install
```

### Environment Variables

Create `web/.env` (see `web/.env.example`):

```
PUBLIC_GITHUB=https://github.com/your-handle
PUBLIC_LINKEDIN=https://www.linkedin.com/in/your-handle
PUBLIC_EMAIL=you@example.com
```

All three are required for production builds; the build fails if any is missing or empty.

### Development

```bash
cd web
npm run dev
```

The dev server runs at http://localhost:4321.

### Build

```bash
cd web
npm run build
```

### Commands

Run from `web/`:

- `npm run dev` — Dev server
- `npm run build` — Production build
- `npm run preview` — Preview the production build
- `npm run check` — Astro type check
- `npm run lint` — ESLint
- `npm run test` — Vitest
- `npm run sync` — Generate Astro content types

## Adding Projects

Add an MDX file to `web/src/content/projects/` and a cover image next to it. The slug is explicit and must be lowercase kebab-case.

```mdx
---
title: "Project Name"
description: "Short description."
tech: ["TypeScript", "Astro"]
image: ./project-cover.png
githubUrl: "https://github.com/you/project"
liveUrl: "https://project.example.com"
note: "Optional note"
order: 1
slug: "project-name"
---
```

| Field | Type |
|-------|------|
| `title` | String |
| `description` | String |
| `tech` | Array of strings (at least one) |
| `image` | Local image import |
| `githubUrl` | URL |
| `liveUrl` | URL (optional) |
| `note` | String (optional) |
| `order` | Positive integer |
| `slug` | Lowercase kebab-case string |

The build fails if a project is missing required fields, uses a duplicate slug, or references a missing image.

## Routing

- `/` — Home page
- `/project/<slug>` — Project detail
- `/404` — Not found

## Deployment

### Vercel

1. Set the project root directory to `web`.
2. Set the Node.js version to 22.
3. Add the `PUBLIC_GITHUB`, `PUBLIC_LINKEDIN`, and `PUBLIC_EMAIL` environment variables.
4. Deploy.

## Troubleshooting

### Projects not showing

- Check that the MDX file is in `web/src/content/projects/`.
- Verify the frontmatter matches the schema in `web/src/content.config.ts`.
- Restart the dev server.

### Build fails on environment variables

- Create `web/.env` with all three `PUBLIC_` variables.
- Ensure none of the values are empty.
