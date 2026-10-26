import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Backend API base URL (FastAPI runs on :8000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
