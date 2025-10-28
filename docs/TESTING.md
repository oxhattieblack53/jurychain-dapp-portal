# JuryChain Testing Documentation

## Overview

This document provides comprehensive testing documentation for the JuryChain DApp, including test structure, execution procedures, and historical bug fixes.

## Test Structure

### E2E Tests (`/tests/`)

#### 1. E2E Test Suite (`e2e.spec.ts`)
**Purpose**: End-to-end testing of core DApp functionality

**Test Cases**:
- Application loads correctly
- Navigation between pages works
- Wallet connection flow
- Case display and interaction

**Status**: ✅ Active

#### 2. Vote Flow Test (`vote-flow.spec.ts`)
**Purpose**: Comprehensive testing of the voting workflow

**Test Cases**:
- Case creation
- Juror assignment
- Vote casting
- Case closure
- Result verification

**Status**: ✅ Active

### Test Configuration

**Playwright Configuration** (`tests/playwright.config.ts`)
- Browsers: Chromium, Firefox, WebKit
- Viewport: 1280x720
- Base URL: http://localhost:8080
- Timeout: 30s per test

**Setup/Teardown**:
- `playwright.setup.ts` - Environment preparation
- `playwright.teardown.ts` - Cleanup procedures

## Running Tests

### Prerequisites
```bash
npm install
npm install -D @playwright/test
npx playwright install
```

### Execute All Tests
```bash
npm run test:e2e
```

### Execute Specific Test
```bash
npx playwright test tests/vote-flow.spec.ts
```

### Run with UI
```bash
npx playwright test --ui
```

### Debug Mode
```bash
npx playwright test --debug
```

## Test Reports

Test execution generates HTML reports in the `playwright-report/` directory:
```bash
npx playwright show-report
```

## Integration Tests

### Contract Integration Tests

Located in: `/blockchain/test/`

**Purpose**: Test smart contract functionality

**Run Command**:
```bash
cd blockchain
npx hardhat test
```

**Coverage**:
- Case creation
- Juror management
- Vote casting (both FHE and dev mode)
- Case closure
- Result tallying
- Access control

## Performance Testing

### Metrics

**Before Optimization**:
- Case Loading: 30+ seconds
- RPC Calls: 3N+1 (31 calls for 10 cases)

**After Optimization**:
- Case Loading: 200-400ms
- RPC Calls: 2 (getCaseIds + getBatchCaseDetails)
- Improvement: **75x faster**

### Performance Test Results

**Test Environment**:
- Network: Sepolia Testnet
- RPC: Alchemy
- Cases: 1 test case
- Browser: Chrome

**Measurements**:
1. Initial Load: ~300ms
2. Case Details Fetch: ~100ms
3. Metadata Parsing: <10ms
4. Total Page Load: ~400ms

## Bug Fixes and Issue Resolution

See [BUG_FIXES.md](./BUG_FIXES.md) for detailed history of all bugs encountered and resolved during development.

## Test Coverage

### Frontend Coverage
- ✅ Case listing and display
- ✅ Case creation form
- ✅ Vote casting
- ✅ Case closure
- ✅ Wallet connection
- ✅ Navigation
- ✅ Error handling
- ✅ Loading states

### Smart Contract Coverage
- ✅ Case creation
- ✅ Juror management
- ✅ Vote casting (FHE mode)
- ✅ Vote casting (dev mode)
- ✅ Case closure
- ✅ Result tallying
- ✅ Access control
- ✅ ChainId restrictions

### Integration Coverage
- ✅ Frontend ↔ Contract interaction
- ✅ Wallet ↔ DApp connection
- ✅ RPC ↔ Contract communication
- ✅ Metadata encoding/decoding

## Known Limitations

1. **FHE SDK Browser Support**: Currently using dev mode (`VITE_USE_DEV_FHE=true`) due to FHE SDK initialization issues in browser environment
2. **Gas Limits**: Explicit gas limits set to avoid network caps
3. **ChainId Restrictions**: Only supports Hardhat (31337) and Sepolia (11155111)

## Future Testing Improvements

1. Add unit tests for React components
2. Implement contract fuzz testing
3. Add load testing for batch operations
4. Set up CI/CD pipeline with automated testing
5. Add integration tests for FHE encryption when SDK is stable
6. Implement visual regression testing

## Test Maintenance

### Regular Tasks
- [ ] Update test data when contract changes
- [ ] Review and update timeouts based on network conditions
- [ ] Archive test reports older than 30 days
- [ ] Update test documentation when adding new features

### When to Run Tests
- Before committing code changes
- After updating dependencies
- Before deployment to production
- After smart contract upgrades
- When investigating reported bugs

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
**Solution**: Increase timeout in playwright.config.ts or check network connectivity

**Issue**: Wallet connection fails
**Solution**: Ensure MetaMask is installed and unlocked

**Issue**: Contract calls fail
**Solution**: Check RPC URL and contract address in .env

**Issue**: Tests pass locally but fail in CI
**Solution**: Verify environment variables and network access in CI environment

## Contact

For questions about testing:
- Check existing test files in `/tests/`
- Review bug fix history in `BUG_FIXES.md`
- See deployment documentation in `DEPLOYMENT.md`

---

**Last Updated**: October 28, 2025
**Version**: 1.0.0
