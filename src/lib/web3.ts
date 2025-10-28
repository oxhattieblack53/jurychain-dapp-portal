/**
 * Web3 Configuration - Wagmi + RainbowKit
 *
 * This module configures the Web3 stack for JuryChain:
 * - Wagmi v2: React hooks for Ethereum
 * - RainbowKit: Beautiful wallet connection UI with custom connectors
 * - Sepolia Testnet: FHE-enabled test network
 *
 * Required Environment Variables:
 * - VITE_WALLETCONNECT_ID: WalletConnect Cloud project ID (get from cloud.walletconnect.com)
 * - VITE_SEPOLIA_RPC_URL: Sepolia RPC endpoint (optional, uses public node by default)
 * - VITE_USE_DEV_FHE: Set to "true" for development FHE mode (plain tallies)
 *
 * NOTE: Coinbase Wallet is excluded due to COEP header incompatibility with FHE WASM.
 * The FHE SDK requires "Cross-Origin-Embedder-Policy: require-corp" for SharedArrayBuffer,
 * which conflicts with Coinbase Wallet's SDK requirements.
 */

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

// Environment Variables
const projectId = import.meta.env.VITE_WALLETCONNECT_ID ?? "demo";
const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

// FHE Development Mode (uses plain tallies instead of encrypted)
const devFheFlag = import.meta.env.VITE_USE_DEV_FHE;
export const USE_DEV_FHE = devFheFlag !== undefined ? devFheFlag === "true" : import.meta.env.DEV;

/**
 * Configured Sepolia Chain
 * Uses custom RPC endpoint for better reliability
 */
const configuredChain = {
  ...sepolia,
  rpcUrls: {
    default: { http: [rpcUrl], webSocket: undefined },
    public: { http: [rpcUrl], webSocket: undefined },
  },
};

/**
 * Custom Wallet Connectors (without Coinbase)
 *
 * Coinbase Wallet is excluded because it's incompatible with the COEP headers
 * required for FHE WASM operations. The FHE SDK needs "require-corp" for
 * SharedArrayBuffer support, while Coinbase SDK needs "cross-origin".
 *
 * Supported wallets:
 * - MetaMask (most popular)
 * - Rainbow Wallet
 * - WalletConnect (universal)
 * - Trust Wallet
 * - Ledger (hardware wallet)
 */
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet],
    },
    {
      groupName: "Others",
      wallets: [trustWallet, ledgerWallet],
    },
  ],
  {
    appName: "JuryChain",
    projectId,
  }
);

/**
 * Wagmi Configuration with Custom RainbowKit Connectors
 */
export const wagmiConfig = createConfig({
  connectors,
  chains: [configuredChain],
  transports: {
    [configuredChain.id]: http(rpcUrl, {
      timeout: 30_000, // 30 second timeout
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: false,
});

export const SUPPORTED_CHAIN = configuredChain;
