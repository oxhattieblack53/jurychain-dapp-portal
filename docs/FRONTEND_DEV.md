# JuryChain Frontend Development Guide

## Overview
The JuryChain frontend is a Vite + React 18 application styled with Tailwind CSS and Shadcn UI. RainbowKit + Wagmi handle wallet connectivity while the Zama relayer SDK performs client-side encryption / decryption for votes and tallies.

## Key Libraries
- `@rainbow-me/rainbowkit`, `wagmi`, `viem`: wallet connection and chain RPC.
- `@tanstack/react-query`: data fetching and cache.
- `@zama-fhe/relayer-sdk`: FHE SDK for encrypting votes and decrypting tallies.
- `date-fns`: formatting case deadlines.

## Project Structure (src)
```
src/
├── App.tsx                 # App router + providers
├── main.tsx                # Wagmi + RainbowKit bootstrapping
├── components/Navigation.tsx
├── lib/
│   ├── abi.ts              # JuryChain ABI
│   ├── contract.ts         # Contract address helper
│   ├── fhe.ts              # FHE helpers
│   └── web3.ts             # Wagmi configuration
├── pages/
│   ├── Index.tsx           # Marketing landing page
│   └── DApp.tsx            # Jury voting interface
└── hooks/use-toast.ts      # Toast notifications
```

## Environment Variables
Add to `.env` (shared with backend):
```
VITE_CONTRACT_ADDRESS=0x...
VITE_WALLETCONNECT_ID=your_walletconnect_project_id
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
# 以下变量不设置时，开发环境默认启用 Mock 钱包和 Dev FHE
VITE_ENABLE_MOCK_CONNECTOR=false
VITE_USE_DEV_FHE=false
```

## Encryption Flow
1. Initialize SDK lazily via `getFheInstance()` in `src/lib/fhe.ts`.
2. Create encrypted input (handles + proof) with `encryptVerdict(contractAddr, signer, isGuilty)`.
3. Call `castVote(caseId, handle, proof)` via Wagmi wallet client.
4. After closure, obtain tallies using `decryptTallies([...handles])` which leverages the SDK's public decrypt API.

## React Query Flow
- `DApp.tsx` fetches `getCaseIds`, `getCase`, `getCaseJurors`, and `hasVoted`.
- Queries refresh every 15 seconds to track vote progress.
- `useMutation` handles vote submission, case creation, and closure with toast feedback.

## Styling & UX
- Legal aesthetic: gradient gold/blue theme from `tailwind.config.ts`.
- Navigation uses RainbowKit `ConnectButton` for wallet status.
- DApp displays cards with metadata, juror count, votes cast, and countdown to deadline.
- Closed cases provide a "Decrypt Tallies" button once the judge closes the case.

## Commands
```
npm install
npm run dev       # Development server
npm run build     # Production build (bundled output in dist/)
npm run preview   # Preview built app
```

## Testing
- Smart contract integration verified with Hardhat unit tests.
- Frontend build validation via `npm run build`.
- Playwright end-to-end tests (see `/tests` directory) ensure UI flows and contract interactions.

## Deployment Notes
- Deploy contract first and update `VITE_CONTRACT_ADDRESS`.
- Ensure Vercel build command runs `npm run build` and sets the required env variables.
- The RainbowKit configuration uses Sepolia by default; update `SUPPORTED_CHAIN` if targeting another network.
