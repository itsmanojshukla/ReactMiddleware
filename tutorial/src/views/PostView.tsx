// src/views/PostView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3 — PostView
//
// This component demonstrates two important things:
//   1. Fetching a list of posts with apiGet (same pattern as previous views)
//   2. Creating a new post with apiPost — so you can see POST in action too
//
// This is where the convenience helpers (apiGet, apiPost) really shine.
// Look at how simple the API calls are compared to writing them from scratch!
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useApi } from '../useApi';

// Import the convenience helpers.
// apiGet  → shortcut for { method: 'GET' }
// apiPost → shortcut for { method: 'POST', body: ... }
//
// These make the call sites very readable: apiGet('/posts') reads like English.
import { apiGet, apiPost } from '../api-middleware';
import type { ApiResponse } from '../api-middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Post = {
  id: number;
  userId: number;
  title: string;    // The headline of the post
  body: string;     // The main text of the post
};

// ─────────────────────────────────────────────────────────────────────────────
// The Component
// ─────────────────────────────────────────────────────────────────────────────

function PostView() {
  // ── Fetching existing posts (GET) ─────────────────────────────────────────
  const { data: posts, loading, error, callApi } = useApi<Post[]>();

  // ── Creating a new post (POST) ────────────────────────────────────────────
  //
  // We use plain useState here (instead of useApi) to keep things simple
  // and show a different usage pattern.
  //
  // useState<string>('') creates a string variable that starts empty.
  // When the user types in the input, we update this state.
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBody, setNewBody] = useState<string>('');

  // This will hold the result of the POST request so we can show it
  const [postResult, setPostResult] = useState<ApiResponse<Post> | null>(null);

  // Track whether the POST is in flight
  const [posting, setPosting] = useState<boolean>(false);

  // ── Fetch posts on mount ───────────────────────────────────────────────────
  useEffect(() => {
    // Using callApi with { url, method } — same pattern as TodoListView and UserView.
    // We include callApi in the dependency array (the correct React pattern).
    // It is safe to do so because callApi is memoized with useCallback inside
    // useApi, so its reference never changes and this runs only once on mount.
    callApi({ url: '/posts', method: 'GET' });
  }, [callApi]);

  // ── Create a new post (POST request) ─────────────────────────────────────
  //
  // This function is called when the user submits the form.
  // It shows how to use apiPost DIRECTLY — without the useApi hook.
  // Sometimes you don't need loading/error state management — you just
  // want to fire a request and see the result. apiPost makes that easy.
  const handleCreatePost = async () => {
    if (!newTitle.trim()) return; // Don't submit empty titles

    setPosting(true);
    setPostResult(null);

    // apiPost<Post>('/posts', body) is shorthand for:
    //   apiMiddleware<Post>({ url: '/posts', method: 'POST', body: { ... } })
    //
    // JSONPlaceholder will "accept" the post and return it with an id of 101.
    // (It doesn't actually save it — it's a fake API for learning.)
    const result = await apiPost<Post>('/posts', {
      title: newTitle,
      body: newBody,
      userId: 1, // Pretend the post belongs to user 1
    });

    setPostResult(result);
    setPosting(false);

    // Clear the form on success
    if (result.success) {
      setNewTitle('');
      setNewBody('');
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1>📰 Posts</h1>

      {/* ── Section 1: Create a new post ────────────────────────────────────
          This section demonstrates the apiPost helper.
          JSONPlaceholder won't persist the post, but it returns a real-looking
          response so you can see how POST requests work. */}
      <section
        style={{
          background: '#f0f4ff',
          border: '1px solid #c7d2fe',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: '16px' }}>✍️ Create a New Post (POST request demo)</h2>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>
            Title
          </label>
          {/*
            Controlled input: React owns the value.
            Every keystroke calls setNewTitle, which updates state,
            which re-renders the input with the new value.
            This is React's "controlled component" pattern.
          */}
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Post title..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #c7d2fe',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>
            Body
          </label>
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Post body..."
            rows={3}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #c7d2fe',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          onClick={handleCreatePost}
          disabled={posting || !newTitle.trim()}
          style={{
            background: posting ? '#a5b4fc' : '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: posting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {posting ? '⏳ Posting...' : '📤 Submit Post'}
        </button>

        {/* Show the raw API response so learners can see what the server returns */}
        {postResult && (
          <div
            style={{
              marginTop: '12px',
              background: postResult.success ? '#d1fae5' : '#ffe0e0',
              border: `1px solid ${postResult.success ? '#6ee7b7' : '#ff9999'}`,
              borderRadius: '4px',
              padding: '10px',
              fontSize: '13px',
            }}
          >
            {postResult.success ? (
              <>
                <strong>✓ Post created!</strong> Server returned:
                <pre style={{ margin: '6px 0 0', background: 'transparent', overflow: 'auto' }}>
                  {JSON.stringify(postResult.data, null, 2)}
                </pre>
              </>
            ) : (
              <span style={{ color: '#cc0000' }}>❌ Error: {postResult.error}</span>
            )}
          </div>
        )}
      </section>

      {/* ── Section 2: Existing posts list (GET) ─────────────────────────── */}
      <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>📋 Existing Posts (GET request)</h2>
      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 12px' }}>
        Data fetched from{' '}
        <a href="https://jsonplaceholder.typicode.com/posts" target="_blank" rel="noreferrer">
          jsonplaceholder.typicode.com/posts
        </a>
      </p>

      {loading && <p style={{ color: '#888' }}>⏳ Loading posts...</p>}

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

      {!loading && posts && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {/* Show only first 5 posts to keep the page concise */}
          {posts.slice(0, 5).map((post) => (
            <li
              key={post.id}
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                padding: '12px 16px',
                marginBottom: '8px',
              }}
            >
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#111' }}>
                #{post.id} — {post.title}
              </p>
              <p style={{ margin: 0, color: '#666', fontSize: '13px', lineHeight: 1.5 }}>
                {post.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {posts && (
        <p style={{ marginTop: '8px', color: '#666', fontSize: '13px' }}>
          Showing 5 of {posts.length} posts.
        </p>
      )}
    </div>
  );
}

export default PostView;
