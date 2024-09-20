import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/demo/",
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
  ],
});
