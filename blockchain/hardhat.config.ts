/**
 * Hardhat Configuration for JuryChain
 *
 * This configuration enables FHE (Fully Homomorphic Encryption) smart contract
 * development using Zama's fhEVM framework.
 *
 * Key Features:
 * - Solidity 0.8.24 compiler with Cancun EVM support
 * - @fhevm/hardhat-plugin for FHE mock operations in tests
 * - Sepolia testnet configuration for deployment
 * - TypeScript support via @nomicfoundation/hardhat-toolbox
 *
 * Environment Variables Required:
 * - SEPOLIA_RPC_URL: RPC endpoint for Sepolia testnet
 * - PRIVATE_KEY: Deployer wallet private key (must have Sepolia ETH)
 *
 * Setup Instructions:
 * 1. Copy ../.env.example to ../.env
 * 2. Get Sepolia ETH from https://sepoliafaucet.com/
 * 3. Add your private key and RPC URL to ../.env
 * 4. Run: npm run compile
 * 5. Run: npm run test
 * 6. Deploy: npm run deploy:sepolia
 *
 * @see https://hardhat.org/config/
 * @see https://docs.zama.ai/fhevm
 */

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@fhevm/hardhat-plugin";
import dotenv from "dotenv";

// Load environment variables from parent directory
// This allows sharing .env between frontend and blockchain
dotenv.config({ path: "../.env" });

// Load critical environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

// Warn if private key is missing (required for deployment)
if (!PRIVATE_KEY && process.argv.includes("--network") && process.argv.includes("sepolia")) {
  console.warn("\n⚠️  WARNING: PRIVATE_KEY not set in ../.env");
  console.warn("   Sepolia deployment will fail. Please add your private key.\n");
}

const config: HardhatUserConfig = {
  // ✅ Solidity Compiler Configuration
  // CRITICAL: Must use 0.8.24 for @fhevm/solidity@^0.8.0 compatibility
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimize for deployment cost vs runtime cost balance
      },
      // Use Cancun EVM version for latest Ethereum features
      evmVersion: "cancun",
    },
  },

  // ✅ Default Network
  // Tests run on Hardhat network by default (in-memory blockchain)
  defaultNetwork: "hardhat",

  // ✅ Network Configuration
  networks: {
    // Hardhat Network: In-memory blockchain for testing
    // The @fhevm/hardhat-plugin enables FHE mock operations here
    hardhat: {
      chainId: 31337,
      // Uncomment for debugging:
      // loggingEnabled: true,
    },

    // Localhost: For running a persistent Hardhat node
    // Start with: npx hardhat node
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // Sepolia Testnet: Primary deployment target
    // Requires Sepolia ETH and configured PRIVATE_KEY
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 180000, // 3 minutes timeout
      // Adjust if transactions fail due to gas estimation:
      // gas: 5000000,
      // gasPrice: 10000000000,
    },
  },

  // ✅ Path Configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  // ✅ Mocha Test Configuration
  mocha: {
    timeout: 120000, // 2 minutes (FHE operations can be slow)
  },
};

export default config;
