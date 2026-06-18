const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = voting.target || voting.address;
  console.log("Voting deployed to:", address);

  const outPath = path.resolve(__dirname, "..", "deployedAddress.txt");
  fs.writeFileSync(outPath, address, { encoding: "utf8" });
  console.log("Address written to", outPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
