/**
 * JuryChain Smart Contract Tests
 *
 * These tests validate the core functionality of the JuryChain contract:
 * - Case creation by judge
 * - Encrypted vote casting by authorized jurors
 * - Access control (only jurors can vote)
 * - Double-vote prevention
 * - Case closure and result decryption
 *
 * The tests use @fhevm/hardhat-plugin which provides FHE mock operations
 * for testing encrypted computations on the Hardhat network.
 *
 * Run tests with: npm test
 */

import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "ethers";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("JuryChain", () => {
  /**
   * Main Integration Test
   *
   * This test validates the complete workflow:
   * 1. Deploy contract
   * 2. Judge creates a case with authorized jurors
   * 3. Jurors cast encrypted votes (guilty/not-guilty)
   * 4. Unauthorized account cannot vote (access control)
   * 5. Double-voting is prevented
   * 6. Judge closes the case
   * 7. Encrypted tallies are decrypted and verified
   */
  it("allows jurors to cast encrypted votes and reveals tallies after closure", async () => {
    // ========== SETUP ==========
    // Get test accounts
    const [judge, jurorA, jurorB, outsider] = await hre.ethers.getSigners();

    // Deploy JuryChain contract
    const factory = await hre.ethers.getContractFactory("JuryChain");
    const contract = await factory.connect(judge).deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    // Verify FHE coprocessor is initialized (required for FHE operations)
    await hre.fhevm.assertCoprocessorInitialized(contract, "JuryChain");

    // ========== STEP 1: Create Case ==========
    // Judge creates a case with 2 jurors and 1 hour voting period
    const createTx = await contract
      .connect(judge)
      .createCase("ipfs://jury-case-1", [jurorA.address, jurorB.address], 3600);
    await createTx.wait();

    // Verify case was created correctly
    const summary = await contract.getCase(1);
    expect(summary.judge).to.equal(judge.address);
    expect(summary.jurorCount).to.equal(2n);
    expect(summary.isClosed).to.equal(false);

    // ========== STEP 2: Prepare Encrypted Votes ==========
    // JurorA votes GUILTY (1)
    const guiltyInput = hre.fhevm.createEncryptedInput(contractAddress, jurorA.address);
    guiltyInput.add32(1); // 1 = guilty
    const guiltyEncrypted = await guiltyInput.encrypt();

    // JurorB votes NOT GUILTY (0)
    const notGuiltyInput = hre.fhevm.createEncryptedInput(contractAddress, jurorB.address);
    notGuiltyInput.add32(0); // 0 = not guilty
    const notGuiltyEncrypted = await notGuiltyInput.encrypt();

    // ========== STEP 3: Test Access Control ==========
    // Outsider (not a juror) should NOT be able to vote
    await expect(
      contract
        .connect(outsider)
        .castVote(1, guiltyEncrypted.handles[0], guiltyEncrypted.inputProof),
    ).to.be.revertedWithCustomError(contract, "NotJuror");

    // ========== STEP 4: Cast Valid Votes ==========
    // JurorA casts encrypted guilty vote
    await (await contract
      .connect(jurorA)
      .castVote(1, guiltyEncrypted.handles[0], guiltyEncrypted.inputProof)).wait();

    // ========== STEP 5: Test Double-Vote Prevention ==========
    // JurorA tries to vote again - should fail
    await expect(
      contract
        .connect(jurorA)
        .castVote(1, guiltyEncrypted.handles[0], guiltyEncrypted.inputProof),
    ).to.be.revertedWithCustomError(contract, "AlreadyVoted");

    // JurorB casts encrypted not-guilty vote
    await (await contract
      .connect(jurorB)
      .castVote(1, notGuiltyEncrypted.handles[0], notGuiltyEncrypted.inputProof)).wait();

    // ========== STEP 6: Close Case ==========
    // Judge closes the case, granting decryption permissions
    await (await contract.connect(judge).closeCase(1)).wait();

    // ========== STEP 7: Decrypt and Verify Tallies ==========
    // Get encrypted tally handles
    const tallies = await contract.getEncryptedTallies(1);

    // Decrypt guilty vote count (should be 1)
    const decryptedGuilty = await hre.fhevm.userDecryptEuint(
      FhevmType.euint32,
      tallies[0],
      contractAddress,
      judge,
    );

    // Decrypt not-guilty vote count (should be 1)
    const decryptedNotGuilty = await hre.fhevm.userDecryptEuint(
      FhevmType.euint32,
      tallies[1],
      contractAddress,
      judge,
    );

    // Verify tallies: 1 guilty, 1 not-guilty
    expect(decryptedGuilty).to.equal(1n);
    expect(decryptedNotGuilty).to.equal(1n);

    // ========== STEP 8: Verify Vote Status ==========
    // Verify hasVoted tracking is correct
    expect(await contract.hasVoted(1, jurorA.address)).to.equal(true);
    expect(await contract.hasVoted(1, jurorB.address)).to.equal(true);
    expect(await contract.hasVoted(1, outsider.address)).to.equal(false);
  });
});
