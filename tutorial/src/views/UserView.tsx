// src/views/UserView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// VIEW 2 — UserView
//
// This component fetches a list of users from the API and displays them.
// It is the second example of how any view can use the same api-middleware.ts
// without repeating the error/loading boilerplate.
//
// Compare this file with TodoListView.tsx:
//   - The middleware call is identical (just a different URL and type)
//   - The loading/error/success pattern is the same
//   - Only the data shape (User vs Todo) and the JSX are different
//
// That consistency is the whole point of having a shared middleware!
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';

// Same hook as in TodoListView — reused with zero changes
import { useApi } from '../useApi';

// ─────────────────────────────────────────────────────────────────────────────
// Define the shape of a User object
// ─────────────────────────────────────────────────────────────────────────────

// JSONPlaceholder returns users that look like this (simplified):
//   {
//     "id": 1,
//     "name": "Leanne Graham",
//     "username": "Bret",
//     "email": "Sincere@april.biz",
//     "website": "hildegard.org",
//     "company": { "name": "Romaguera-Crona" }
//   }
//
// We only describe the fields we actually use — TypeScript doesn't require
// you to declare every single field in the response.
type User = {
  id: number;       // Unique ID
  name: string;     // Full name e.g. "Leanne Graham"
  username: string; // Handle e.g. "Bret"
  email: string;    // Email address
  website: string;  // Personal website
  company: {
    name: string;   // Company name
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// The Component
// ─────────────────────────────────────────────────────────────────────────────

function UserView() {
  // Notice: this is EXACTLY the same hook call pattern as TodoListView.
  // Only the generic type <User[]> changes to tell TypeScript what data to expect.
  const { data: users, loading, error, callApi } = useApi<User[]>();

  useEffect(() => {
    // Fetch all users on mount — same pattern as TodoListView, different URL.
    // We include callApi in the dependency array because React's exhaustive-deps
    // rule requires it. It's safe to do so because callApi is wrapped in
    // useCallback inside useApi, so its reference never changes.
    callApi({ url: '/users', method: 'GET' });
  }, [callApi]);

  return (
    <div style={{ padding: '16px' }}>
      <h1>👥 Users</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Data fetched from{' '}
        <a href="https://jsonplaceholder.typicode.com/users" target="_blank" rel="noreferrer">
          jsonplaceholder.typicode.com/users
        </a>
      </p>

      {/* Loading state */}
      {loading && <p style={{ color: '#888' }}>⏳ Loading users...</p>}

      {/* Error state */}
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

      {/* Success state — display each user as a card */}
      {!loading && users && (
        <div
          style={{
            display: 'grid',
            // CSS Grid: automatically create columns of at least 260px wide
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          {users.map((user) => (
            // Each child in a list or map must have a unique key prop.
            // React uses key to efficiently update the DOM.
            <div
              key={user.id}
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {/* User's initials as an avatar placeholder */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#4f46e5',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '10px',
                }}
              >
                {/* Take the first letter of the first and last word of the name */}
                {user.name
                  .split(' ')
                  .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                  .map((w) => w[0])
                  .join('')}
              </div>

              <p style={{ margin: '0 0 2px', fontWeight: 600, color: '#111' }}>{user.name}</p>
              <p style={{ margin: '0 0 2px', color: '#666', fontSize: '13px' }}>@{user.username}</p>
              <p style={{ margin: '0 0 2px', color: '#666', fontSize: '13px' }}>✉ {user.email}</p>
              <p style={{ margin: '0 0 2px', color: '#4f46e5', fontSize: '13px' }}>
                🌐{' '}
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'inherit' }}
                >
                  {user.website}
                </a>
              </p>
              <p style={{ margin: '6px 0 0', color: '#999', fontSize: '12px' }}>
                🏢 {user.company.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {users && (
        <p style={{ marginTop: '16px', color: '#666', fontSize: '13px' }}>
          {users.length} users total.
        </p>
      )}
    </div>
  );
}

export default UserView;
