import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // NOTE: no custom manualChunks here on purpose.
    // A previous config isolated `@embedpdf` into its own chunk while
    // splitting only `react-dom`/`react-router` into `react`, leaving bare
    // `react`/`jsx-runtime`/`scheduler` in default chunks. The built
    // `embedpdf-*.js` then imported React from `redux-*.js`/`chakra-*.js`
    // in a circular order, so `createContext` was read off `undefined` and
    // the preloaded chunk white-screened the whole site in production.
    // `React.lazy()` in `src/pages/resource` already code-splits viewers.
    chunkSizeWarningLimit: 1500,
  },
});
