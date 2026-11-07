import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { HOLIDAY_FEED_URL } from "./src/lib/holiday-feed.ts"

const feed = new URL(HOLIDAY_FEED_URL)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  // Demo only: the browser cannot read Google's holiday feed (no CORS), so the dev
  // server fetches it for the admin's "Update from Google" button.
  // Later: the Spring Boot API does this (POST /api/admin/holidays/refresh).
  server: {
    proxy: {
      "/holiday-feed": { target: feed.origin, changeOrigin: true, rewrite: () => feed.pathname },
    },
  },
})
