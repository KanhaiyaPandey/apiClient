# APIClient — Production-Grade API Testing Tool

A Hoppscotch/Postman-inspired API client built as a **Turborepo monorepo**.  
Full-stack TypeScript with Next.js App Router, Express proxy, Zustand state management, and shadcn/ui.

---

## 📁 Project Structure

```
apiclient/
├── apps/
│   ├── web/                  → Next.js 14 (App Router) frontend
│   └── api/                  → Express backend (CORS proxy + collections API)
├── packages/
│   ├── ui/                   → Shared React components (shadcn/ui + Tailwind)
│   ├── config/               → Shared ESLint, tsconfig, Tailwind configs
│   ├── hooks/                → Shared React hooks (useDebounce, useLocalStorage, useClipboard)
│   └── utils/                → Shared types, request utilities, formatters
├── turbo.json                → Turborepo pipeline config
├── docker-compose.yml        → Full-stack Docker setup
└── package.json              → Workspace root
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone & install

```bash
git clone https://github.com/yourname/apiclient.git
cd apiclient
npm install
```

### 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Run in development

```bash
npm run dev
```

This starts:
- **Web** → http://localhost:3000
- **API** → http://localhost:4000

---

## 🐳 Docker

### Run full stack with Docker Compose

```bash
docker compose up --build
```

### Build individual images

```bash
# API
docker build -f apps/api/Dockerfile -t apiclient-api .

# Web
docker build -f apps/web/Dockerfile -t apiclient-web .
```

---

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in watch mode |
| `npm run build` | Build all packages and apps |
| `npm run lint` | Lint all packages |
| `npm run test` | Run all test suites |
| `npm run clean` | Remove all build artifacts |
| `npm run format` | Prettier format all files |

### Per-workspace commands

```bash
# Run only the web app
npm run dev --workspace=apps/web

# Run only the API
npm run dev --workspace=apps/api

# Run tests in utils package
npm run test --workspace=packages/utils
```

---

## 🏗️ Architecture

### Request Flow

```
User Input (URL/Method/Headers/Body)
    │
    ▼
Zustand Store (tabs.store.ts)
    │
    ▼
useRequest hook
    │  resolveVariables() — {{env_var}} substitution
    │  headersToRecord()  — enabled KV pairs → Record
    ▼
POST /api/proxy  (apps/api)
    │
    │  Zod validation (proxyRequestSchema)
    │  SSRF protection (private IP blocklist)
    │  Auth header injection
    ▼
Target External API
    │
    ▼
ApiResponse { status, headers, body, time, size }
    │
    ▼
Response viewer + History store
```

### State Management (Zustand + Immer)

| Store | Persisted | Purpose |
|---|---|---|
| `tabs.store` | ✅ localStorage | Open request tabs, active tab, loading state |
| `env.store` | ✅ localStorage | Environments and variables |
| `collections.store` | ✅ localStorage | Saved request collections |
| `history.store` | ✅ localStorage | Last 100 requests |

---

## ✨ Features

### Core
- ✅ Multi-tab request builder
- ✅ All HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ Headers, query params, JSON body, form-data, raw body
- ✅ Response viewer with status, headers, body, timing, size
- ✅ Backend CORS proxy (avoid browser CORS restrictions)

### Auth
- ✅ Bearer Token
- ✅ Basic Auth
- ✅ API Key (header or query param)

### Productivity
- ✅ Request history (last 100)
- ✅ Collections with CRUD
- ✅ Environment variables (`{{base_url}}`, `{{token}}`)
- ✅ cURL snippet generation
- ✅ JSON formatter / validator
- ✅ Copy response to clipboard
- ✅ Dark / light theme

### Performance & DX
- ✅ Request cancellation (AbortController)
- ✅ Debounced inputs
- ✅ Turborepo build caching
- ✅ Shared TypeScript configs
- ✅ Zod validation on backend

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Utils unit tests (request parsing, formatters)
npm run test --workspace=packages/utils

# API validation tests
npm run test --workspace=apps/api
```

Tests use **Vitest** for fast, TypeScript-native execution.

---

## 🔐 Security

The backend proxy includes:
- **SSRF protection** — blocks requests to `localhost`, `127.x.x.x`, `10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`
- **Rate limiting** — 100 requests/minute per IP on the proxy endpoint
- **Helmet** — security headers
- **Zod validation** — strict input validation on all endpoints
- **Request timeout** — configurable, max 60s

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` 14 | React framework (App Router) |
| `zustand` + `immer` | State management with immutable updates |
| `@tanstack/react-query` | Server state and caching |
| `next-themes` | Dark/light mode |
| `express` | Backend HTTP server |
| `axios` | HTTP client for proxy forwarding |
| `zod` | Runtime schema validation |
| `turbo` | Monorepo build system with caching |
| `tailwindcss` | Utility-first CSS |
| `lucide-react` | Icon library |
| `vitest` | Unit testing |

---

## 🗺️ Roadmap

- [ ] WebSocket request support
- [ ] GraphQL client
- [ ] Request pre/post scripts (JS sandbox)
- [ ] Team workspaces (database persistence)
- [ ] OpenAPI import
- [ ] Response schema validation

---

## 📄 License

MIT
