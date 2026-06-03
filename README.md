# resort-vip-admin-web

Admin dashboard for managing resort VIP services. Built with React 19, TypeScript, Vite, and Ant Design.

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite** with `@vitejs/plugin-react` (Oxc transpiler)
- **Ant Design v6** — UI component library
- **axios** — HTTP client

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
| `npm run build` | Type-check then bundle to `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_PROXY_API` | Backend base URL (e.g. `http://localhost:8000`) |

## API Endpoints

The frontend expects the following backend routes:

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate; returns `access_token`, `employee_name`, `role` |
| `GET` | `/api/employees` | List all employees (requires Bearer token) |
