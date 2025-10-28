import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Vite Configuration for JuryChain
 *
 * IMPORTANT: This configuration includes COOP/COEP headers required for
 * SharedArrayBuffer support, which is necessary for FHE WASM operations.
 *
 * According to the FHE Development Guide v8.0, these headers are mandatory
 * for proper FHE SDK initialization in the browser.
 */

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // ✅ CRITICAL: Add COOP/COEP headers for FHE WASM support
    // These headers enable SharedArrayBuffer which is required by the FHE SDK
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize build for production
  build: {
    target: "esnext",
    // Increase chunk size warning limit for FHE SDK
    chunkSizeWarningLimit: 2000,
  },
  // Enable WASM support
  optimizeDeps: {
    exclude: ["@zama-fhe/relayer-sdk"],
    esbuildOptions: {
      target: "esnext",
    },
  },
}));
