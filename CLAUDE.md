# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR (proxies /api to VITE_PROXY_API)
npm run build      # tsc -b type-check, then Vite bundle → dist/
npm run lint       # ESLint (flat config, v10)
npm run preview    # Serve production build locally
```

No test runner is configured yet.

## Environment

Copy `.env.example` to `.env` and set the backend URL:

```
VITE_PROXY_API=http://localhost:8000
```

All `/api/*` requests are proxied to that address by [vite.config.ts](vite.config.ts).

## Architecture

### Auth flow & routing

There is no React Router. [App.tsx](src/App.tsx) holds `isLogin` (boolean) and `currentPage` (string) in state. On mount it reads `access_token` from `localStorage` to restore a session.

- **Unauthenticated:** renders `<LoginPage>`.
- **Authenticated:** renders an Ant Design `<Layout>` with a top `<Header>` containing a horizontal `<Menu>` and a `<Content>` area that switches between pages based on `currentPage`.

`LoginPage` calls `authApi.login()`, writes `access_token`, `employee_name`, and `role` to `localStorage`, then calls the `onLoginSuccess` prop. Logout clears those three keys and resets `isLogin` to `false`.

### Pages

| Key | Component | Description |
|---|---|---|
| `employees` | `EmployeeManagement` | List and create resort employees |
| `checkin` | `CheckInPage` | Register a new guest check-in; triggers AI itinerary generation on success |
| `itinerary` | `ItineraryRecommendationPage` | List AI-generated itineraries; opens a modal with table or timeline view |
| `customer-request` | `CustomerRequestPage` | Track guest special requests (placeholder) |

### API layer

[src/services/](src/services/) contains thin axios wrappers that all import the shared [apiClient.ts](src/services/apiClient.ts):

- `authApi.ts` — `POST /api/auth/login`, returns `LoginResponse`
- `employeeApi.ts` — `GET /api/employees`, `POST /api/employees`
- `checkinApi.ts` — `GET /api/checkins/room-types`, `GET /api/checkins/rooms`, `POST /api/checkins`, `POST /api/checkins/:customerId/generate-recommendation`
- `recommendApi.ts` — `GET /api/recommends/itinerary`, `GET /api/recommends/itinerary/:customerId/:recommendationId/schedules`

`apiClient.ts` is an axios instance with two interceptors:

- **Request interceptor** — reads `access_token` from `localStorage` and attaches `Authorization: Bearer <token>` if present.
- **Response interceptor** — on a 401 response, clears `access_token`, `employee_name`, and `role` from `localStorage` and calls `window.location.reload()` to force a re-login.

### UI

Ant Design (`antd` v6) is the sole component library. Pages use `Form`, `Table`, `Tag`, `Modal`, `Select`, `DatePicker`, `Radio`, `message`, and layout primitives directly — no wrapper components around Ant Design.

Styles live in [src/index.css](src/index.css) (CSS custom properties, light/dark via `prefers-color-scheme`) and [src/App.css](src/App.css) (layout overrides, `.itinerary-timeline` custom timeline styles).

### Docker

The [Dockerfile](Dockerfile) uses a two-stage build:

1. **Build stage** — `node:24-alpine`, accepts `VITE_PROXY_API` as a build arg and bakes it into the bundle via `npm run build`.
2. **Serve stage** — `nginx:1.29-alpine`, serves `dist/` on port 80.

[.dockerignore](.dockerignore) excludes `node_modules`, `dist`, `.env*`, `.git`, editor config, and `.claude`.

## TypeScript

Strict mode is on (`noUnusedLocals`, `noUnusedParameters`). The build step runs `tsc -b` before Vite, so type errors block production builds.
