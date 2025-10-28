# JuryChain Backend Development Guide

## Overview
JuryChain stores jury votes with Fully Homomorphic Encryption (FHE). Each court case keeps encrypted tallies for guilty and not-guilty decisions so that individual votes remain private until the judge closes the case. The smart contract is written in Solidity 0.8.24 and compiled/deployed with Hardhat.

## Project Layout
```
blockchain/
├── contracts/
│   └── JuryChain.sol
├── hardhat.config.ts
├── scripts/
│   └── deploy.ts
├── test/
│   └── JuryChain.test.ts
└── package.json
```

## Prerequisites
- Node.js >= 18
- pnpm or npm
- Installed dependencies (`npm install` inside `blockchain/`)
- Access to a Sepolia RPC endpoint and an account private key for deployment (`.env` file)

## Key Contract Concepts
- `createCase`: judge creates a new encrypted case with a metadata URI, juror list, and voting window.
- `castVote`: juror submits encrypted guilty (`1`) or not-guilty (`0`) vote using FHE handles and proof.
- `castVoteDev`: development helper (Hardhat chain only) that increments tallies without performing FHE, used by automated end-to-end tests.
- `closeCase`: judge closes case allowing jurors to decrypt tallies.
- `grantResultAccess`: judge (after closure) can give other addresses decryption permissions.
- `getEncryptedTallies`: returns encrypted result handles for client-side decryption.
- `getPlainTallies`: development helper (Hardhat chain only) returning non-encrypted tallies for local assertions.
- `getCaseIds`, `getCase`, `getCaseJurors`, `hasVoted`: helper views for the frontend.

## Solidity Implementation Highlights
- Inherits `SepoliaConfig` from `@fhevm/solidity` to load default Sepolia gateway/KMS addresses.
- Uses `FHE` library for encrypted arithmetic (`FHE.add`, `FHE.sub`, `FHE.select`).
- Stores per-case data in `CaseData` struct with encrypted tallies and juror permissions.
- Grants ACL permissions via `FHE.allowThis` (for contract) and `FHE.allow` (for judge, jurors, and any account granted by judge).

## Hardhat Usage
```
cd blockchain
npm install
npm run compile
npm run test
```

### Local Testing
Unit tests mock the FHE pipeline via `@fhevm/hardhat-plugin`. They deploy the contract, create a case, encrypt votes, and assert decrypted tallies.
```
npm run test
```

### Deployment
Set environment variables in `.env`:
```
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=0x...
```
Then deploy:
```
npm run deploy:sepolia
```
The script will print the deployed contract address which must be copied to `VITE_CONTRACT_ADDRESS` for the frontend.

## Extending
- Add new verdict categories by storing arrays of encrypted tallies.
- Track verdict history by emitting additional events or storing metadata in IPFS.
- Integrate additional FHE permissions to allow real-time observers to decrypt results after closure.
