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

  const [owner] = await ethers.getSigners();

  const args = process.argv.slice(2);
  let names = [];

  if (args.length) {
    names = args;
  } else {
    const answer = await askQuestion('Enter proposal names (comma-separated) or press Enter for defaults [Alice,Bob,Carol]: ');
    const parsed = answer.split(',').map(s => s.trim()).filter(Boolean);
    names = parsed.length ? parsed : ['Alice', 'Bob', 'Carol'];
  }

  console.log('Creating proposals:', names.join(', '));

  for (const name of names) {
    try {
      const tx = await voting.connect(owner).createProposal(name);
      console.log(`createProposal tx for ${name}:`, tx.hash);
      await tx.wait();
      console.log(`Created proposal: ${name}`);
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      console.error(`Failed to create '${name}':`, msg.split('\n')[0]);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
