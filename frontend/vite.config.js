import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001", // Changed from 5000 to avoid macOS Control Center conflict
        changeOrigin: true,
        secure: false
      }
    }
  }
});
