import hre from "hardhat";

async function main() {
  console.log('🔍 Verifying English Test Case\n');
  console.log('='.repeat(70) + '\n');

  const contractAddress = "0x39721cF3F22b390848940E2A08309c7b1F1E7641";
  const JuryChain = await hre.ethers.getContractAt("JuryChain", contractAddress);

  try {
    console.log('Step 1: Fetching Case IDs...');
    console.log('-'.repeat(70));

    const caseIds = await JuryChain.getCaseIds();
    console.log(`  Total Cases: ${caseIds.length}`);
    console.log(`  Case IDs: ${caseIds.map(id => id.toString()).join(', ')}\n`);

    if (caseIds.length === 0) {
      console.log('⚠️  No cases found on contract\n');
      return;
    }

    console.log('Step 2: Fetching Case Details...');
    console.log('-'.repeat(70));

    for (const caseId of caseIds) {
      const caseInfo = await JuryChain.getCase(caseId);

      console.log(`\n📋 Case #${caseId.toString()}`);
      console.log(`  Judge: ${caseInfo.judge}`);
      console.log(`  Deadline: ${new Date(Number(caseInfo.deadline) * 1000).toISOString()}`);
      console.log(`  Status: ${caseInfo.isClosed ? 'Closed' : 'Active'}`);
      console.log(`  Juror Count: ${caseInfo.jurorCount.toString()}`);
      console.log(`  Votes Cast: ${caseInfo.votesCast.toString()}`);

      // Decode metadata
      const metadataURI = caseInfo.metadataURI;
      if (metadataURI.startsWith('data:application/json;base64,')) {
        const base64 = metadataURI.replace('data:application/json;base64,', '');
        const json = Buffer.from(base64, 'base64').toString('utf-8');
        const metadata = JSON.parse(json);

        console.log(`\n  📝 Metadata:`);
        console.log(`     Title: ${metadata.title}`);
        console.log(`     Description: ${metadata.description}`);
        console.log(`     Created At: ${metadata.createdAt}`);

        // Check if it's in English
        const hasNonEnglish = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/.test(JSON.stringify(metadata));
        console.log(`\n  ✅ Language Check: ${hasNonEnglish ? '❌ Contains non-English characters' : '✅ English only'}`);
      } else {
        console.log(`  Metadata URI: ${metadataURI}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Verification Complete!\n');
    console.log('Contract Information:');
    console.log(`  Address: ${contractAddress}`);
    console.log(`  Network: Sepolia Testnet`);
    console.log(`  Total Cases: ${caseIds.length}`);
    console.log('\nFrontend URL:');
    console.log(`  http://localhost:8080/dapp\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
  }
}

main().catch(console.error);
