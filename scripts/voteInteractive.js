const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { ethers } = require('hardhat');

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  const addrPath = path.resolve(__dirname, '..', 'deployedAddress.txt');
  if (!fs.existsSync(addrPath)) {
    console.error('deployedAddress.txt not found. Run deploy first.');
    process.exit(1);
  }

  const address = fs.readFileSync(addrPath, 'utf8').trim();
  const Voting = await ethers.getContractFactory('Voting');
  const voting = await Voting.attach(address);

  const countBN = await voting.proposalCount();
  const count = Number(countBN);
  if (count === 0) {
    console.log('No proposals found. Create proposals first.');
    return;
  }

  console.log('Proposals:');
  for (let i = 0; i < count; i++) {
    const p = await voting.getProposal(i);
    console.log(`${i}: ${p[0]} (votes: ${p[1].toString()})`);
  }

  const signerAns = await askQuestion('Enter voter signer index (default 1): ');
  const signerIndex = signerAns.trim() ? parseInt(signerAns.trim(), 10) : 1;
  const signers = await ethers.getSigners();
  if (isNaN(signerIndex) || signerIndex < 0 || signerIndex >= signers.length) {
    console.error('Invalid signer index');
    return;
  }

  const idAns = await askQuestion('Enter proposal id to vote for: ');
  const proposalId = parseInt(idAns.trim(), 10);
  if (isNaN(proposalId) || proposalId < 0 || proposalId >= count) {
    console.error('Invalid proposal id');
    return;
  }

  const voter = signers[signerIndex];
  console.log(`Sending vote from signer ${signerIndex} (${voter.address}) to proposal ${proposalId}`);

  try {
    const tx = await voting.connect(voter).vote(proposalId);
    console.log('Vote tx:', tx.hash);
    const receipt = await tx.wait();
    console.log('Vote successful — tx hash:', tx.hash);
    const p = await voting.getProposal(proposalId);
    console.log(`Updated votes for ${p[0]}: ${p[1].toString()}`);
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    if (msg.toLowerCase().includes('already voted') || msg.includes('Already voted')) {
      console.log('You have already voted for this proposal (or this signer has).');
    } else if (msg.toLowerCase().includes('invalid proposal') || msg.includes('Invalid proposal')) {
      console.log('Invalid proposal id.');
    } else {
      console.error('Vote failed:', msg.split('\n')[0]);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
