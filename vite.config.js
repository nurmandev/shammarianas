import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
// import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.jpg", "**/*.png", "**/*.hdr"],
  base: "./",
  build: {
    external: ["three"],
    target: ["chrome89", "edge89", "firefox89", "safari15"],
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    "process.env": {},
    Buffer: ["buffer", "Buffer"],
    global: "globalThis",
    "process.browser": true,
  },
  resolve: {
    alias: {
      buffer: resolve(__dirname, "node_modules/buffer/"),
    },
  },
  optimizeDeps: {
    include: ["buffer", "react-quill", "quill"],
    exclude: ["aos", "ethers", "@stripe/stripe-js", "@stripe/react-stripe-js"],
    // esbuildOptions: {
    //   plugins: [
    //     NodeGlobalsPolyfillPlugin({
    //       buffer: true,
    //     }),
    //     NodeModulesPolyfillPlugin(),
    //   ],
    // },
  },
  // resolve: {
  //   alias: {
  //     buffer: "buffer",
  //   },
  // },
});
