# Wellspring Frontend

React 19 + Vite frontend for the Wellspring clinic system. Runs on Bun; the API is
served by the sibling `wellspring-api` project.

## Requirements

- [Bun](https://bun.sh) 1.4+

## Setup

```bash
bun install
cp .env.example .env    # optional; defaults work with the local backend
bun run dev             # http://localhost:5173
```

## Scripts

```bash
bun run dev       # Vite dev server with HMR on port 5173
bun run build     # production build into dist/
bun run preview   # preview the build on port 4173
bun run lint      # ESLint
```

All Vite commands run through the Bun runtime (`bunx --bun vite`), not Node.

## API connection

API calls go to `/api` by default. Vite proxies `/api` to the backend so there are
no CORS issues in development:

- proxy target: `VITE_PROXY_TARGET`, or the origin of `VITE_API_URL`, or
  `http://localhost:5000`
- direct calls: set `VITE_API_URL` (for example `https://api.example.com/api`) to
  bypass the proxy entirely

The URL is defined once in `src/config/api.js` and imported by every portal's logic
file.

## Start the backend

```bash
cd ../wellspring-api
bun install
bun run start           # http://localhost:5000
```

## What's in `src/`

```
src/
  config/api.js         shared API base URL
  adminLogic.js         admin portal state/API
  counterLogic.js       counter + billing logic
  doctorLogic.js        doctor portal logic
  grnLogic.js           inventory/GRN logic
  queueDisplayLogic.js  public queue display
  dashboardLogic.js     landing page telemetry
  *Portal.jsx           page components
```
