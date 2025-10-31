TripExplorer – Frontend (Next.js)

Stack
- Next.js 14 (App Router) • React • TypeScript
- Google Maps JavaScript API (Directions + Map + Photos)
- shadcn/ui & Tailwind

Prérequis
- Node.js 18+
- Yarn (ou npm)
- Clé Google Maps: MAPS_PLATFORM_API_KEY

Installation
```bash
yarn install
```

Configuration
- Créez un fichier .env.local à la racine de frontend avec:
```
MAPS_PLATFORM_API_KEY=xxxxx
```
- La clé est exposée au navigateur via next.config.mjs et disponible en NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.

Démarrage
```bash
yarn dev
# http://localhost:3000
```

Scripts utiles
```bash
yarn build
yarn start
yarn lint
```

Fonctionnalités principales
- Page Search: vue Split (carte Google + liste), bascule Split/Map, filtres de base, markers cliquables → page attraction.
- Page Attraction: détails, horaires si présents, ajout/suppression au trip, images Google Photos.
- Page Trips: compilation des attractions, calcul d’itinéraire (Directions, waypoints optimisés), carte interactive.

Variables d’environnement supportées
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (récupérée automatiquement depuis MAPS_PLATFORM_API_KEY via next.config.mjs)
- (optionnel) NEXT_PUBLIC_GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_MAPS_PLATFORM_API_KEY

Intégration API
- Base URL configurable dans services/api.ts (NEXT_PUBLIC_API_URL) – par défaut http://localhost:8000/api
- Auth: JWT via localStorage (access_token)

Notes
- Un loader Google Maps unique (lib/googleMaps.ts) évite les doubles chargements entre pages.
- Les images utilisent getPlacePhotoUrl(photo_reference). Fallback automatique sur /placeholder.svg en cas d’échec.

# Travel app with V0

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/phillegoffs-projects/v0-travel-app-with-v0)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/7nNkDyPvHP6)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/phillegoffs-projects/v0-travel-app-with-v0](https://vercel.com/phillegoffs-projects/v0-travel-app-with-v0)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/7nNkDyPvHP6](https://v0.app/chat/projects/7nNkDyPvHP6)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Project Structure (Modern Next.js Pattern)

```
frontend/
  app/                # App router routes: only route entry (page/layout/loading.tsx), thin wrappers per route
    home/page.tsx     # Imports HomePage from features
    map/page.tsx      # Imports MapPage from features
    trips/page.tsx    # Imports TripsPage from features
    trips/[id]/page.tsx
    attraction/[id]/page.tsx
    search/page.tsx
    auth/signin/page.tsx
    auth/signup/page.tsx
    auth/forgot-password/page.tsx
    ...               # NO business logic or business components in this directory
  features/           # Domain-driven UI code, usually one index per page
    home/HomePage.tsx
    map/MapPage.tsx
    trips/TripsPage.tsx
    trips/TripDetailPage.tsx
    attraction/AttractionDetailPage.tsx
    auth/SignInPage.tsx
    auth/SignUpPage.tsx
    auth/ForgotPasswordPage.tsx
    ...
  components/         # Shared, non-domain, highly-reusable UI primitives and patterns
  services/           # API clients, fetchers, and related service logic
  lib/                # Utilities
  styles/             # Global styles (e.g. Tailwind, .css)
  public/             # Static files, images, assets
```

**Best Practices:**
- Keep routes (`app/`) lean: just entrypoints, no business logic.
- All UI, hooks, heavy logic live in `features/`.
- `components/` contains only stateless, presentation or utility pieces reused many times.
- `services/` for your API, backend, or data-fetching logic.
- This keeps the codebase scalable and readable as it grows!