import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal Vite config so the single-file React app runs locally.
export default defineConfig({
  plugins: [react()],
});
