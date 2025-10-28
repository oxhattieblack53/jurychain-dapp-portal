# Code Cleanup Notes

## Overview

This document describes the code cleanup process and decisions made regarding debug code, console statements, and development utilities.

## Console Logging Policy

### Kept for Production ✅

The following console statements are **intentionally kept** as they provide valuable information for debugging production issues:

1. **console.error** - Critical errors that need immediate attention
2. **console.warn** - Warnings about potential issues or deprecated usage

### Removed from Production ❌

The following debug console statements have been identified but are currently kept for development purposes. They can be removed using a build-time plugin:

1. **console.log** - Debug information
2. **console.debug** - Detailed debug traces
3. **console.time/timeEnd** - Performance measurements
4. **console.info** - Informational messages

## Current Debug Code Locations

### DApp.tsx
- Lines 51-60: Debug useEffect for publicClient state
- Lines 69-132: Query function with timing logs
- Lines 144-149: Window object assignments for debugging
- Lines 187, 336-344: Metadata parsing logs

**Rationale for Keeping**: These logs helped identify and fix critical performance issues. They remain useful for:
- Monitoring query execution
- Performance profiling
- Debugging metadata issues
- Troubleshooting user reports

### CaseDetail.tsx
Similar debug patterns for individual case operations.

### CreateCase.tsx
Debug logs for case creation flow.

### MyVotes.tsx
Debug logs for vote retrieval.

## Build-Time Log Removal

To remove debug logs in production builds, we recommend using a bundler plugin:

### For Vite (Current Setup)

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // Remove console statements in production
    {
      name: 'remove-console',
      enforce: 'pre',
      apply: 'build', // Only in production builds
      transform(code, id) {
        if (id.endsWith('.ts') || id.endsWith('.tsx')) {
          return {
            code: code
              .replace(/console\.log\([^)]*\);?/g, '')
              .replace(/console\.debug\([^)]*\);?/g, '')
              .replace(/console\.time\([^)]*\);?/g, '')
              .replace(/console\.timeEnd\([^)]*\);?/g, '')
              .replace(/console\.info\([^)]*\);?/g, ''),
            map: null
          }
        }
      }
    }
  ],
  // ... rest of config
})
```

### Alternative: terser Plugin

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove all console.*
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.debug', 'console.info']
      }
    }
  }
})
```

## Debug Code Removed

The following debug utilities have been moved to `/archive/`:

### Debug Scripts (Moved to `/archive/debug-scripts/`)
- `check-console-logs-cdp.mjs`
- `check-env-cdp.mjs`
- `check-query-state-cdp.mjs`
- `check-react-state-cdp.mjs`
- `comprehensive-test.mjs`
- `create-english-case.mjs`
- `debug-query-cdp.mjs`
- `debug-vote.js`
- `debug-vote.mjs`
- `diagnose-cdp.mjs`
- `test-debug.mjs`
- `test-final.mjs`
- `test-full-flow.mjs`
- `test-interactive-cdp.mjs`
- `test-new-contract.mjs`
- `test-performance.mjs`
- `test-vote-cdp.mjs`
- `test-with-cdp.mjs`
- `test-with-wallet-cdp.mjs`
- `verify-english-case.mjs`

### Debug Screenshots (Moved to `/archive/screenshots/`)
- `cdp-screenshot.png`
- `dapp-screenshot.png`
- `debug-screenshot.png`
- `diagnose-screenshot.png`
- `final-test-screenshot.png`
- `react-state-screenshot.png`
- `test-full-page.png`
- `vote-test-screenshot.png`

### Test Artifacts (Moved to `/archive/test-results/`)
- Playwright test execution results
- HTML reports
- Test snapshots

## Window Object Debug Assignments

The following window object assignments are used for browser console debugging:

```typescript
// DApp.tsx
(window as any).__JURYCHAIN_CASES__ = casesQuery.data;
(window as any).__JURYCHAIN_CASES_ERROR__ = casesQuery.error;
(window as any).__JURYCHAIN_CASES_STATUS__ = casesQuery.status;
```

**Recommendation**: These can be wrapped in `if (import.meta.env.DEV)` to only exist in development:

```typescript
if (import.meta.env.DEV) {
  (window as any).__JURYCHAIN_CASES__ = casesQuery.data;
  (window as any).__JURYCHAIN_CASES_ERROR__ = casesQuery.error;
  (window as any).__JURYCHAIN_CASES_STATUS__ = casesQuery.status;
}
```

## Code Comments

### Development Comments to Keep ✅

Comments that explain **why** something is done a certain way:

```typescript
// OPTIMIZED: Use getBatchCaseDetails to fetch all cases in ONE call
// This reduces RPC calls from 3N to 1 (30x faster for 10 cases!)
```

```typescript
// Removed initialData to force query execution
```

### Comments to Remove ❌

Comments that explain **what** the code does (self-evident):

```typescript
// Loop through cases
for (const case of cases) { ... }
```

## Environment-Specific Code

### Development Mode Flag

Currently using `VITE_USE_DEV_FHE=true` for FHE development mode. This is properly configured and should remain as an environment variable option.

## Recommendations

### Immediate Actions
1. ✅ Move debug scripts to archive (DONE)
2. ✅ Move screenshots to archive (DONE)
3. ✅ Create documentation for removed code (DONE)
4. ⏳ Wrap window debug assignments in DEV check
5. ⏳ Add build-time console removal plugin

### Future Improvements
1. Implement proper logging service (e.g., Sentry, LogRocket)
2. Add development-only error boundary with detailed logs
3. Create debug panel component for development
4. Use environment variables to control log levels

## Development vs Production

### Development (`npm run dev`)
- All console logs enabled
- Debug window assignments active
- Detailed error messages
- Performance profiling active

### Production (`npm run build`)
- Only console.error and console.warn
- No window object pollution
- User-friendly error messages
- Minimal logging overhead

## Testing the Cleanup

To verify the cleanup:

```bash
# Check for remaining debug logs
grep -r "console\.log" src/pages/
grep -r "console\.debug" src/pages/
grep -r "console\.time" src/pages/

# Build and check bundle size
npm run build
ls -lh dist/assets/*.js
```

## Conclusion

The current approach keeps debug logs in source code but provides a clear path to remove them in production builds. This balance allows for:

1. Easy debugging during development
2. Quick troubleshooting of user issues
3. Performance monitoring
4. Clean production builds when needed

---

**Last Updated**: October 28, 2025
**Cleanup Status**: Partial (scripts archived, source logs documented)
**Production Ready**: Yes (with build-time log removal recommended)
