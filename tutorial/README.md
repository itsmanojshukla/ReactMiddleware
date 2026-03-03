# React API Middleware — Beginner Tutorial

Welcome! This tutorial is designed for people who are **new to React** and want to understand
how to build a reusable API middleware from scratch.

---

## 🍽️ What is a Middleware? (The Restaurant Analogy)

Imagine you are at a restaurant:

- **You (the customer)** = a React View (a page/component that needs data)
- **The Waiter** = the Middleware
- **The Kitchen** = the API / back-end server

When you (the View) want food (data), you don't walk into the kitchen yourself.
Instead, you tell the **waiter** what you want, the waiter goes to the kitchen, and
brings back your order.

The waiter also handles things like:
- Writing down your order in a notepad (logging the request)
- Telling you "sorry, the kitchen is closed" if something goes wrong (error handling)
- Bringing the food in a standard format, no matter what you ordered (normalised response)

That waiter is our **API middleware**.

---

## 🏗️ What Are We Building?

A **single API helper** (`api-middleware.ts`) that **all your React pages/views use**.

Instead of every view writing its own `fetch()` or `axios.get()` call (and repeating
the same error-handling code over and over), every view calls our one middleware function.

```
Views (pages)       →    Middleware       →    API (internet)
TodoListView.tsx         api-middleware.ts      jsonplaceholder.typicode.com
UserView.tsx         ───▶ apiGet()        ───▶  /todos
PostView.tsx             apiPost()              /users
                         (one place for         /posts
                          all API calls)

App.tsx provides tab navigation between the three views.
```

---

## 🚀 How to Run

```bash
# Step 1: Go into the tutorial folder
cd tutorial

# Step 2: Install dependencies (only needed once)
npm install

# Step 3: Start the development server
npm run dev

# Open your browser at http://localhost:5173
```

---

## 📚 The 9 Steps of This Tutorial

| Step | File | What you learn |
|------|------|----------------|
| 1 | `src/api-middleware.ts` — Types | How to describe the shape of data with TypeScript interfaces |
| 2 | `src/api-middleware.ts` — Axios instance | How to create ONE axios instance shared by the whole app |
| 3 | `src/api-middleware.ts` — Middleware function | The core function that every view calls |
| 4 | `src/api-middleware.ts` — Helper functions | Shortcuts like `apiGet`, `apiPost` |
| 5 | `src/useApi.ts` | A React hook that wraps the middleware with loading/error state |
| 6 | `src/views/TodoListView.tsx` | View 1 — GET a list of todos; loading/error/success pattern |
| 7 | `src/views/UserView.tsx` | View 2 — GET a list of users; same pattern, different data shape |
| 8 | `src/views/PostView.tsx` | View 3 — GET posts + POST a new post (two HTTP methods in one view) |
| 9 | `src/App.tsx` | Tab navigation wiring all three views together |

---

## 📁 Folder Structure

```
tutorial/
├── README.md              ← You are here
├── package.json           ← Project dependencies
├── index.html             ← HTML shell that React lives inside
├── tsconfig.json          ← TypeScript settings
├── vite.config.ts         ← Vite (build tool) settings
└── src/
    ├── main.tsx           ← Entry point — mounts React into index.html
    ├── index.css          ← Global styles
    ├── App.tsx            ← Root component with tab navigation
    ├── api-middleware.ts  ← ⭐ THE CORE MIDDLEWARE
    ├── useApi.ts          ← Custom React hook wrapping the middleware
    └── views/
        ├── TodoListView.tsx  ← View 1: GET /todos
        ├── UserView.tsx      ← View 2: GET /users
        └── PostView.tsx      ← View 3: GET /posts + POST demo
```

---

## 💡 Key Concepts You Will Learn

1. **TypeScript Interfaces** — Like a blueprint describing what shape data should be
2. **Axios** — A popular library for making HTTP requests (easier than raw `fetch`)
3. **Generics `<T>`** — A way to write reusable code that works with any data type
4. **Custom React Hooks** — A way to share stateful logic across components
5. **`useState`** — React's way to remember and update values on screen
6. **`useEffect`** — React's way to run code when a component first appears
7. **`useCallback`** — React's way to avoid re-creating functions unnecessarily
