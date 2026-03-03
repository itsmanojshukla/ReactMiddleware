// vite.config.ts
// Vite is the build tool that runs our development server and bundles the app.
// Think of it as a "workshop" that takes our TypeScript + React code and
// turns it into plain HTML/CSS/JavaScript that browsers can understand.

import { defineConfig } from 'vite';

// The React plugin teaches Vite how to handle .tsx / .jsx files (React JSX syntax).
// Without this plugin, Vite wouldn't know what to do with "<div>" inside a .ts file.
import react from '@vitejs/plugin-react';

// defineConfig is just a helper that gives us TypeScript autocompletion
// when writing our Vite configuration object.
export default defineConfig({
  plugins: [
    // Enable the React plugin — this is the minimum needed for any React + Vite app
    react(),
  ],
});
