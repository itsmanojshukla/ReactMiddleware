// src/main.tsx
// ─────────────────────────────────────────────────────────────────────────────
// This is the ENTRY POINT of our React application.
// It is the very first file that runs when the browser loads our app.
// Its only job is to take our React component tree and "mount" it into the HTML.
// ─────────────────────────────────────────────────────────────────────────────

// StrictMode is a React development tool.
// It renders your components TWICE (in development only) to help you spot bugs.
// Think of it as having a supervisor watching over your shoulder during development.
// In production builds, StrictMode has zero performance impact.
import { StrictMode } from 'react';

// createRoot is the modern React 18+ way to start a React app.
// It connects React to the <div id="root"> element in our index.html.
// The "root" is the single HTML element where React will live.
import { createRoot } from 'react-dom/client';

// We import global CSS here (at the top of the app) so these styles apply
// to every single component in the app — not just one component.
// If you want styles that ONLY apply to one component, you'd import CSS
// inside that component's file instead.
import './index.css';

// App is our root React component — it contains the whole app.
// We import it from App.tsx.
import App from './App';

// document.getElementById('root') finds <div id="root"> in index.html.
// createRoot() creates a React "root" attached to that div.
// .render(...) tells React what to put inside that div.
//
// The "!" at the end of getElementById('root')! is TypeScript syntax.
// It means: "I promise this element will exist — don't warn me about null".
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*
      Everything inside <StrictMode> gets the extra development checks.
      <App /> is where our actual application starts.
    */}
    <App />
  </StrictMode>,
);
