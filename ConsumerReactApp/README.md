# ConsumerReactApp — Generic API Wrapper (React + TypeScript)

A production-ready **React + TypeScript** middleware project that implements the **GenericAPIWrapper** pattern — bringing enterprise-grade API handling (retry, circuit breaker, structured logging, typed responses) to the React ecosystem using Axios and React Query.

## Architecture

```
React Components (UI)
         │
         ▼
┌─────────────────────────┐
│     Custom Hooks         │  ← useTodos(), useCreateUser(), etc.
│  (React Query + Hooks)   │
└────────┬────────────────┘
         ▼
┌─────────────────────────┐
│   Service Layer          │  ← todoService, userService, etc.
│  (Business Logic)        │
└────────┬────────────────┘
         ▼
┌─────────────────────────┐
│   GenericAPIWrapper      │  ← THE MIDDLEWARE
│  ┌───────────────────┐  │
│  │ Axios Instance     │  │  ← Base HTTP client
│  │ Request Interceptor│  │  ← Auth, headers, logging
│  │ Response Interceptor│ │  ← Error handling, transform
│  │ Retry Middleware    │  │  ← Exponential backoff
│  │ Circuit Breaker     │  │  ← Fault tolerance
│  │ Logger Middleware   │  │  ← Structured logging
│  └───────────────────┘  │
└────────┬────────────────┘
         ▼
    External APIs
```

## Features

- ✅ **Typed Responses** — `ApiResponse<T>` wraps every call with `isSuccess`, `data`, `errorMessage`, `statusCode`, `durationMs`
- ✅ **Retry with Exponential Backoff** — configurable retries with jitter (equivalent to Polly `WaitAndRetryAsync`)
- ✅ **Circuit Breaker** — CLOSED / OPEN / HALF_OPEN states (equivalent to Polly `CircuitBreakerAsync`)
- ✅ **Structured Logging** — request/response/error interceptors with timing
- ✅ **Auth Interceptor** — pluggable `getAuthToken()` injected as Bearer token
- ✅ **Cancellation** — `AbortSignal` support on every request
- ✅ **React Query Integration** — retry disabled at Query layer (handled by middleware)
- ✅ **React Context Provider** — singleton `GenericApiClient` via `ApiClientProvider`
- ✅ **Environment Config** — all settings via `VITE_*` env vars

## .NET ↔ React Equivalence

| .NET (Polly/HttpClient) | React (This project) |
|-------------------------|----------------------|
| `IHttpClientFactory` | `GenericApiClient` (Axios-based) |
| `Polly WaitAndRetryAsync` | `RetryMiddleware.execute()` |
| `Polly CircuitBreakerAsync` | `CircuitBreaker.execute()` |
| `DelegatingHandler` | Axios Interceptors |
| `ILogger<T>` | `createRequestLogger()` / `createResponseLogger()` |
| `IOptions<T>` | `MiddlewareConfig` + Vite env vars |
| `ApiResponse<T>` (generic wrapper) | `ApiResponse<T>` interface |

## Setup

```bash
cd ConsumerReactApp
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `https://jsonplaceholder.typicode.com` | Base URL for API calls |
| `VITE_WEATHER_API_URL` | `https://api.weather.example.com` | Weather API base URL |
| `VITE_API_TIMEOUT` | `30000` | Request timeout in ms |
| `VITE_RETRY_COUNT` | `3` | Max retry attempts |
| `VITE_ENABLE_LOGGING` | `false` | Enable structured console logging |

## Test Endpoints (cURL)

```bash
# Todos (GET) — maps to TodoList component
curl https://jsonplaceholder.typicode.com/todos

# Single Todo
curl https://jsonplaceholder.typicode.com/todos/1

# Create User (POST) — maps to CreateUser component
curl -X POST https://jsonplaceholder.typicode.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","username":"john","email":"john@example.com"}'

# Posts (GET) — maps to PostManager component
curl https://jsonplaceholder.typicode.com/posts

# Create Post (POST)
curl -X POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"title":"My Post","body":"Hello world"}'

# Delete Post
curl -X DELETE https://jsonplaceholder.typicode.com/posts/1
```

## Data Flow

```
User Action
    │
    ▼
React Component (e.g. TodoList)
    │  calls hook
    ▼
useTodos() — React Query useQuery
    │  queryFn calls service
    ▼
todoService.getAll()
    │  calls middleware
    ▼
GenericApiClient.get('/todos')
    │
    ├── CircuitBreaker.execute()
    │       │
    │       └── RetryMiddleware.execute()
    │               │
    │               └── axios.request()
    │                       │
    │                       ├── Auth Interceptor (adds Bearer token)
    │                       ├── Logging Interceptor (if enabled)
    │                       └── Error Interceptor
    │
    ▼
ApiResponse<T> { isSuccess, data, statusCode, durationMs, ... }
    │
    ▼
React Query Cache → Component re-renders
```

## Project Structure

```
ConsumerReactApp/
├── src/
│   ├── middleware/          ← Generic API Wrapper (core)
│   │   ├── types/           ← ApiRequest, ApiResponse, MiddlewareConfig
│   │   ├── core/            ← GenericApiClient, ApiClientProvider
│   │   ├── interceptors/    ← Auth, Logging, Error
│   │   ├── resilience/      ← RetryMiddleware, CircuitBreaker
│   │   └── hooks/           ← useApiClient
│   ├── services/            ← todoService, userService, postService, weatherService
│   ├── hooks/               ← useTodos, useUsers, usePosts, useWeather
│   ├── components/          ← TodoList, CreateUser, PostManager, WeatherWidget
│   ├── pages/               ← Dashboard
│   └── types/               ← TodoItem, User, Post, WeatherForecast
```
