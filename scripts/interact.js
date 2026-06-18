const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  const addrPath = path.resolve(__dirname, "..", "deployedAddress.txt");
  if (!fs.existsSync(addrPath)) {
    console.error("deployedAddress.txt not found. Run deploy first.");
    process.exit(1);
  }

  const address = fs.readFileSync(addrPath, "utf8").trim();
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.attach(address);

  const [owner, voter1, voter2] = await ethers.getSigners();

  console.log("Interacting with Voting at", address);

  // Owner creates a proposal (safe: handle already-created case)
  try {
    const tx = await voting.connect(owner).createProposal("Alice");
    console.log("createProposal tx:", tx.hash);
    await tx.wait();
    console.log("Proposal 'Alice' created by owner");
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    if (msg.includes("revert") && msg.includes("Already")) {
      console.log("Proposal creation reverted: already exists");
    } else {
      console.error("Create proposal failed:", e);
      process.exitCode = 1;
      return;
    }
  }

  // Voter1 votes (friendly message if already voted)
  try {
    const vtx = await voting.connect(voter1).vote(0);
    console.log("vote tx:", vtx.hash);
    await vtx.wait();
    console.log("voter1 voted for proposal 0");
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    if (msg.toLowerCase().includes("already voted") || msg.includes("Already voted")) {
      console.log("voter1: you have already voted");
    } else {
      console.error("Vote failed:", e);
      process.exitCode = 1;
      return;
    }
  }

  // Read proposal
  const p = await voting.getProposal(0);
  console.log("Proposal 0 -> name:", p[0], "votes:", p[1].toString());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
