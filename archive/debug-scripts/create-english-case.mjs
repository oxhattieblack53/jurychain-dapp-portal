import hre from "hardhat";

async function main() {
  console.log('Creating English Test Case on New Contract\n');
  console.log('='.repeat(70) + '\n');

  const contractAddress = "0x39721cF3F22b390848940E2A08309c7b1F1E7641";
  const JuryChain = await hre.ethers.getContractAt("JuryChain", contractAddress);

  const [signer] = await hre.ethers.getSigners();
  console.log('Deployer Account:', signer.address);
  console.log('');

  try {
    // Create English test case
    console.log('Step 1: Creating English Test Case');
    console.log('-'.repeat(70));

    const metadata = JSON.stringify({
      title: "Patent Infringement Case",
      description: "A software company alleges that a competitor has violated their patent rights by using proprietary algorithms without authorization. The jury must determine if infringement occurred and assess damages.",
      createdAt: new Date().toISOString()
    });
    const metadataURI = `data:application/json;base64,${Buffer.from(metadata).toString('base64')}`;

    const jurors = [signer.address];
    const votingDuration = 86400; // 1 day

    console.log(`  Case Title: Patent Infringement Case`);
    console.log(`  Description: Software patent violation case`);
    console.log(`  Jurors: ${jurors[0]}`);
    console.log(`  Voting Period: 1 day\n`);

    const createTx = await JuryChain.createCase(metadataURI, jurors, votingDuration, {
      gasLimit: 1000000n
    });
    console.log(`  Transaction Hash: ${createTx.hash}`);

    const createReceipt = await createTx.wait();
    console.log(`  Success! Gas Used: ${createReceipt.gasUsed.toString()}`);
    console.log(`  Etherscan: https://sepolia.etherscan.io/tx/${createTx.hash}\n`);

    // Get case ID
    const event = createReceipt.logs.find(log => {
      try {
        const parsed = JuryChain.interface.parseLog(log);
        return parsed.name === 'CaseCreated';
      } catch {
        return false;
      }
    });

    const caseId = event ? JuryChain.interface.parseLog(event).args.caseId : 1n;
    console.log(`  Case ID: ${caseId}\n`);

    // Verify case data
    console.log('Step 2: Verifying Case Data');
    console.log('-'.repeat(70));

    const caseInfo = await JuryChain.getCase(caseId);
    console.log(`  Judge: ${caseInfo.judge}`);
    console.log(`  Deadline: ${new Date(Number(caseInfo.deadline) * 1000).toISOString()}`);
    console.log(`  Status: ${caseInfo.isClosed ? 'Closed' : 'Active'}`);
    console.log(`  Juror Count: ${caseInfo.jurorCount.toString()}`);
    console.log(`  Votes Cast: ${caseInfo.votesCast.toString()}\n`);

    // Summary
    console.log('='.repeat(70));
    console.log('\nTest Case Created Successfully!\n');
    console.log('Contract Information:');
    console.log(`  Address: ${contractAddress}`);
    console.log(`  Network: Sepolia Testnet`);
    console.log(`  Case ID: ${caseId.toString()}`);
    console.log('\nFrontend URLs:');
    console.log(`  Main Page: http://localhost:8080/dapp`);
    console.log(`  Case Details: http://localhost:8080/case/${caseId}\n`);
    console.log('Note: All case metadata is in English only.\n');

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
  }
}

main().catch(console.error);
