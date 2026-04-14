import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// For GitHub Pages. Override with VITE_BASE at build time for a project-page repo (e.g. "/my-repo/").
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
