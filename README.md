A portfolio website built with React, TypeScript, Vite, and Sanity CMS.

## Overview

Frontend portfolio with a carousel of projects managed through Sanity CMS. Deployed as a static site.

### Live
[https://hryhorchuk.vercel.app](https://hryhorchuk.vercel.app)

### Stack
React 19, TypeScript, Vite, Tailwind CSS 4, Sanity, Embla Carousel

## Project Structure

```
portfolio-v2/
├── src/                    # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities (Sanity client)
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── vite.config.ts
│
├── studio/                 # Sanity Studio CMS
│   ├── schemaTypes/       # Content schemas
│   └── sanity.config.ts
│
└── package.json           # Workspace root
```

## Getting Started

### Prerequisites

- Node.js 20.x
- npm 10.9.4+

### Installation

```bash
git clone <repo>
cd portfolio-v2
npm install
```

### Environment Variables

Create `src/.env`:
```
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production
VITE_PUBLIC_GITHUB=https://github.com/your-handle
VITE_PUBLIC_LINKEDIN=https://www.linkedin.com/in/your-handle
VITE_PUBLIC_EMAIL=you@example.com
```

### Development

```bash
# Frontend
cd src && npm run dev

# Sanity Studio (separate terminal)
cd studio && npm run dev
```

Frontend: `http://localhost:5173`
Studio: `http://localhost:3333`

### Build

```bash
cd src && npm run build
cd studio && npm run build
```

### Commands

Frontend
- `npm run dev` — Dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run test` — Vitest

Studio
- `npm run deploy` — Deploy to Sanity

## Adding Projects

Projects are managed in Sanity Studio. Required fields:

| Field | Type |
|-------|------|
| Title | String |
| Description | Text |
| Tech Stack | Array |
| Image | Image |
| GitHub URL | URL |
| Live URL | URL (optional) |
| Note | String (optional) |
| Order | Number |

## Routing

- `/` — Home page
- `/project/:slug` — Project detail (slug auto-generated from title)

## Deployment

### Frontend (Vercel)
1. Connect repo to Vercel
2. Add environment variables
3. Deploy

### Studio
```bash
cd studio && npm run deploy
```

## Troubleshooting

### Projects not showing
- Check `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` in `.env`
- Verify projects exist in Sanity Studio
- Restart dev server

### Sanity connection fails
- Check internet connection
- Verify `.env` variables are correct
