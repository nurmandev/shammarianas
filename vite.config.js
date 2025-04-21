import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.jpg", "**/*.png", "**/*.hdr"],
  base: "./",
  build: {
    external: ["three"],
    target: ["chrome89", "edge89", "firefox89", "safari15"],
  },
  define: {
    "process.env": {},
    Buffer: ["buffer", "Buffer"],
    global: "window",
  },
  resolve: {
    alias: {
      buffer: resolve(__dirname, "node_modules/buffer/"),
    },
  },
  optimizeDeps: {
    include: ["buffer"],
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});
