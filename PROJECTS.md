# ImDarkly's Project Portfolio

## 🏆 Projects Ranked by Size & Difficulty

---

## 1. **Mova** - Multiplayer Word Game
**Status**: Active | **Difficulty**: ⭐⭐⭐⭐⭐ | **Size**: XXL

### Description
A real-time multiplayer browser-based tile word game for 2-4 players inspired by Scrabble. Players share a game board, place tiles, form words, and earn points in real-time synchronization.

### My Contribution
- **Full-stack architecture**: Designed and built entire game from ground up
- **Backend**: PartyKit server implementation with real-time game state management
- **Frontend**: React game UI with drag-and-drop tile placement
- **Game Logic**: Turn tracking, scoring system, tile validation
- **Multiplayer Sync**: WebSocket-based real-time synchronization using PartyKit
- **68+ Pull Requests** refining core game mechanics, UI/UX, and stability

### Key Features
- Real-time multiplayer gameplay over WebSockets
- Tile drag-and-drop board interactions
- Rack management and tile distribution
- Game scoring and turn management
- Lobby system with player joining
- i18n support for multiple languages
- Light/dark theme switching
- Responsive design

### Tech Stack
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, dnd-kit (drag-drop)  
**Backend**: PartyKit (real-time framework)  
**Styling**: Base UI, shadcn/ui components, Tailwind CSS  
**Tools**: React Router, i18next, Sonner (toasts), Zundo (undo/redo)

### Links
- [GitHub](https://github.com/ImDarkly/mova)
- [Live Demo](https://mova-game.vercel.app)

---

## 2. **Bastet** - Multiplayer Virtual Pet
**Status**: Active | **Difficulty**: ⭐⭐⭐⭐⭐ | **Size**: XL

### Description
A real-time multiplayer virtual pet game where two players share one pet over WebSockets. Both players can feed, play with, and care for the pet. Pet state persists on the server between sessions.

### My Contribution
- **Full Architecture**: End-to-end multiplayer pet simulation
- **Godot 4 Client**: Game client with sprite animation and HUD
- **Node.js Server**: WebSocket server with persistent state management
- **Database**: PostgreSQL for pet state persistence using Neon
- **28+ Pull Requests** implementing core features and infrastructure

### Key Features
- Shared pet owned by 2 concurrent players
- Feed/Play actions reflected instantly on both screens
- Server-side stat decay simulation
- Per-family WebSocket rooms
- Persistent pet state storage
- Connection status UI
- Stat constraints and validation

### Tech Stack
**Frontend**: Godot 4 (game engine), GDScript  
**Backend**: Node.js, WebSocket (ws library)  
**Database**: PostgreSQL (Neon)  
**Runtime**: Render.com hosting  
**Development**: Monorepo structure with client/ and server/

### Links
- [GitHub](https://github.com/ImDarkly/bastet)

---

## 3. **Portfolio-v2** - Personal Portfolio with Sanity CMS
**Status**: Active | **Difficulty**: ⭐⭐⭐⭐ | **Size**: XL

### Description
Modern personal portfolio website with CMS backend using Sanity. Features typed data layer, dynamic project showcasing, carousel gallery, and SEO optimization.

### My Contribution
- **Full-Stack Development**: Built entire portfolio from scratch
- **Monorepo Architecture**: Frontend + Sanity Studio setup
- **CMS Integration**: Typed Sanity client with GROQ queries
- **Frontend**: React components with dynamic routing
- **UX Polish**: Meta tags, favicon, OG images, selection styling
- **22+ Pull Requests** covering design, CMS setup, and refinement

### Key Features
- Dynamic project gallery with Sanity CMS
- Project detail pages with slug-based routing
- Image carousel with responsive slides
- Hero section with contact links
- Animated favicon (blinking underscore)
- SEO optimization with meta tags
- OG image generation
- Dark/light theme support

### Tech Stack
**Frontend**: React 19, TypeScript, Vite  
**CMS**: Sanity (headless CMS)  
**Styling**: Tailwind CSS, shadcn/ui, Base UI  
**Icons**: Remix Icon  
**Image Processing**: Sanity Image URL, Embla Carousel  
**Deployment**: Vercel  
**Monorepo**: Workspaces (src/ + studio/)

### Links
- [GitHub](https://github.com/ImDarkly/portfolio-v2)
- [Live Site](https://imdarkly.dev)

---

## 4. **Mausam** - Weather Application
**Status**: Active | **Difficulty**: ⭐⭐⭐⭐ | **Size**: L

### Description
Angular-based weather application that fetches current weather data by city name with geolocation support. Includes outfit recommendations based on weather conditions.

### My Contribution
- **Full Application**: Complete weather app with multiple features
- **Services**: WeatherService, OutfitService, SettingsService
- **Features**: City search, geolocation, outfit recommendations
- **UI Components**: Weather cards, outfit cards, search forms
- **23+ Pull Requests** implementing features and refinement

### Key Features
- Search weather by city name with autocomplete
- Geolocation detection with city lookup
- Real-time weather display with cards
- Temperature unit toggle (°C / °F)
- Outfit recommendations based on weather
- Recent search history persistence
- Loading and error states
- Material Design UI

### Tech Stack
**Frontend**: Angular 21, TypeScript  
**UI Framework**: Angular Material, Radix UI  
**API Integration**: OpenWeatherMap API  
**Testing**: Vitest, E2E tests  
**Build Tool**: Angular CLI  
**Styling**: Custom CSS with Material Design

### Links
- [GitHub](https://github.com/ImDarkly/mausam)

---

## 5. **Rollify** - Dice Roller Application
**Status**: Active | **Difficulty**: ⭐⭐⭐ | **Size**: L

### Description
A feature-rich dice roller app for tabletop gamers. Users can create custom dice with specific ranges, roll them individually or all at once, and manage their collection with drag-and-drop reordering.

### My Contribution
- **Full Application**: End-to-end dice roller development
- **State Management**: Zustand store with undo/redo support
- **UI Components**: Dice forms, drag-drop grid, edit dialogs
- **Animations**: Framer Motion transitions and confetti effects
- **40+ Pull Requests** implementing features and polish

### Key Features
- Create dice with custom min/max ranges
- Roll individual dice or all at once
- Edit dice configurations
- Lock dice to freeze values
- Drag-and-drop reordering
- Undo / redo history (Zundo)
- Persistent state (localStorage)
- Confetti animations on roll
- Color generation utilities
- Theme switching

### Tech Stack
**Frontend**: React 18, TypeScript, Vite  
**State Management**: Zustand, Zundo (undo/redo)  
**Drag-Drop**: dnd-kit with sortable module  
**UI Framework**: Radix UI, shadcn/ui  
**Animations**: Framer Motion, canvas-confetti  
**Styling**: Tailwind CSS  
**Icons**: Iconify

### Links
- [GitHub](https://github.com/ImDarkly/rollify)
- [Live Demo](https://rollify-imdarkly.vercel.app)

---

## 6. **Skattjakt** - Minecraft Bingo Card Generator
**Status**: Active | **Difficulty**: ⭐⭐⭐ | **Size**: L

### Description
Web application that generates custom Minecraft bingo cards with randomized items. Players can create, customize, and share bingo challenges for any Minecraft world.

### My Contribution
- **Full Application**: Complete bingo card generator
- **Core Features**: Card generation, item management, sharing
- **UI**: Responsive grid layout, item management interface
- **Performance**: Million.js optimization for large lists
- **PWA**: Offline support and installability

### Key Features
- Random bingo card generation (5x5 grid)
- Customizable item pool
- Add/remove items from card generator
- Shareable card links
- View detailed item list
- Card customization options
- Favorites system (roadmap)
- PWA support for offline use
- Mobile-responsive design

### Tech Stack
**Frontend**: React 18, TypeScript, Vite  
**Routing**: React Router v6  
**State Management**: Zustand, Million.js (optimization)  
**Styling**: Tailwind CSS, custom 3D effects  
**UI Components**: Radix UI, custom components  
**Icons**: Heroicons (Iconify)  
**Deployment**: GitHub Pages

### Links
- [GitHub](https://github.com/ImDarkly/skattjakt)
- [Live Demo](https://imdarkly.github.io/skattjakt)

---

## 7. **Rinthloader** - Minecraft Mod Batch Downloader
**Status**: Active | **Difficulty**: ⭐⭐⭐ | **Size**: M

### Description
Lightweight utility that simplifies downloading multiple Minecraft mods from Modrinth. Users can paste mod names, select a Minecraft version and loader type, then batch download all mods.

### My Contribution
- **Full Application**: Complete mod downloader utility
- **API Integration**: Modrinth API integration for mod data
- **Batch Processing**: Concurrent mod downloading
- **UX Features**: Mod import detection, version selection, loader choices

### Key Features
- Paste or type mod names
- Auto-detect mod names from jar files
- Select Minecraft version
- Choose loader type (Forge, Fabric, Quilt, etc.)
- Batch download multiple mods
- Enable/disable snapshot versions
- Full mod name list viewing
- Error handling for missing mods

### Tech Stack
**Frontend**: React, TypeScript, Vite  
**API**: Modrinth API  
**Styling**: Tailwind CSS, shadcn/ui  
**File Handling**: Browser file handling APIs  
**Build**: Vite

### Links
- [GitHub](https://github.com/ImDarkly/rinthloader)

---

## 8. **Portfolio (v1)** - Initial Portfolio Site
**Status**: Maintained | **Difficulty**: ⭐⭐⭐ | **Size**: M

### Description
First iteration of personal portfolio showcasing projects and skills. Features section-based layout, project cards with descriptions, and polished UI with custom styling.

### My Contribution
- **Full Frontend**: Complete portfolio design and implementation
- **Component Architecture**: Reusable section headings, project cards
- **Styling**: Tailwind + shadcn tokens, zinc/emerald color palette
- **Navigation**: Sticky navbar with smooth scrolling
- **Polish**: Typography, spacing, accessibility features

### Key Features
- Hero section with personal introduction
- Projects gallery with project cards
- Contact section with social links
- Navbar with navigation
- Responsive mobile design
- Selection highlight customization
- Font weights and typography polish
- Favicon blinking animation

### Tech Stack
**Frontend**: React 19, TypeScript, Vite  
**Styling**: Tailwind CSS, shadcn design tokens  
**Components**: Reusable React components  
**Icons**: Lucide React, Remix Icon  
**Fonts**: IBM Plex Sans, JetBrains Mono

### Links
- [GitHub](https://github.com/ImDarkly/portfolio)

---

## 9. **Space2Study** - Educational Platform (Collaborative)
**Status**: Completed | **Difficulty**: ⭐⭐⭐⭐ | **Size**: L

### Description
Platform connecting students with tutors for personalized education. Features role-based onboarding (student/tutor), subject selection, profile setup with photo upload, and offer discovery.

### My Contribution
- **Frontend Development** (React/TypeScript)
- **Onboarding Flow**: Multi-step stepper components
  - Language selection step
  - Role switcher (student/tutor)
  - Subject selection screens
  - Photo upload with image resizing
  - Confirmation pop-ups
- **UI Components**: SortMenu for offer filtering
- **Features Page**: "How It Works" card layout
- **Backend API**: Subject names endpoint with category filtering

### Team Projects
- **Repo**: Space2Study-UA-4284-team-01/Client-mvp (Frontend)
- **Repo**: Space2Study-UA-4284-team-01/BackEnd-mvp (Backend)

### My Features
- Role-based user flow (student vs tutor paths)
- Multi-step form with validation
- Image upload and resizing
- Backend API integration
- Component composition and reusability

### Tech Stack
**Frontend**: React, TypeScript, Jest (unit testing)  
**Backend**: Node.js / Express  
**Styling**: Component-based styling  
**Forms**: Form validation and submission  
**API**: REST endpoints for subjects and filtering

### Links
- [GitHub Frontend](https://github.com/Space2Study-UA-4284-team-01/Client-mvp)
- [GitHub Backend](https://github.com/Space2Study-UA-4284-team-01/BackEnd-mvp)

---

## 📊 Summary Statistics

| Project | PRs | Issues | Commits | Difficulty |
|---------|-----|--------|---------|------------|
| Mova | 68+ | 69+ | 100+ | ⭐⭐⭐⭐⭐ |
| Bastet | 28+ | 29+ | 50+ | ⭐⭐⭐⭐⭐ |
| Portfolio-v2 | 22+ | 21+ | 60+ | ⭐⭐⭐⭐ |
| Mausam | 23+ | 21+ | 40+ | ⭐⭐⭐⭐ |
| Rollify | 40+ | 37+ | 60+ | ⭐⭐⭐ |
| Skattjakt | 20+ | 15+ | 50+ | ⭐⭐⭐ |
| Rinthloader | 10+ | 5+ | 30+ | ⭐⭐⭐ |
| Portfolio v1 | 33+ | 32+ | 70+ | ⭐⭐⭐ |
| Space2Study | 15+ | 8+ | 40+ | ⭐⭐⭐⭐ |

---

## 🛠️ Technology Stack Overview

### Frontend Frameworks
- React (18, 19)
- Angular 21
- Godot 4 (game development)

### State Management
- Zustand
- React hooks
- Zundo (undo/redo)
- PartyKit (real-time)

### Styling & UI
- Tailwind CSS (latest v4)
- shadcn/ui
- Radix UI / Base UI
- Custom CSS animations

### Real-Time & Backend
- PartyKit (multiplayer)
- WebSockets (ws library)
- Node.js
- Express

### Databases & CMS
- PostgreSQL (Neon)
- Sanity CMS
- localStorage

### Build & Tooling
- Vite
- TypeScript
- ESLint & Prettier
- Jest / Vitest

### Additional Libraries
- React Router v6/v7
- dnd-kit (drag-drop)
- Framer Motion (animations)
- i18next (i18n)
- Embla Carousel

---

## 🎯 Key Strengths Demonstrated

✅ **Multiplayer Architecture**: Real-time game synchronization, WebSocket implementation  
✅ **Full-Stack Development**: Frontend + backend implementations across projects  
✅ **Component Design**: Reusable UI systems, design consistency  
✅ **State Management**: Complex state patterns with multiple solutions  
✅ **Game Development**: Godot + real-time networking  
✅ **API Integration**: Third-party APIs (OpenWeatherMap, Modrinth, Sanity)  
✅ **Performance Optimization**: Million.js, virtual scrolling, efficient rendering  
✅ **Collaborative Development**: Team projects with branch management and code review  
✅ **DevOps & Deployment**: Vercel, GitHub Pages, Render, serverless  
✅ **Problem-Solving**: 50+ bug fixes demonstrating debugging capabilities  

---

**Last Updated**: June 2026  
**Total Repositories**: 30+  
**Total Pull Requests**: 135+  
**Total Issues**: 125+
