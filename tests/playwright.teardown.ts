import type { ChildProcessWithoutNullStreams } from "child_process";

export default async function globalTeardown() {
  const hardhatProcess = (globalThis as any).__JURYCHAIN_HARDHAT__ as
    | ChildProcessWithoutNullStreams
    | undefined;
  const devServerProcess = (globalThis as any).__JURYCHAIN_DEV_SERVER__ as
    | ChildProcessWithoutNullStreams
    | undefined;

  if (devServerProcess && !devServerProcess.killed) {
    devServerProcess.kill("SIGINT");
  }

  if (hardhatProcess && !hardhatProcess.killed) {
    hardhatProcess.kill("SIGINT");
  }
}
