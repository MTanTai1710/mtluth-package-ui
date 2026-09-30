import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Dev-only server dùng để chạy demo/playground trong /playground.
// Consumer KHÔNG cần config này — họ chỉ import trực tiếp từ src/.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: { port: 5174 },
});
