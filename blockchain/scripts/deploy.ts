/**
 * JuryChain Deployment Script
 *
 * This script deploys the JuryChain contract to the specified network.
 * It handles deployment, verification, and provides clear instructions for next steps.
 *
 * Usage:
 *   Local:   npx hardhat run scripts/deploy.ts
 *   Sepolia: npx hardhat run scripts/deploy.ts --network sepolia
 *
 * Prerequisites:
 * 1. Set PRIVATE_KEY in ../.env
 * 2. Ensure deployer account has ETH (Sepolia: https://sepoliafaucet.com/)
 * 3. Set SEPOLIA_RPC_URL in ../.env (optional, defaults to public node)
 *
 * After Deployment:
 * 1. Copy the deployed contract address
 * 2. Add to ../.env: VITE_CONTRACT_ADDRESS=0x...
 * 3. Restart the frontend dev server
 * 4. (Optional) Verify on Etherscan:
 *    npx hardhat verify --network sepolia <ADDRESS>
 */

import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../.env" });

/**
 * Main deployment function
 *
 * Deploys the JuryChain contract and logs deployment information.
 * The contract inherits SepoliaConfig which automatically configures
 * FHE gateway and KMS addresses for the Sepolia testnet.
 */
async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  JuryChain Deployment");
  console.log("=".repeat(60) + "\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📊 Deployment Configuration:");
  console.log("  - Network:", network.name);
  console.log("  - Chain ID:", network.config.chainId);
  console.log("  - Deployer:", deployer.address);
  console.log("  - Balance:", ethers.formatEther(balance), "ETH");

  // Warn if balance is low
  if (balance < ethers.parseEther("0.01")) {
    console.warn("\n⚠️  WARNING: Low ETH balance!");
    console.warn("   You may need more ETH for deployment.");
    console.warn("   Sepolia faucet: https://sepoliafaucet.com/\n");
  }

  console.log("\n🔨 Compiling contracts...");

  // Get contract factory
  const juryChainFactory = await ethers.getContractFactory("JuryChain");

  console.log("🚀 Deploying JuryChain contract...");

  // Deploy contract
  // Note: JuryChain inherits SepoliaConfig, so no constructor arguments needed
  const contract = await juryChainFactory.deploy();

  console.log("⏳ Waiting for deployment transaction to be mined...");

  // Wait for deployment to complete
  await contract.waitForDeployment();

  // Get deployed contract address
  const address = await contract.getAddress();

  console.log("\n" + "=".repeat(60));
  console.log("  ✅ Deployment Successful!");
  console.log("=".repeat(60));
  console.log("\n📍 Contract Address:", address);

  // Log contract information
  console.log("\n📋 Contract Information:");
  console.log("  - Name: JuryChain");
  console.log("  - Solidity: 0.8.24");
  console.log("  - FHE: Enabled (via @fhevm/solidity)");
  console.log("  - Network:", network.name);

  // Print next steps
  console.log("\n" + "=".repeat(60));
  console.log("  📝 Next Steps");
  console.log("=".repeat(60));
  console.log("\n1. Update Frontend Configuration:");
  console.log(`   Add to ../.env file:`);
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log("\n2. Restart Frontend:");
  console.log("   cd ..");
  console.log("   npm run dev");
  console.log("\n3. (Optional) Verify Contract on Etherscan:");
  console.log(`   npx hardhat verify --network ${network.name} ${address}`);
  console.log("\n4. Test the DApp:");
  console.log("   - Connect wallet to Sepolia");
  console.log("   - Create a test case");
  console.log("   - Cast encrypted votes");
  console.log("   - Close case and decrypt results");

  console.log("\n" + "=".repeat(60) + "\n");

  // For programmatic use, export the address
  return address;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed!\n");
    console.error(error);
    process.exitCode = 1;
  });
