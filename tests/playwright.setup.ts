import type { FullConfig } from "@playwright/test";
import { spawn, spawnSync, ChildProcessWithoutNullStreams } from "child_process";
import net from "net";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const blockchainDir = path.join(rootDir, "blockchain");
const appDir = rootDir;
const DEV_PORT = 4173;

function waitForOutput(proc: ChildProcessWithoutNullStreams, matcher: RegExp, timeoutMs = 40_000) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      proc.kill("SIGINT");
      reject(new Error(`Timeout waiting for: ${matcher}`));
    }, timeoutMs);

    const onData = (data: Buffer) => {
      const text = data.toString();
      if (matcher.test(text)) {
        clearTimeout(timeout);
        proc.stdout.off("data", onData);
        proc.stderr.off("data", onErrorData);
        proc.off("exit", onExit);
        resolve();
      }
    };

    const onErrorData = (data: Buffer) => {
      const text = data.toString();
      if (matcher.test(text)) {
        clearTimeout(timeout);
        proc.stdout.off("data", onData);
        proc.stderr.off("data", onErrorData);
        proc.off("exit", onExit);
        resolve();
      }
    };

    const onExit = (code: number | null) => {
      clearTimeout(timeout);
      proc.stdout.off("data", onData);
      proc.stderr.off("data", onErrorData);
      reject(new Error(`Process exited before emitting match. code=${code}`));
    };

    proc.stdout.on("data", (data) => {
      process.stdout.write(`[hardhat] ${data}`);
      onData(data);
    });
    proc.stderr.on("data", (data) => {
      process.stderr.write(`[hardhat-err] ${data}`);
      onErrorData(data);
    });
    proc.on("exit", onExit);
  });
}

async function waitForPort(port: number, host = "127.0.0.1", timeoutMs = 40_000) {
  const started = Date.now();
  return new Promise<void>((resolve, reject) => {
    const attempt = () => {
      const socket = net
        .createConnection({ port, host }, () => {
          socket.end();
          resolve();
        })
        .on("error", () => {
          socket.destroy();
          if (Date.now() - started > timeoutMs) {
            reject(new Error(`Timeout waiting for ${host}:${port}`));
          } else {
            setTimeout(attempt, 500);
          }
        });
    };
    attempt();
  });
}

async function waitForPreviewUrl(proc: ChildProcessWithoutNullStreams, timeoutMs = 40_000) {
  const matcher = /http:\/\/127\.0\.0\.1:(\d+)\//;
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      proc.stdout.off("data", onData);
      proc.stderr.off("data", onErrorData);
      proc.off("exit", onExit);
      reject(new Error("Timeout waiting for Vite preview URL"));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timeout);
      proc.stdout.off("data", onData);
      proc.stderr.off("data", onErrorData);
      proc.off("exit", onExit);
    };

    const onData = (data: Buffer) => {
      const text = data.toString();
      process.stdout.write(`[preview] ${text}`);
      const match = text.match(matcher);
      if (match) {
        cleanup();
        resolve(match[0].trim());
      }
    };

    const onErrorData = (data: Buffer) => {
      const text = data.toString();
      process.stderr.write(`[preview-err] ${text}`);
      const match = text.match(matcher);
      if (match) {
        cleanup();
        resolve(match[0].trim());
      }
    };

    const onExit = (code: number | null) => {
      cleanup();
      reject(new Error(`Vite preview exited early. code=${code}`));
    };

    proc.stdout.on("data", onData);
    proc.stderr.on("data", onErrorData);
    proc.on("exit", onExit);
  });
}

export default async function globalSetup(_config: FullConfig) {
  const hhProcess = spawn("npx", ["hardhat", "node"], {
    cwd: blockchainDir,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  await waitForOutput(hhProcess, /Started HTTP and WebSocket JSON-RPC server/);

  const deployResult = spawnSync("npx", ["hardhat", "run", "scripts/deploy.ts", "--network", "localhost"], {
    cwd: blockchainDir,
    encoding: "utf-8",
  });

  if (deployResult.status !== 0) {
    hhProcess.kill("SIGINT");
    throw new Error(`Deployment failed: ${deployResult.stderr}`);
  }

  const match = deployResult.stdout.match(/JuryChain deployed at:\s+(0x[0-9a-fA-F]{40})/);
  if (!match) {
    hhProcess.kill("SIGINT");
    throw new Error(`Unable to parse contract address from deployment output: ${deployResult.stdout}`);
  }
  const contractAddress = match[1];

  const devEnv = {
    ...process.env,
    VITE_CONTRACT_ADDRESS: contractAddress,
    VITE_ENABLE_MOCK_CONNECTOR: "true",
    VITE_SEPOLIA_RPC_URL: "http://127.0.0.1:8545",
    VITE_WALLETCONNECT_ID: "mock",
    VITE_USE_DEV_FHE: "true",
    VITE_MOCK_PRIVATE_KEY:
      process.env.VITE_MOCK_PRIVATE_KEY ??
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  };

  const buildResult = spawnSync("npm", ["run", "build"], {
    cwd: appDir,
    env: devEnv,
    encoding: "utf-8",
    stdio: "inherit",
  });

  if (buildResult.status !== 0) {
    hhProcess.kill("SIGINT");
    throw new Error("Vite build failed. Check logs above.");
  }

  const devProcess = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(DEV_PORT)], {
    cwd: appDir,
    stdio: ["ignore", "pipe", "pipe"],
    env: devEnv,
  });

  const previewUrl = await waitForPreviewUrl(devProcess);
  process.env.JURYCHAIN_PREVIEW_URL = previewUrl;

  try {
    const url = new URL(previewUrl);
    await waitForPort(Number(url.port));
  } catch (error) {
    devProcess.kill("SIGINT");
    hhProcess.kill("SIGINT");
    throw error;
  }

  (globalThis as any).__JURYCHAIN_HARDHAT__ = hhProcess;
  (globalThis as any).__JURYCHAIN_DEV_SERVER__ = devProcess;
}
