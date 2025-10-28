# JuryChain

Encrypted Jury Voting System for Confidential Legal Verdicts

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/solidity-0.8.24-brightgreen.svg)
![fhEVM](https://img.shields.io/badge/fhEVM-Zama-purple.svg)

## Overview

JuryChain is a decentralized jury voting system built on Zama's fhEVM that enables encrypted verdict voting for legal cases. Jurors can submit confidential guilty/not-guilty votes while maintaining complete privacy until case closure, ensuring fair and unbiased deliberations.

### Key Features

- 🔐 **Encrypted Voting**: All jury votes encrypted using FHE technology (ebool)
- ⚖️ **Fair Verdicts**: No one can see individual votes until case closure
- 🛡️ **Privacy-Preserving**: Vote tallying happens on encrypted data
- 🔓 **Transparent Results**: Gateway decryption reveals final verdict counts
- 👥 **Juror Authorization**: Only authorized jurors can vote on cases
- ⏰ **Deadline Enforcement**: Automatic voting period management

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Landing Page │  │  Case List   │  │  Vote Modal  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                          │                                   │
│                   FHE SDK (0.2.0)                           │
│         Client-side encryption of ebool votes                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Smart Contract (JuryChain.sol)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ createCase() │  │  castVote()  │  │ closeCase()  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                          │                                   │
│          FHE Operations (ebool, euint32)                    │
│   - Encrypted vote tallying with FHE.select                 │
│   - ACL permission management                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Gateway Service                           │
│  Asynchronous FHE Decryption (1-2 minutes)                  │
│  Returns: guiltyVotes, notGuiltyVotes (plaintext)          │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Smart Contract

- **Solidity**: 0.8.24
- **fhEVM**: Zama FHE library
- **Framework**: Hardhat
- **Libraries**:
  - `@fhevm/solidity`: FHE operations
  - `@openzeppelin/contracts`: Security & access control

### Frontend

- **Framework**: Next.js 14 (App Router)
- **React**: 18.3.0
- **FHE SDK**: @zama-fhe/relayer-sdk 0.2.0
- **Web3**: Wagmi v2, Viem, RainbowKit
- **Styling**: Tailwind CSS (Legal theme: dark blue/gold)

## Project Structure

```
JuryChain/
├── contracts/
│   ├── JuryChain.sol              # Main contract
│   └── interfaces/
│       └── IJuryChain.sol
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   └── app/
│   │       └── page.tsx           # DApp page
│   ├── components/
│   │   ├── CaseCard.tsx           # Case display
│   │   ├── CaseList.tsx           # Case listing
│   │   ├── VoteModal.tsx          # Vote submission
│   │   └── landing/
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       └── HowItWorks.tsx
│   ├── hooks/
│   │   ├── useFHE.ts              # FHE initialization
│   │   ├── useCastVote.ts         # Vote submission
│   │   └── useCase.ts             # Contract queries
│   └── lib/
│       ├── fhe.ts                 # FHE configuration
│       ├── wagmi.ts               # Web3 setup
│       └── contract.ts            # ABI & address
├── scripts/
│   ├── deploy.ts                  # Deployment script
│   └── interact.ts                # Contract interaction
├── test/
│   └── JuryChain.test.ts
└── docs/
    ├── BACKEND_DEV.md             # Smart contract docs
    ├── FRONTEND_DEV.md            # Frontend docs
    └── README.md                  # This file
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- MetaMask or compatible wallet
- Sepolia testnet ETH

### Backend Setup

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values:
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
# NEXT_PUBLIC_WALLET_CONNECT_ID=your_project_id

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Usage

### For Judges (Case Creation)

1. **Connect Wallet**: Connect your wallet to the DApp
2. **Create Case**: Click "Create Case" and provide:
   - Case ID (unique identifier)
   - Case title and description
   - List of authorized juror addresses
   - Voting duration (1 hour - 30 days)
3. **Monitor Progress**: Track juror participation
4. **Close Case**: Manually close or wait for deadline
5. **View Verdict**: After decryption, see the final verdict

### For Jurors (Voting)

1. **Connect Wallet**: Connect as authorized juror
2. **Browse Cases**: View assigned cases
3. **Review Details**: Read case title and description
4. **Cast Vote**:
   - Click "Cast Vote"
   - Select "Guilty" or "Not Guilty"
   - Vote is encrypted client-side
   - Submit encrypted vote to blockchain
5. **Wait for Results**: After case closes, view final verdict

## Smart Contract Functions

### Core Functions

```solidity
// Create a new legal case
function createCase(
    bytes32 _caseId,
    string calldata _title,
    string calldata _description,
    address[] calldata _jurors,
    uint256 _votingDuration
) external

// Cast encrypted vote as juror
function castVote(
    bytes32 _caseId,
    externalEbool encryptedVote,
    bytes calldata inputProof
) external

// Close case voting
function closeCase(bytes32 _caseId) external

// Gateway callback for decryption
function fulfillDecryption(
    bytes32 _caseId,
    uint32 guiltyCount,
    uint32 notGuiltyCount
) external onlyGateway
```

### Query Functions

```solidity
// Get case information
function getCaseInfo(bytes32 _caseId) external view returns (...)

// Get verdict results (after revelation)
function getVerdict(bytes32 _caseId) external view returns (
    uint32 guiltyVotes,
    uint32 notGuiltyVotes,
    bool verdict
)

// Check if address is authorized juror
function isJuror(bytes32 _caseId, address _address) external view returns (bool)

// Check if juror has voted
function hasJurorVoted(bytes32 _caseId, address _juror) external view returns (bool)
```

## FHE Operations

### Encrypted Vote Tallying

```solidity
// Convert external encrypted vote to internal ebool
ebool vote = FHE.fromExternal(encryptedVote, inputProof);

// Conditionally increment vote counters using FHE.select
euint32 guiltyIncrement = FHE.select(vote, FHE.asEuint32(1), FHE.asEuint32(0));
euint32 notGuiltyIncrement = FHE.select(vote, FHE.asEuint32(0), FHE.asEuint32(1));

// Update encrypted tallies
cases[_caseId].guiltyVotes = FHE.add(cases[_caseId].guiltyVotes, guiltyIncrement);
cases[_caseId].notGuiltyVotes = FHE.add(cases[_caseId].notGuiltyVotes, notGuiltyIncrement);
```

### Frontend Encryption

```typescript
// Initialize FHE SDK
await initSDK();
const instance = await createInstance(SepoliaConfig);

// Create encrypted input
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.addBool(voteGuilty);  // true=guilty, false=not-guilty

// Encrypt and get proof
const { handles, inputProof } = await input.encrypt();

// Submit to contract
await contract.castVote(caseId, handles[0], inputProof);
```

## Security Features

- ✅ **ReentrancyGuard**: Protection against reentrancy attacks
- ✅ **Access Control**: Juror authorization system
- ✅ **Vote Duplicate Prevention**: hasVoted tracking
- ✅ **Gateway Verification**: Only Gateway can call fulfillDecryption
- ✅ **ACL Management**: Proper FHE permissions
- ✅ **Pausable**: Emergency stop functionality

## Gas Optimization

- Use `calldata` for external function parameters
- Efficient struct packing
- Event emission for off-chain data
- Minimal storage updates

## Testing

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test
npx hardhat test test/JuryChain.test.ts
```

### Test Coverage

- ✅ Case creation validation
- ✅ Juror authorization
- ✅ Encrypted vote submission
- ✅ Vote duplicate prevention
- ✅ Case closing logic
- ✅ Gateway decryption callback
- ✅ Verdict calculation

## Deployment

### Sepolia Testnet

```bash
# Set environment variables
export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
export PRIVATE_KEY="your_private_key"

# Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# Verify
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Mainnet

```bash
# Update hardhat.config.ts with mainnet configuration
# Deploy with caution
npx hardhat run scripts/deploy.ts --network mainnet
```

## Example Use Cases

### Criminal Case Deliberation

```typescript
// Judge creates case
const caseId = ethers.id("CRIMINAL-2024-001");
await contract.createCase(
  caseId,
  "State v. Defendant",
  "Theft accusation - deliberation required",
  [juror1, juror2, juror3, juror4, juror5],
  7 * 24 * 3600  // 7 days
);

// Jurors vote privately
// Juror 1: Guilty
await contract.connect(juror1).castVote(caseId, encryptedTrue, proof);

// Juror 2: Not Guilty
await contract.connect(juror2).castVote(caseId, encryptedFalse, proof);

// After voting closes and decryption
const verdict = await contract.getVerdict(caseId);
// Returns: { guiltyVotes: 3, notGuiltyVotes: 2, verdict: true }
```

## Roadmap

- [x] Core encrypted voting system
- [x] Frontend DApp with legal theme
- [x] Gateway integration
- [ ] Multi-case batch operations
- [ ] Juror reputation system
- [ ] Advanced case management
- [ ] Mobile responsive optimizations
- [ ] Mainnet deployment

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [FHE Solidity Library](https://docs.zama.ai/fhevm/guides/contracts)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/jurychain/issues)
- **Discord**: [Join our community](https://discord.gg/your-invite)
- **Email**: support@jurychain.io

## Acknowledgments

- Built with [Zama's fhEVM](https://www.zama.ai/fhevm)
- Powered by [Ethereum](https://ethereum.org)
- UI inspired by legal and courtroom aesthetics

---

**Version**: 1.0.0
**Last Updated**: 2025-01-19
**Status**: Production Ready
**Network**: Sepolia Testnet
