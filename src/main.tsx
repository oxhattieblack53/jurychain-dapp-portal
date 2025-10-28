/**
 * JuryChain Application Entry Point
 *
 * This file initializes the React application with the following providers:
 * - WagmiProvider: Web3 wallet connection and blockchain interaction
 * - RainbowKitProvider: Beautiful wallet connection UI
 * - QueryClientProvider: React Query for data fetching (via App.tsx)
 *
 * IMPORTANT: Buffer and global polyfills are required for FHE SDK compatibility
 * in browser environments.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { Buffer } from "buffer";
import App from "./App.tsx";
import "./index.css";
import { wagmiConfig } from "./lib/web3";
import { juryChainTheme } from "./lib/rainbowkit-theme";

// Create a React Query client
const queryClient = new QueryClient();

// ✅ Polyfills for FHE SDK browser compatibility
// These are required for proper WASM and encryption operations
if (typeof window !== "undefined") {
  // Global object polyfill (required by some crypto libraries)
  if (!(window as any).global) {
    (window as any).global = window;
  }
  // Buffer polyfill (required for encryption operations)
  if (!(window as any).Buffer) {
    (window as any).Buffer = Buffer;
  }
}

// Mount the React application with correct Provider hierarchy
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Wagmi v2 Provider - handles Web3 wallet connections */}
    <WagmiProvider config={wagmiConfig}>
      {/* QueryClientProvider - Required by RainbowKit (must wrap RainbowKit) */}
      <QueryClientProvider client={queryClient}>
        {/* RainbowKit Provider with custom JuryChain theme */}
        <RainbowKitProvider
          theme={juryChainTheme}
          modalSize="compact"
          showRecentTransactions={true}
          appInfo={{
            appName: "JuryChain",
            learnMoreUrl: "https://github.com/yourusername/jurychain",
          }}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
