import { test, expect } from "@playwright/test";
import fs from "fs";

const JUROR_ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
const BASE_URL = (process.env.JURYCHAIN_PREVIEW_URL ?? "http://127.0.0.1:4173").replace(/\/$/, "");

async function fillCaseForm(page: any) {
  await page.fill('input[placeholder="ipfs://cid-or-http"]', "ipfs://jury-case-e2e");
  await page.fill('textarea[placeholder="0xabc...def, 0x123...456"]', JUROR_ADDRESS);
  await page.fill('input[type="number"]', "1");
  await page.getByRole("button", { name: "Create Case" }).click();
}

test("juror can create, vote, close, and decrypt a case", async ({ page }) => {
  page.on("console", (message) => {
    console.log(`[console:${message.type()}] ${message.text()}`);
  });
  page.on("pageerror", (error) => {
    console.error(`[pageerror] ${error.message}`);
  });

  await page.goto(`${BASE_URL}/dapp`);

  const maybeConnect = page.getByRole("button", { name: /Connect Mock Wallet/i });
  const connectVisible = await maybeConnect.isVisible();
  console.log("[e2e] connect button visible:", connectVisible);
  if (connectVisible) {
    await maybeConnect.click();
    await expect(page.getByRole("button", { name: /Disconnect Mock Wallet/i })).toBeVisible();
  }

  await page.screenshot({ path: "test-results/dapp-before.png", fullPage: true });
  const pageHtml = await page.content();
  await fs.promises.writeFile("test-results/dapp-before.html", pageHtml, "utf-8");

  await expect(page.getByText("Create New Case")).toBeVisible();

  await fillCaseForm(page);
  await expect(page.getByText("Case created").first()).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(1_000);
  const casesSnapshot = await page.evaluate(() => (window as any).__JURYCHAIN_CASES__);
  const casesError = await page.evaluate(() => (window as any).__JURYCHAIN_CASES_ERROR__);
  console.log("[e2e] cases snapshot:", casesSnapshot);
  console.log("[e2e] cases error:", casesError);
  await expect(page.getByText("Case #1")).toBeVisible({ timeout: 20_000 });

  const voteButton = page.getByRole("button", { name: "Vote Guilty" });
  await voteButton.click();
  await expect(page.getByTestId("vote-status-1")).toBeVisible();

  await page.getByRole("button", { name: "Close Case" }).click();
  await expect(page.getByTestId("status-1")).toHaveText("Closed", { timeout: 20_000 });

  await page.getByRole("button", { name: "Decrypt Tallies" }).click();
  const guiltyCard = page.getByTestId("tallies-1-guilty");
  const notGuiltyCard = page.getByTestId("tallies-1-not-guilty");
  await expect(guiltyCard).toContainText("Guilty");
  await expect(guiltyCard).toContainText("1");
  await expect(notGuiltyCard).toContainText("Not Guilty");
  await expect(notGuiltyCard).toContainText("0");
});
