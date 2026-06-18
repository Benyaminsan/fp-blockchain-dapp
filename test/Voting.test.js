const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let voting, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.waitForDeployment();
  });

  it("should set correct owner", async function () {
    expect(await voting.owner()).to.equal(owner.address);
  });

  it("owner can create proposal", async function () {
    await expect(voting.createProposal("Alice")).to.emit(voting, "ProposalCreated");
    const count = await voting.proposalCount();
    expect(count).to.equal(1);
  });

  it("non-owner cannot create proposal", async function () {
    await expect(voting.connect(addr1).createProposal("Bob")).to.be.revertedWith("Only owner");
  });

  it("voter can vote and votes counted", async function () {
    await voting.createProposal("Alice");
    await expect(voting.connect(addr1).vote(0)).to.emit(voting, "Voted");
    const p = await voting.getProposal(0);
    expect(p.voteCount).to.equal(1);
    expect(await voting.hasVoted(addr1.address)).to.equal(true);
  });

  it("prevents double voting by same address", async function () {
    // create two proposals and ensure a voter cannot vote twice (global)
    await voting.createProposal("Alice");
    await voting.createProposal("Bob");
    await voting.connect(addr1).vote(0);
    // cannot vote again for the same or another proposal
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Already voted");
    await expect(voting.connect(addr1).vote(1)).to.be.revertedWith("Already voted");
  });

  it("reverts when voting invalid proposal", async function () {
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Invalid proposal");
  });

  it("respects deadline and rejects votes after close", async function () {
    await voting.createProposal("Alice");
    const block = await ethers.provider.getBlock('latest');
    const past = block.timestamp - 10; // already passed
    await voting.setDeadline(past);
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Voting closed");
  });

  it("counts weighted votes when owner sets weight", async function () {
    await voting.createProposal("Alice");
    await voting.setWeight(addr1.address, 3);
    await voting.connect(addr1).vote(0);
    const p = await voting.getProposal(0);
    expect(p.voteCount).to.equal(3);
  });

  it("meets quorum when votes reach threshold", async function () {
    await voting.setQuorum(2);
    await voting.createProposal("Alice");
    await voting.connect(addr1).vote(0);
    await voting.connect(addr2).vote(0);
    expect(await voting.meetsQuorum(0)).to.equal(true);
  });

  it("getProposal returns correct name and count", async function () {
    await voting.createProposal("Alice");
    await voting.connect(addr1).vote(0);
    const [name, votes] = await voting.getProposal(0);
    expect(name).to.equal("Alice");
    expect(votes).to.equal(1);
  });

  it("emits events for create and vote", async function () {
    await expect(voting.createProposal("Alice")).to.emit(voting, "ProposalCreated");
    await voting.connect(addr1).vote(0);
    await expect(voting.connect(addr2).vote(0)).to.emit(voting, "Voted");
  });
});
