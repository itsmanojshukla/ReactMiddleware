// src/api-middleware.ts
// ─────────────────────────────────────────────────────────────────────────────
// THE CORE MIDDLEWARE FILE
//
// This is the single file that every view in the app uses to talk to an API.
// Think of it as the "waiter" in a restaurant:
//   - Views (pages) are customers — they ask for data.
//   - This middleware is the waiter — it goes to the kitchen (API) and comes back
//     with the food (data), or tells you if the kitchen is closed (error).
//   - The API server is the kitchen — it prepares and returns data.
//
// ─────────────────────────────────────────────────────────────────────────────

// axios is a popular library for making HTTP requests (like GET, POST, etc.).
// It is easier to use than the browser's built-in fetch() because:
//   1. It automatically parses JSON responses (no need to call .json() yourself).
//   2. It throws an error for non-2xx HTTP status codes (fetch does not).
//   3. It has a consistent API across all browsers.
import axios from 'axios';

// ============================================
// STEP 1: Define what an API request looks like
// ============================================
//
// A TypeScript "interface" is like a CONTRACT or a BLUEPRINT.
// It describes the shape (the fields) that an object must have.
// If you try to pass an object that is missing a required field,
// TypeScript will show you a red error BEFORE you even run the code.
//
// Analogy: An interface is like a form you must fill in correctly.
// If the form asks for "name" and "email" and you leave one blank,
// it won't let you submit.

/**
 * ApiRequest — describes what you need to provide when making an API call.
 *
 * Example usage:
 *   const req: ApiRequest = {
 *     url: '/todos',
 *     method: 'GET',
 *   };
 */
export interface ApiRequest {
  // The URL path to call.
  // This is relative to the baseURL we set in Step 2.
  // Example: '/todos' will become 'https://jsonplaceholder.typicode.com/todos'
  url: string;

  // The HTTP method. Common ones are:
  //   GET    — read/fetch data (safe, no changes on the server)
  //   POST   — send new data to create a resource
  //   PUT    — send data to replace an existing resource
  //   DELETE — remove a resource
  // The '|' character in TypeScript means "one of these options" (a union type)
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  // body is what we send to the server in POST and PUT requests.
  // For example, when creating a new todo, the body would be:
  //   { title: "Buy milk", completed: false }
  //
  // The "?" makes this field OPTIONAL — you don't need to provide it for GET/DELETE.
  // "any" means the body can be any type (object, string, number, etc.).
  body?: any;

  // headers are extra pieces of information sent with the request.
  // Common headers include:
  //   'Content-Type': 'application/json'  — tells the server we are sending JSON
  //   'Authorization': 'Bearer mytoken'   — proves who we are
  //
  // Record<string, string> means: an object whose keys and values are both strings.
  // The "?" makes it optional.
  headers?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * ApiResponse<T> — describes what you get BACK from an API call.
 *
 * Notice the "<T>" after the name — that is a GENERIC.
 * Think of T as a PLACEHOLDER for whatever data type you expect back.
 *
 * For example:
 *   ApiResponse<Todo>   — the data field will be a Todo object (or null)
 *   ApiResponse<Todo[]> — the data field will be an array of Todo objects
 *   ApiResponse<User>   — the data field will be a User object
 *
 * This lets us write ONE response interface that works for ANY kind of data.
 * Without generics, we would need: TodoResponse, UserResponse, PostResponse, ...
 *
 * Example usage:
 *   const response: ApiResponse<Todo[]> = await apiGet<Todo[]>('/todos');
 *   console.log(response.data); // Todo[] | null
 */
export interface ApiResponse<T> {
  // The actual data returned by the API.
  // T is the type you told us to expect (e.g., Todo, User, Todo[], etc.).
  // It is null when the request failed or hasn't completed yet.
  data: T | null;

  // If something went wrong, this will contain an error message string.
  // Example: "Network Error" or "404 Not Found"
  // It is null when the request succeeded.
  error: string | null;

  // The HTTP status code returned by the server.
  // Common codes:
  //   200 — OK (success)
  //   201 — Created (new resource was made)
  //   400 — Bad Request (we sent bad data)
  //   401 — Unauthorized (we need to log in)
  //   404 — Not Found (the URL doesn't exist)
  //   500 — Internal Server Error (the server broke)
  status: number;

  // Whether the request was successful.
  // True when status is in the 2xx range (200–299).
  // This is a convenience field so views don't have to check the status code themselves.
  success: boolean;
}

// ============================================
// STEP 2: Create the Axios instance
// ============================================
//
// Instead of using plain axios everywhere, we create ONE CONFIGURED INSTANCE
// that all our API calls will use.
//
// This is like setting up your restaurant order pad:
//   - baseURL means we don't have to type the full URL every time.
//   - If the base URL ever changes (e.g., staging vs production), we change it HERE only.
//
// axios.create() vs plain axios:
//   Plain:    axios.get('https://jsonplaceholder.typicode.com/todos')
//   Instance: axiosInstance.get('/todos')  ← much shorter!

// This is the base URL for all our API calls.
// We use JSONPlaceholder — a free, fake REST API for learning and testing.
// It has /todos, /users, /posts, /comments endpoints.
const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Create the axios instance with our configuration.
// Every call we make through axiosInstance will automatically use BASE_URL.
const axiosInstance = axios.create({
  // baseURL is prepended to every request URL.
  // axiosInstance.get('/todos') → GET https://jsonplaceholder.typicode.com/todos
  baseURL: BASE_URL,

  // timeout: how many milliseconds to wait before giving up.
  // 10000 ms = 10 seconds. If the server doesn't respond in 10s, we get an error.
  timeout: 10000,

  // Default headers sent with every request.
  // 'application/json' tells the server: "I speak JSON, please speak JSON back."
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// STEP 3: The Middleware Function
// ============================================
//
// This is THE function that every view will call.
// It is the "waiter" — it takes an order (ApiRequest), goes to the kitchen (API),
// and returns the result (ApiResponse<T>).
//
// Key concepts used here:
//   - async/await   — modern way to handle asynchronous (non-blocking) operations
//   - try/catch     — handles errors gracefully (the "sorry, kitchen is closed" scenario)
//   - generics <T>  — makes the function work for any response shape

/**
 * apiMiddleware — the single function every view uses to talk to the API.
 *
 * @param request - An ApiRequest object describing what to call.
 * @returns A Promise that resolves to an ApiResponse<T>.
 *
 * The "async" keyword means this function returns a Promise.
 * Instead of receiving the result immediately, you "await" it.
 */
export async function apiMiddleware<T>(request: ApiRequest): Promise<ApiResponse<T>> {
  // Record when we started the request (for performance logging)
  const startTime = Date.now();

  // Simple logging — prints to the browser console (F12 → Console tab).
  // This is very useful during development to see all API calls happening.
  console.log(`[API] ▶ ${request.method} ${BASE_URL}${request.url}`);

  // try/catch is error handling.
  // "try" the main code — if it works, great.
  // "catch" any error that occurs — handle it gracefully instead of crashing.
  //
  // Analogy: try = attempt to cook the food, catch = handle if kitchen burns down.
  try {
    // Build the axios configuration object from our ApiRequest.
    // Axios needs specific property names (data instead of body, etc.)
    const response = await axiosInstance.request<T>({
      url: request.url,
      method: request.method,
      // axios uses "data" for the request body (not "body" like fetch)
      data: request.body,
      // Spread any custom headers on top of the defaults
      headers: request.headers,
    });

    // If we get here, the request succeeded!
    const duration = Date.now() - startTime;
    console.log(`[API] ✓ ${request.method} ${request.url} → ${response.status} (${duration}ms)`);

    // Return a normalised success response.
    // No matter what the API returns, we always give the view the same shape of object.
    return {
      data: response.data,  // The actual data from the server
      error: null,          // No error — everything went fine
      status: response.status,
      success: true,
    };
  } catch (err: unknown) {
    // Something went wrong. Common reasons:
    //   - Network is down (no internet)
    //   - Server returned 4xx or 5xx status code
    //   - Request timed out

    const duration = Date.now() - startTime;

    // axios wraps errors in an AxiosError object.
    // We check if it has a "response" property (which means the server did reply,
    // but with an error status like 404 or 500).
    let errorMessage = 'An unknown error occurred';
    let statusCode = 0;

    // axios.isAxiosError() is a helper that checks if the error came from axios
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // Server responded with an error (4xx, 5xx)
        // Example: 404 Not Found, 500 Internal Server Error
        statusCode = err.response.status;
        errorMessage = `HTTP ${statusCode}: ${err.message}`;
      } else if (err.request) {
        // Request was made but no response was received
        // Example: network is down, server is unreachable, timeout
        errorMessage = 'No response from server. Check your internet connection.';
      } else {
        // Something went wrong while setting up the request
        errorMessage = err.message;
      }
    } else if (err instanceof Error) {
      // A regular JavaScript Error (not from axios)
      errorMessage = err.message;
    }

    console.error(`[API] ✗ ${request.method} ${request.url} → ERROR (${duration}ms):`, errorMessage);

    // Return a normalised error response.
    // The view gets the same shape of object whether it was a success or failure.
    // This consistency makes views much simpler to write.
    return {
      data: null,           // No data — the request failed
      error: errorMessage,
      status: statusCode,
      success: false,
    };
  }
}

// ============================================
// STEP 4: Convenience Helper Functions
// ============================================
//
// These are shortcuts so views don't have to write { method: 'GET' } every time.
//
// Instead of:
//   apiMiddleware<Todo[]>({ url: '/todos', method: 'GET' })
//
// You can write:
//   apiGet<Todo[]>('/todos')
//
// Much cleaner and harder to make a typo with the method name!

/**
 * apiGet — shortcut for making a GET request.
 * Use this to FETCH / READ data from the API.
 *
 * @param url - The API endpoint, e.g. '/todos' or '/users/1'
 */
export function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  return apiMiddleware<T>({ url, method: 'GET' });
}

/**
 * apiPost — shortcut for making a POST request.
 * Use this to CREATE new data on the server.
 *
 * @param url  - The API endpoint, e.g. '/todos'
 * @param body - The data to send in the request body (the new resource)
 */
export function apiPost<T>(url: string, body: any): Promise<ApiResponse<T>> {
  return apiMiddleware<T>({ url, method: 'POST', body });
}

/**
 * apiPut — shortcut for making a PUT request.
 * Use this to REPLACE / UPDATE an existing resource on the server.
 *
 * @param url  - The API endpoint, e.g. '/todos/1'
 * @param body - The full updated data to send
 */
export function apiPut<T>(url: string, body: any): Promise<ApiResponse<T>> {
  return apiMiddleware<T>({ url, method: 'PUT', body });
}

/**
 * apiDelete — shortcut for making a DELETE request.
 * Use this to REMOVE a resource from the server.
 *
 * @param url - The API endpoint, e.g. '/todos/1'
 */
export function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  return apiMiddleware<T>({ url, method: 'DELETE' });
}
