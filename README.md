# ReactMiddleware

A reusable, composable **API middleware library for React + TypeScript**.

This repository contains two things:

| Directory | What it is |
|-----------|-----------|
| `src/` | The production middleware library (composable, TypeScript-first) |
| `tutorial/` | A self-contained beginner tutorial that teaches the same concept from scratch |
| `ConsumerReactApp/` | An example React app that consumes the library |

---

## 📦 The Library (`src/`)

A middleware pipeline for all your API calls — authentication, caching, error handling, and logging in one composable chain.

### Features

- `createAPIWrapper` — creates a typed API client with a configurable middleware stack
- `applyMiddleware` — composes multiple middleware functions into a single handler
- Built-in middlewares: `loggerMiddleware`, `createAuthMiddleware`, `createCacheMiddleware`, `errorMiddleware`
- `useAPI` hook — React hook for calling the wrapper with `loading`/`error`/`data` state
- `APIWrapperProvider` — React context provider that shares one wrapper across the whole app

### Quick start

```bash
# Install dependencies
npm install

# Run the main app (development server)
npm run dev

# Run all tests
npm test

# Build
npm run build
```

### Folder structure

```
src/
├── GenericAPIWrapper.ts       ← Public entry point — re-exports everything
├── middleware/
│   ├── types.ts               ← TypeScript interfaces (RequestConfig, ResponseData, …)
│   ├── applyMiddleware.ts     ← Composes multiple middlewares into one handler
│   ├── createAPIWrapper.ts    ← Factory that creates a typed API client
│   └── middlewares/           ← Built-in middlewares (auth, cache, error, logger)
├── context/
│   └── APIWrapperContext.tsx  ← React context provider
├── hooks/
│   └── useAPI.ts              ← useAPI React hook
└── __tests__/                 ← Vitest unit tests
```

---

## 🎓 Beginner Tutorial (`tutorial/`)

A **standalone React + TypeScript app** that teaches the API middleware pattern from scratch, with heavy inline comments at every step.

> **New to React?** Start here.

### What you'll build

A three-tab app that fetches Todos, Users, and Posts from a public API — all going through one shared middleware file.

```
Views (pages)       →    Middleware       →    API (internet)
TodoListView.tsx         api-middleware.ts      jsonplaceholder.typicode.com
UserView.tsx         ───▶ apiGet()        ───▶  /todos
PostView.tsx             apiPost()              /users
                         (one place for         /posts
                          all API calls)
```

### How to run the tutorial

```bash
# Step 1: go into the tutorial folder
cd tutorial

# Step 2: install dependencies (only needed once)
npm install

# Step 3: start the development server
npm run dev

# Open your browser at http://localhost:5173
```

### Tutorial folder structure

```
tutorial/
├── README.md              ← Tutorial-specific guide (9-step walkthrough)
├── package.json
├── index.html
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx           ← Entry point
    ├── App.tsx            ← Root component with tab navigation
    ├── api-middleware.ts  ← ⭐ The core middleware (heavily commented)
    ├── useApi.ts          ← Custom hook wrapping the middleware
    └── views/
        ├── TodoListView.tsx  ← View 1: GET /todos
        ├── UserView.tsx      ← View 2: GET /users
        └── PostView.tsx      ← View 3: GET /posts + POST demo
```

See [`tutorial/README.md`](./tutorial/README.md) for a full step-by-step walkthrough.

---

## 🛒 Consumer Example (`ConsumerReactApp/`)

An example React application that imports and uses the library from `src/`.

```bash
cd ConsumerReactApp
npm install
npm run dev
```

---

## 🧪 Tests

Tests for the library live in `src/__tests__/` and use [Vitest](https://vitest.dev/).

```bash
# Run from the repo root
npm test
```

