import { keycloakify } from "keycloakify/vite-plugin";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), keycloakify({
    accountThemeImplementation: "Multi-Page"
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  // Windows: avoid EPERM when Vite empties `dist` (file locks from AV, Explorer, etc.).
  // New hashed assets are written; run `npx rimraf dist` (or delete `dist` manually) for a full clean.
  build: {
    emptyOutDir: false
  }
});