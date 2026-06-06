# resort-vip-admin-web

Admin dashboard for managing resort VIP services. Built with React 19, TypeScript, Vite, and Ant Design.

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI framework | React 19 + TypeScript (strict mode) |
| Build tool | Vite 8 with `@vitejs/plugin-react` (Oxc transpiler) |
| Component library | Ant Design v6 + `@ant-design/icons` |
| HTTP client | axios |
| Linter | ESLint v10 (flat config) |

## Getting Started

```bash
npm install
cp .env.example .env   # set VITE_PROXY_API to your backend URL
npm run dev
```

The dev server proxies all `/api/*` requests to `VITE_PROXY_API` (default: `http://localhost:8000`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then bundle to `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_PROXY_API` | Backend base URL (e.g. `http://localhost:8000`) |

## Pages

| Page | Menu label | Description |
|---|---|---|
| `EmployeeManagement` | 員工管理 | List and manage resort employees |
| `CheckInPage` | 辦理入住 | Register a new guest check-in |
| `ItineraryRecommendationPage` | 推薦行程 | View and manage AI-generated itinerary recommendations |
| `CustomerRequestPage` | 顧客需求 | Track guest special requests |

## Auth Flow

There is no React Router. `App.tsx` holds a single `isLogin` boolean in state and renders either `<LoginPage>` or the main layout. On mount it reads `access_token` from `localStorage` to restore a session.

`LoginPage` calls `POST /api/auth/login`, writes `access_token`, `employee_name`, and `role` to `localStorage`, then switches to the main layout. Logout clears those keys.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate; returns `access_token`, `employee_name`, `role` |
| `GET` | `/api/employees` | List all employees (Bearer token required) |
| `GET` | `/api/checkins/room-types` | List available room types |
| `GET` | `/api/checkins/rooms?room_type_id=` | List rooms for a given room type |
| `POST` | `/api/checkins` | Create a new check-in record |
| `POST` | `/api/checkins/:customerId/generate-recommendation` | Trigger AI itinerary generation for a guest |
| `GET` | `/api/recommends/itinerary` | List all itinerary recommendations |
| `GET` | `/api/recommends/itinerary/:customerId/:recommendationId/schedules` | Get schedule items for a recommendation |

## Docker

Build and run the production image, injecting the backend URL at build time:

```bash
docker build --build-arg VITE_PROXY_API=http://your-backend:8000 -t resort-vip-admin-web .
docker run -p 80:80 resort-vip-admin-web
```

The Dockerfile uses a two-stage build: Node 24 Alpine compiles the app, Nginx 1.29 Alpine serves the resulting `dist/` on port 80.
