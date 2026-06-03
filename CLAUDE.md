# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR (proxies /api to VITE_PROXY_API)
npm run build      # tsc -b type-check, then Vite bundle → dist/
npm run lint       # ESLint (flat config, v9+)
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

There is no React Router. [App.tsx](src/App.tsx) holds a single `isLogin` boolean in state and renders either `<LoginPage>` or `<EmployeeManagement>`. On mount it reads `access_token` from `localStorage` to restore a session.

`LoginPage` calls `authApi.login()`, then writes `access_token`, `employee_name`, and `role` to `localStorage` and calls the `onLoginSuccess` prop. Logout clears those keys and resets `isLogin`.

### API layer

[src/services/](src/services/) contains thin axios wrappers:

- `authApi.ts` — `POST /api/auth/login`, returns `LoginResponse` (access_token, employee_name, role)
- `employeeApi.ts` — `GET /api/employees` with Bearer token, returns `Employee[]`

All authenticated requests attach `Authorization: Bearer <token>` read from `localStorage`.

### UI

Ant Design (`antd` v6) is the sole component library. Pages use `Form`, `Table`, `Tag`, `message`, and layout primitives directly — no wrapper components around Ant Design yet.

Styles live in [src/index.css](src/index.css) (CSS custom properties, light/dark via `prefers-color-scheme`) and [src/App.css](src/App.css).

## TypeScript

Strict mode is on (`noUnusedLocals`, `noUnusedParameters`). The build step runs `tsc -b` before Vite, so type errors block production builds.
