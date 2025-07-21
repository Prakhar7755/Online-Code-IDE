/// <reference types="vite/client" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    sourcemap: false, // ✅ Ensures no .map files in dist
    minify: "esbuild", // ✅ Optional: ensure fast minification
  },
});
