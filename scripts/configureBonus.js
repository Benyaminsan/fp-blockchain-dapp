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

async function loadVoting() {
  const addrPath = path.resolve(__dirname, '..', 'deployedAddress.txt');
  if (!fs.existsSync(addrPath)) {
    throw new Error('deployedAddress.txt not found. Run deploy first.');
  }

  const address = fs.readFileSync(addrPath, 'utf8').trim();
  const Voting = await ethers.getContractFactory('Voting');
  const voting = await Voting.attach(address);
  const [owner] = await ethers.getSigners();

  return { voting, owner, address };
}

function printUsage() {
  console.log('Usage:');
  console.log('  npx hardhat run scripts/configureBonus.js --network localhost deadline <unixTimestamp>');
  console.log('  npx hardhat run scripts/configureBonus.js --network localhost quorum <minVotes>');
  console.log('  npx hardhat run scripts/configureBonus.js --network localhost weight <address> <weight>');
  console.log('');
}

async function setDeadline(voting, owner, timestamp) {
  const tx = await voting.connect(owner).setDeadline(timestamp);
  console.log('setDeadline tx:', tx.hash);
  await tx.wait();
  const date = new Date(timestamp * 1000);
  console.log('Deadline set to:', timestamp, '-', date.toUTCString(), '(UTC)');
}

function resolveDeadlineValue(input) {
  const value = parseInt(input, 10);
  if (Number.isNaN(value)) {
    throw new Error('Invalid deadline value');
  }

  // Small values are treated as relative seconds from now.
  // Large values are treated as an absolute Unix timestamp.
  if (value < 1000000000) {
    return Math.floor(Date.now() / 1000) + value;
  }

  return value;
}

async function setQuorum(voting, owner, quorum) {
  const tx = await voting.connect(owner).setQuorum(quorum);
  console.log('setQuorum tx:', tx.hash);
  await tx.wait();
  console.log('Quorum set to:', quorum);
}

async function setWeight(voting, owner, voterAddress, weight) {
  const tx = await voting.connect(owner).setWeight(voterAddress, weight);
  console.log('setWeight tx:', tx.hash);
  await tx.wait();
  console.log(`Weight set to ${weight} for ${voterAddress}`);
}

async function main() {
  const args = process.argv.slice(2);
  const { voting, owner, address } = await loadVoting();

  console.log('Using contract:', address);

  if (!args.length) {
    printUsage();
    const choice = (await askQuestion('Choose feature (deadline/quorum/weight): ')).trim().toLowerCase();

    if (choice === 'deadline') {
      const raw = (await askQuestion('Enter seconds from now (for example 10), or a unix timestamp: ')).trim();
      const value = resolveDeadlineValue(raw);
      await setDeadline(voting, owner, value);
      return;
    }

    if (choice === 'quorum') {
      const value = parseInt((await askQuestion('Enter minimum votes: ')).trim(), 10);
      if (Number.isNaN(value)) throw new Error('Invalid quorum');
      await setQuorum(voting, owner, value);
      return;
    }

    if (choice === 'weight') {
      const voterAddress = (await askQuestion('Enter voter address: ')).trim();
      const value = parseInt((await askQuestion('Enter weight: ')).trim(), 10);
      if (!ethers.isAddress(voterAddress)) throw new Error('Invalid address');
      if (Number.isNaN(value)) throw new Error('Invalid weight');
      await setWeight(voting, owner, voterAddress, value);
      return;
    }

    console.log('No valid feature chosen.');
    return;
  }

  const feature = args[0].toLowerCase();

  if (feature === 'deadline') {
    if (!args[1]) throw new Error('Missing deadline value');
    const value = resolveDeadlineValue(args[1]);
    await setDeadline(voting, owner, value);
    return;
  }

  if (feature === 'quorum') {
    const value = parseInt(args[1], 10);
    if (Number.isNaN(value)) throw new Error('Missing or invalid quorum');
    await setQuorum(voting, owner, value);
    return;
  }

  if (feature === 'weight') {
    const voterAddress = args[1];
    const value = parseInt(args[2], 10);
    if (!ethers.isAddress(voterAddress)) throw new Error('Missing or invalid address');
    if (Number.isNaN(value)) throw new Error('Missing or invalid weight');
    await setWeight(voting, owner, voterAddress, value);
    return;
  }

  printUsage();
  throw new Error(`Unknown feature: ${feature}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exitCode = 1;
});
