// src/App.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The ROOT COMPONENT of our application.
//
// App.tsx is where the entire React component tree starts.
// main.tsx mounts <App /> into the HTML, and App renders everything else.
//
// This version adds simple TAB NAVIGATION between the three tutorial views.
// We use plain React state (useState) instead of a router library — this keeps
// things beginner-friendly without extra dependencies.
//
// In a real production app you would use React Router or TanStack Router
// for URL-based navigation, but the concept is the same.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import TodoListView from './views/TodoListView';
import UserView from './views/UserView';
import PostView from './views/PostView';

// Define the tab identifiers as a TypeScript union type.
// This means "activeTab can only ever be one of these three string values".
// TypeScript will warn us if we accidentally type 'tods' instead of 'todos'.
type Tab = 'todos' | 'users' | 'posts';

// Tab configuration — we describe each tab in one place so the nav bar
// and the content area can both read from the same data.
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'todos', label: 'Todos',   emoji: '📝' },
  { id: 'users', label: 'Users',   emoji: '👥' },
  { id: 'posts', label: 'Posts',   emoji: '📰' },
];

function App() {
  // ── Tab state ──────────────────────────────────────────────────────────────
  //
  // useState<Tab>('todos') creates a state variable of type Tab.
  // It starts as 'todos' (the first tab shown when the app loads).
  //
  // When the user clicks a tab button, we call setActiveTab() with the new tab id.
  // React re-renders App with the new activeTab, which causes the correct view
  // to be displayed.
  const [activeTab, setActiveTab] = useState<Tab>('todos');

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header
        style={{
          background: '#4f46e5',
          color: '#fff',
          padding: '16px',
          marginBottom: '0',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px' }}>
          ⚡ React Middleware Tutorial
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>
          All views share one API middleware — open the browser console (F12) to see it logging requests.
        </p>
      </header>

      {/* ── Tab Navigation Bar ────────────────────────────────────────────── */}
      {/*
        This is a simple tab bar built without any external library.
        We map over the TABS array to render a button for each tab.
        Each button calls setActiveTab with its id when clicked.
      */}
      <nav
        style={{
          display: 'flex',
          background: '#3730a3',
          padding: '0 16px',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              // Highlight the active tab with a white bottom border
              borderBottom: activeTab === tab.id ? '3px solid #fff' : '3px solid transparent',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.65)',
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </nav>

      {/* ── View Area ─────────────────────────────────────────────────────── */}
      {/*
        Conditional rendering: show only the view that matches activeTab.
        The ternary chain checks activeTab and renders the right component.

        Each view component manages its own API call and state — they don't
        know about each other. The shared middleware is the only thing they
        have in common.
      */}
      <main>
        {activeTab === 'todos' && <TodoListView />}
        {activeTab === 'users' && <UserView />}
        {activeTab === 'posts' && <PostView />}
      </main>
    </div>
  );
}

export default App;
