// src/useApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// A CUSTOM REACT HOOK that wraps our api-middleware with React state.
//
// WHY DO WE NEED THIS?
//
// Every time a view fetches data, it needs to track:
//   - Is the data loading right now? (show a spinner)
//   - Did an error happen? (show an error message)
//   - What is the actual data? (show the content)
//
// Without a custom hook, EVERY view would have to repeat this same logic:
//
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   // ... call apiMiddleware, set state, handle errors ...
//
// A custom hook lets us write that logic ONCE and reuse it everywhere.
// This follows the DRY principle: Don't Repeat Yourself.
//
// Analogy: A custom hook is like a pre-filled form template. Instead of
// writing out all the fields from scratch every time, you use the template.
// ─────────────────────────────────────────────────────────────────────────────

// useState lets a component "remember" a value and re-render when it changes.
// For example: useState(false) creates a variable that starts as false,
// and when you change it, React updates the screen automatically.
//
// useCallback is a performance optimisation.
// When React re-renders a component, functions inside it are re-created.
// useCallback says "only re-create this function if its dependencies change".
// Without it, passing the function as a prop to child components could cause
// those children to re-render unnecessarily.
import { useState, useCallback } from 'react';

// Import our middleware function and the request/response types we defined.
import { apiMiddleware } from './api-middleware';
import type { ApiRequest, ApiResponse } from './api-middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Define what our hook RETURNS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UseApiReturn<T> — the shape of the object returned by useApi().
 *
 * Views will destructure this to get what they need:
 *   const { data, loading, error, callApi } = useApi<Todo[]>();
 */
export interface UseApiReturn<T> {
  // The data returned by the last successful API call.
  // null when nothing has been fetched yet, or the last call failed.
  data: T | null;

  // Error message from the last failed API call.
  // null when the last call succeeded or nothing has been called yet.
  error: string | null;

  // True while an API call is in progress. Use this to show a loading spinner.
  loading: boolean;

  // The HTTP status code from the last API call (e.g., 200, 404, 500).
  // 0 means no call has been made yet.
  status: number;

  // The function to call when you want to make an API request.
  // Pass it an ApiRequest object (or use the apiGet/apiPost helpers).
  callApi: (request: ApiRequest) => Promise<ApiResponse<T>>;

  // Resets everything back to the initial state (data=null, error=null, etc.).
  // Useful when navigating away from a page and coming back.
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// The hook itself
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useApi<T>() — a custom React hook for making API calls with state management.
 *
 * @returns An object with { data, error, loading, status, callApi, reset }
 *
 * USAGE EXAMPLE in a view:
 *
 *   const { data, loading, error, callApi } = useApi<Todo[]>();
 *
 *   useEffect(() => {
 *     callApi({ url: '/todos', method: 'GET' });
 *   }, []);
 *
 *   if (loading) return <p>Loading...</p>;
 *   if (error)   return <p>Error: {error}</p>;
 *   return <ul>{data?.map(todo => <li key={todo.id}>{todo.title}</li>)}</ul>;
 */
export function useApi<T>(): UseApiReturn<T> {

  // ── State ─────────────────────────────────────────────────────────────────
  //
  // useState<Type>(initialValue) creates a state variable.
  // It returns an array: [currentValue, setterFunction]
  // We use destructuring to give them readable names.
  //
  // When we call the setter (e.g. setData(newData)), React:
  //   1. Updates the value
  //   2. Re-renders the component (so the UI reflects the new value)

  // The fetched data. Starts as null (nothing fetched yet).
  const [data, setData] = useState<T | null>(null);

  // Whether a request is currently in flight. Starts as false.
  const [loading, setLoading] = useState<boolean>(false);

  // The error message from the last failure. Starts as null.
  const [error, setError] = useState<string | null>(null);

  // The HTTP status code from the last response. Starts as 0 (no call made).
  const [status, setStatus] = useState<number>(0);

  // ── callApi ───────────────────────────────────────────────────────────────
  //
  // This is the function views will call to trigger an API request.
  // We wrap it in useCallback so it's not re-created on every render.
  //
  // useCallback(fn, [dependencies]):
  //   - "fn" is the function to memoize (remember)
  //   - "[]" means no dependencies — this function is created once and reused
  //
  // If we didn't use useCallback and passed callApi as a prop to a child
  // component, the child would re-render every time the parent renders
  // (because a new function object would be created each time).

  const callApi = useCallback(async (request: ApiRequest): Promise<ApiResponse<T>> => {
    // Step 1: Tell React we are loading. This triggers a re-render.
    // The view will see loading=true and can show a spinner.
    setLoading(true);

    // Clear any previous error so the UI doesn't show stale error messages
    setError(null);

    // Step 2: Call the middleware (our "waiter")
    // "await" pauses execution here until the middleware returns a result.
    // This is non-blocking — the browser stays responsive while waiting.
    const result = await apiMiddleware<T>(request);

    // Step 3: Update state based on the result
    if (result.success) {
      // ✓ Success! Store the data and clear any error.
      setData(result.data);
    } else {
      // ✗ Failure. Store the error message so the view can show it.
      setError(result.error);
    }

    // Always update the status code and turn off loading
    setStatus(result.status);
    setLoading(false);

    // Return the result so the caller can also inspect it directly if needed
    return result;
  }, []); // Empty dependency array = create this function only once

  // ── reset ─────────────────────────────────────────────────────────────────
  //
  // Resets all state back to the initial values.
  // Useful when the user navigates away and back, to avoid showing stale data.

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setStatus(0);
  }, []); // Empty dependency array = create this function only once

  // ── Return ────────────────────────────────────────────────────────────────
  //
  // Return all state variables and functions so views can use them.
  // The view destructures only what it needs:
  //   const { data, loading } = useApi<Todo[]>();

  return { data, error, loading, status, callApi, reset };
}
