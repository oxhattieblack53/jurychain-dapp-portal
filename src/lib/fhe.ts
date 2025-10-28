/**
 * FHE Instance Management
 *
 * This module provides singleton instance management for the Zama FHE SDK.
 * Following the FHE development guide, we use the /bundle import path for
 * optimal browser compatibility and Vite integration.
 */

import type { RelayerSdk } from "@zama-fhe/relayer-sdk/bundle";

// Singleton promise to ensure only one SDK instance is created
let instancePromise: Promise<RelayerSdk> | null = null;

/**
 * Get or create the FHE SDK instance
 *
 * @returns Promise resolving to the initialized FHE SDK instance
 * @throws Error if SDK initialization fails
 */
export async function getFheInstance(): Promise<RelayerSdk> {
  if (!instancePromise) {
    instancePromise = (async () => {
      // Polyfill for global object (required for some bundlers)
      if (typeof (globalThis as any).global === "undefined") {
        (globalThis as any).global = globalThis;
      }

      // ✅ IMPORTANT: Use /bundle path as per FHE development guide
      // This ensures proper WASM loading and Sepolia configuration
      const { initSDK, createInstance, SepoliaConfig } = await import("@zama-fhe/relayer-sdk/bundle");

      // Initialize WASM module
      await initSDK();

      // Create instance with Sepolia configuration
      return createInstance(SepoliaConfig);
    })();
  }
  return instancePromise;
}

/**
 * Encrypt a jury verdict for submission to the smart contract
 *
 * This function creates an encrypted euint32 value representing the juror's verdict:
 * - 1 = Guilty
 * - 0 = Not Guilty
 *
 * The encryption is performed client-side using FHE, ensuring the verdict
 * remains confidential until the case is closed by the judge.
 *
 * @param contractAddress - The JuryChain contract address
 * @param jurorAddress - The address of the juror casting the vote
 * @param isGuilty - True for guilty verdict, false for not guilty
 * @returns Object containing encrypted handles and input proof for contract submission
 * @throws Error if encryption fails
 */
export async function encryptVerdict(
  contractAddress: string,
  jurorAddress: string,
  isGuilty: boolean,
) {
  try {
    // Get initialized FHE instance
    const fhe = await getFheInstance();

    // Create encrypted input for the contract and juror
    const input = fhe.createEncryptedInput(contractAddress, jurorAddress);

    // Add the verdict as euint32 (1 for guilty, 0 for not guilty)
    // IMPORTANT: Contract expects externalEuint32, so we use add32
    input.add32(isGuilty ? 1 : 0);

    // Encrypt and generate zero-knowledge proof
    return input.encrypt();
  } catch (error) {
    console.error("encryptVerdict failed", error);
    throw error;
  }
}

/**
 * Decrypt encrypted vote tallies after case closure
 *
 * This function uses the FHE SDK's public decryption API to reveal the
 * encrypted vote counts. This should only be called after the judge has
 * closed the case and ACL permissions have been granted.
 *
 * @param handles - Array of encrypted handle strings [guiltyHandle, notGuiltyHandle]
 * @returns Array of decrypted numbers [guiltyCount, notGuiltyCount]
 * @throws Error if decryption fails or permissions are insufficient
 */
export async function decryptTallies(handles: string[]) {
  // Get initialized FHE instance
  const fhe = await getFheInstance();

  // Perform public decryption via the Gateway service
  // This is an asynchronous operation that typically takes 1-2 minutes
  const decrypted = await fhe.publicDecrypt(handles);

  // Convert bigint results to regular numbers for display
  return decrypted.map((value) => (typeof value === "bigint" ? Number(value) : Number(value as bigint)));
}
