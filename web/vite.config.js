import { defineConfig } from "vite";

const apiProxy = {
  "/api": {
    target: process.env.API_URL || "http://localhost:5001",
    changeOrigin: true,
  },
};

export default defineConfig({
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
});
