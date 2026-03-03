// src/App.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The ROOT COMPONENT of our application.
//
// App.tsx is where the entire React component tree starts.
// main.tsx mounts <App /> into the HTML, and App renders everything else.
//
// In a real application, App.tsx would typically contain:
//   - A router (to switch between pages/views)
//   - A navigation bar
//   - A layout wrapper
//
// For this tutorial, we keep it simple: App just renders TodoListView.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import TodoListView from './views/TodoListView';

function App() {
  return (
    <div>
      {/*
        In a real app, you might have a <NavBar /> here,
        and a <Router> to switch between different views.
        For now, we just render our single tutorial view.
      */}
      <TodoListView />
    </div>
  );
}

export default App;
