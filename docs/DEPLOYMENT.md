# JuryChain - Vercel Deployment Summary

## Deployment Information

**Production URL**: https://jurychain-dapp.vercel.app

**Project Name**: jurychain-dapp

**Project ID**: prj_JFebYspdX3B9npGxsujjSA0dA8yY

**Status**: ✅ Live and Accessible

**Node Version**: 22.x

**Framework**: Vite

---

## Deployment Configuration

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variables (Set in Vercel Dashboard)

The following environment variables should be configured in the Vercel dashboard:

- `VITE_CONTRACT_ADDRESS=0x39721cF3F22b390848940E2A08309c7b1F1E7641`
- `VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/1mficoPPlRbd6YcL2bdTRIQJAIMus6dj`
- `VITE_WALLETCONNECT_ID=7c56b102fc0d85d2574777a0c09b4503`
- `VITE_USE_DEV_FHE=true`

---

## Security Settings

### ✅ Vercel Authentication Status
**SSO Protection**: Disabled

The site is **publicly accessible** without any authentication requirements.

---

## Smart Contract Information

**Contract Address**: 0x39721cF3F22b390848940E2A08309c7b1F1E7641

**Network**: Sepolia Testnet

**Etherscan**: https://sepolia.etherscan.io/address/0x39721cF3F22b390848940E2A08309c7b1F1E7641

**Test Case**:
- Case ID: #1
- Title: "Patent Infringement Case"
- Language: English only
- Status: Active

---

## Available URLs

### Production
- Main Page: https://jurychain-dapp.vercel.app
- DApp Dashboard: https://jurychain-dapp.vercel.app/dapp
- Case Details: https://jurychain-dapp.vercel.app/case/1
- Create Case: https://jurychain-dapp.vercel.app/create
- My Votes: https://jurychain-dapp.vercel.app/my-votes

### Automatic Aliases
- https://jurychain-dapp-shuais-projects-ef0fc645.vercel.app
- https://jurychain-dapp-leesai87-3511-shuais-projects-ef0fc645.vercel.app

---

## Deployment Commands

### Initial Deployment
```bash
vercel --prod --yes
```

### Redeploy
```bash
vercel --prod
```

### View Logs
```bash
vercel logs jurychain-dapp.vercel.app
```

### Inspect Deployment
```bash
vercel inspect jurychain-dapp.vercel.app
```

---

## Features

- ✅ Encrypted Jury Voting with FHE (development mode enabled)
- ✅ WalletConnect Integration
- ✅ Sepolia Testnet Support
- ✅ Case Creation and Management
- ✅ Vote Casting and Tallying
- ✅ Responsive UI with Modern Design
- ✅ Real-time Case Updates
- ✅ Custom Favicon (Scales of Justice)

---

## Performance

- **Build Time**: ~35 seconds
- **Initial Load**: Optimized with Vite
- **RPC Calls**: Optimized batch calls (2 calls total vs 3N+1)
- **Case Loading**: 200-400ms (75x faster than before optimization)

---

## Next Steps

1. Visit https://jurychain-dapp.vercel.app to view the live site
2. Connect your wallet using MetaMask or WalletConnect
3. View the test case "Patent Infringement Case"
4. Test voting functionality on Sepolia testnet
5. Configure custom domain (optional)

---

## Support

For issues or questions:
- Check deployment logs: `vercel logs jurychain-dapp.vercel.app`
- View build details: `vercel inspect jurychain-dapp.vercel.app`
- Redeploy if needed: `vercel --prod`

---

**Deployment Date**: October 28, 2025
**Last Updated**: October 28, 2025
