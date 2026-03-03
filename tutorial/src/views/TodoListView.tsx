// src/views/TodoListView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// VIEW 1 — TodoListView
//
// This component fetches a list of "todos" from the API and displays them.
// It demonstrates how a real-world view uses our middleware and custom hook.
//
// A "todo" is just a task — like a to-do list item.
// We fetch them from JSONPlaceholder (a free fake REST API for learning).
//
// What you will learn in this file:
//   1. How to define a TypeScript type for API data
//   2. How to use the useApi hook
//   3. How to use useEffect to fetch data when the component mounts
//   4. How to handle loading, error, and success states in the UI
// ─────────────────────────────────────────────────────────────────────────────

// React must be in scope when using JSX (the HTML-like syntax inside .tsx files)
import React, { useEffect } from 'react';

// Import our custom hook — this gives us loading/error/data state management
import { useApi } from '../useApi';

// We don't need to import apiGet here because callApi already calls apiMiddleware.
// Instead, we pass the ApiRequest object directly to callApi.

// ─────────────────────────────────────────────────────────────────────────────
// Define the shape of a "Todo" object
// ─────────────────────────────────────────────────────────────────────────────

// This is a TypeScript "type alias". It is similar to an interface —
// it describes the shape of a JavaScript object.
//
// JSONPlaceholder returns todos that look like this:
//   {
//     "userId": 1,
//     "id": 1,
//     "title": "delectus aut autem",
//     "completed": false
//   }
//
// By defining this type, TypeScript will:
//   - Auto-complete todo.title, todo.completed, etc. for us
//   - Warn us if we try to access a field that doesn't exist (e.g. todo.name)
type Todo = {
  id: number;       // Unique identifier for this todo (1, 2, 3, ...)
  userId: number;   // Which user this todo belongs to
  title: string;    // The text of the task (e.g. "Buy milk")
  completed: boolean; // Has this task been completed? true or false
};

// ─────────────────────────────────────────────────────────────────────────────
// The Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TodoListView — a React component that shows a list of todos.
 *
 * A React component is a function that returns JSX (the HTML-like syntax).
 * React calls this function every time it needs to draw (or redraw) this part
 * of the screen.
 */
function TodoListView() {
  // ── useApi hook ────────────────────────────────────────────────────────────
  //
  // We call our custom hook here.
  // We tell it the data type we expect back: Todo[]
  // (an array of Todo objects)
  //
  // The hook returns an object. We destructure the parts we need.
  //   data    = the array of todos (or null if not loaded yet)
  //   loading = true while waiting for the API response
  //   error   = error message string if the request failed
  //   callApi = the function we call to trigger the API request
  const { data: todos, loading, error, callApi } = useApi<Todo[]>();

  // ── useEffect ─────────────────────────────────────────────────────────────
  //
  // useEffect lets you run code AFTER React has rendered the component.
  // It's React's way of saying "do this side effect after painting the screen".
  //
  // The second argument [] is the "dependency array":
  //   []          = run only ONCE when the component first appears (mounts)
  //   [someValue] = run whenever someValue changes
  //   (no array)  = run after every render (usually not what you want)
  //
  // We use [] here because we want to fetch the todos exactly once — when
  // the TodoListView first loads. We don't want to re-fetch on every render.
  useEffect(() => {
    // Call the API when the component first loads.
    // We pass an ApiRequest object directly to callApi.
    //
    // callApi is included in the dependency array (the correct React practice).
    // It is safe because callApi is memoized with useCallback([]) inside useApi,
    // so its reference never changes — this effect still runs only once on mount.
    callApi({ url: '/todos', method: 'GET' });
  }, [callApi]);

  // ── Render ────────────────────────────────────────────────────────────────
  //
  // In React, a component returns JSX (HTML-like syntax).
  // The component is re-rendered whenever state changes.
  // We check the state and return different UI for each case.

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '16px' }}>
      <h1>📝 Todo List</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Data fetched from{' '}
        <a href="https://jsonplaceholder.typicode.com/todos" target="_blank" rel="noreferrer">
          jsonplaceholder.typicode.com/todos
        </a>
      </p>

      {/* ── Loading State ──────────────────────────────────────────────────
          If loading is true, show a spinner message.
          This appears immediately after the component mounts, before the
          API has responded. */}
      {loading && (
        <p style={{ color: '#888' }}>⏳ Loading todos...</p>
      )}

      {/* ── Error State ────────────────────────────────────────────────────
          If the API call failed, error will be a string.
          We show it to the user in a red box. */}
      {error && (
        <div
          style={{
            background: '#ffe0e0',
            border: '1px solid #ff9999',
            borderRadius: '4px',
            padding: '12px',
            color: '#cc0000',
          }}
        >
          ❌ Error: {error}
        </div>
      )}

      {/* ── Success State ──────────────────────────────────────────────────
          If todos is not null (and we're not loading), show the list.
          We show only the first 10 todos to keep the page manageable.
          todos?.slice(0, 10) means:
            - todos? = "only run slice if todos is not null"
            - .slice(0, 10) = take the first 10 items */}
      {!loading && todos && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.slice(0, 10).map((todo) => (
            // Each list item needs a unique "key" prop.
            // React uses this to efficiently update the list when data changes.
            // We use todo.id because it's unique for each todo.
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              {/* Show a ✓ or ✗ based on whether the todo is completed */}
              <span style={{ color: todo.completed ? '#4caf50' : '#bbb', fontSize: '18px' }}>
                {todo.completed ? '✓' : '○'}
              </span>

              {/* The todo title — strikethrough if completed */}
              <span
                style={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#999' : '#333',
                }}
              >
                {todo.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* ── Stats ─────────────────────────────────────────────────────────
          Show a summary only when we have data */}
      {todos && (
        <p style={{ marginTop: '16px', color: '#666', fontSize: '13px' }}>
          Showing 10 of {todos.length} todos.{' '}
          {todos.filter((t) => t.completed).length} completed.
        </p>
      )}
    </div>
  );
}

// Export the component so other files can import and use it.
// This is the standard way to share React components between files.
export default TodoListView;
