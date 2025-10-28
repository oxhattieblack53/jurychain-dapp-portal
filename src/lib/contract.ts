/**
 * Smart Contract Configuration
 *
 * This module exports the JuryChain contract address and related constants.
 *
 * IMPORTANT: The contract address must be set via the VITE_CONTRACT_ADDRESS
 * environment variable after deploying the contract to Sepolia testnet.
 *
 * Setup Instructions:
 * 1. Deploy contract: cd blockchain && npm run deploy:sepolia
 * 2. Copy the deployed address
 * 3. Create .env file: VITE_CONTRACT_ADDRESS=0x...
 * 4. Restart the dev server
 */

/**
 * JuryChain Smart Contract Address
 *
 * This address is loaded from the VITE_CONTRACT_ADDRESS environment variable.
 * If not set, defaults to the zero address (which will prevent contract interactions).
 *
 * To set this value:
 * - Development: Create a .env file with VITE_CONTRACT_ADDRESS=0x...
 * - Production: Set the environment variable in your deployment platform (Vercel, etc.)
 */
export const JURYCHAIN_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

/**
 * Check if the contract address is properly configured
 *
 * @returns true if a valid contract address is set, false if using the zero address
 */
export function isContractConfigured(): boolean {
  return JURYCHAIN_ADDRESS !== "0x0000000000000000000000000000000000000000";
}
