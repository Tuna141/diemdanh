import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/diemdanh/", // ⚠️ đổi đúng tên repo GitHub của bạn
  plugins: [react(), tailwindcss()],
});