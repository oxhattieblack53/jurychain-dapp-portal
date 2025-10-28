# JuryChain

**Encrypted Jury Voting System for Confidential Legal Verdicts**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/solidity-0.8.24-brightgreen.svg)
![fhEVM](https://img.shields.io/badge/fhEVM-Zama-purple.svg)
![FHE SDK](https://img.shields.io/badge/SDK-0.2.0-orange.svg)

## Overview

JuryChain is a decentralized jury voting system built on **Zama's fhEVM** that enables encrypted verdict voting for legal cases. Jurors can submit confidential guilty/not-guilty votes using **Fully Homomorphic Encryption (FHE)**, ensuring complete privacy until case closure for fair and unbiased deliberations.

### Key Features

- 🔐 **Encrypted Voting**: All jury votes encrypted using FHE technology (euint32)
- ⚖️ **Fair Verdicts**: No one can see individual votes until case closure
- 🛡️ **Privacy-Preserving**: Vote tallying happens on encrypted data
- 🔓 **Transparent Results**: Gateway decryption reveals final verdict counts
- 👥 **Juror Authorization**: Only authorized jurors can vote on cases
- ⏰ **Deadline Enforcement**: Automatic voting period management
- ✅ **Fail-Closed Security**: FHE.select ensures malicious double-votes have no effect

## Tech Stack
- **Smart Contracts**: Solidity 0.8.24, Hardhat, `@fhevm/solidity`
- **Frontend**: Vite + React 18, Wagmi, RainbowKit, Tailwind CSS
- **Encryption**: `@zama-fhe/relayer-sdk` for client-side vote encryption & decryption
- **Testing**: Hardhat unit tests, Playwright end-to-end tests

## Repository Layout
```
JuryChain/
├── blockchain/              # Hardhat workspace (contracts, scripts, tests)
├── src/                     # Vite application source code
├── public/
├── docs/                    # Project specific documentation
├── tests/                   # E2E tests
└── README.md                # This file
```

## Prerequisites
- Node.js >= 18
- npm >= 9
- Sepolia RPC endpoint + deployer account private key
- WalletConnect project ID (for RainbowKit)

## Environment Setup
`.env`
```
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=0x000...
VITE_CONTRACT_ADDRESS=0x000...
VITE_WALLETCONNECT_ID=your_project_id
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
# 如果上述两项未配置，开发环境会默认开启 Mock 钱包与 Dev FHE
VITE_ENABLE_MOCK_CONNECTOR=false
VITE_USE_DEV_FHE=false
```

## Backend (Hardhat)
```bash
cd blockchain
npm install
npm run compile
npm run test
npm run deploy:sepolia
```
Deployment prints the on-chain contract address. Copy it into `VITE_CONTRACT_ADDRESS` for the frontend.

## Frontend (Vite)
```bash
npm install
npm run dev       # local development
npm run build     # production build
npm run preview   # preview the production bundle
```

## Testing Suite
- `npm run test` inside `blockchain/` => Hardhat unit tests exercising encrypted voting.
- `npm run build` inside the root app => ensures production bundle succeeds.
- `npm run test:e2e` (see Playwright config) => UI automation verifying wallet connection, case creation, voting and result decryption flows.

## Deployment Checklist
1. Deploy the contract (`npm run deploy:sepolia`).
2. Update environment variables: `VITE_CONTRACT_ADDRESS`, wallet connect ID, RPC URL.
3. Build the web app (`npm run build`).
4. Push to GitHub using the credentials listed in `.env`.
5. Deploy to Vercel with `VERCEL_TOKEN`; configure a short vanity URL matching the project name.
6. Update `docs/50_FHE_Web3_Projects.csv` with the deployed demo link.

## Production Deployment
- **Contract (Sepolia)**: `0x39721cF3F22b390848940E2A08309c7b1F1E7641`
- **Frontend**: https://jurychain-dapp.vercel.app
- **Etherscan**: https://sepolia.etherscan.io/address/0x39721cF3F22b390848940E2A08309c7b1F1E7641

## References
- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Plugin](https://www.npmjs.com/package/@fhevm/hardhat-plugin)
- [RainbowKit docs](https://www.rainbowkit.com/docs/introduction)
- `docs/BACKEND_DEV.md`, `docs/FRONTEND_DEV.md` for detailed developer notes
