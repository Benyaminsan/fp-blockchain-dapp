// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public owner;

    struct Proposal {
        string name;
        uint256 voteCount;
    }

    Proposal[] public proposals;

    // voter => bool (one vote per user)
    mapping(address => bool) public hasVoted;

    // bonus features
    uint256 public deadline; // unix timestamp, 0 = no deadline
    uint256 public quorum; // minimum votes required
    mapping(address => uint256) public weight; // voter weight (default 1)

    event ProposalCreated(uint256 indexed proposalId, string name);
    event Voted(address indexed voter, uint256 indexed proposalId);
    event DeadlineSet(uint256 timestamp);
    event QuorumSet(uint256 quorum);
    event WeightSet(address indexed voter, uint256 weight);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- bonus setters ---
    function setDeadline(uint256 _timestamp) external onlyOwner {
        deadline = _timestamp;
        emit DeadlineSet(_timestamp);
    }

    function setQuorum(uint256 _quorum) external onlyOwner {
        quorum = _quorum;
        emit QuorumSet(_quorum);
    }

    function setWeight(address _voter, uint256 _weight) external onlyOwner {
        weight[_voter] = _weight;
        emit WeightSet(_voter, _weight);
    }

    function createProposal(string calldata name) external onlyOwner {
        proposals.push(Proposal({name: name, voteCount: 0}));
        emit ProposalCreated(proposals.length - 1, name);
    }

    function vote(uint256 proposalId) external {
        require(proposalId < proposals.length, "Invalid proposal");
        require(!hasVoted[msg.sender], "Already voted");
        if (deadline != 0) {
            require(block.timestamp <= deadline, "Voting closed");
        }

        uint256 w = weight[msg.sender];
        if (w == 0) {
            w = 1;
        }

        hasVoted[msg.sender] = true;
        proposals[proposalId].voteCount += w;

        emit Voted(msg.sender, proposalId);
    }

    /// @notice Check if a proposal meets the quorum requirement (if set)
    function meetsQuorum(uint256 proposalId) external view returns (bool) {
        require(proposalId < proposals.length, "Invalid proposal");
        if (quorum == 0) return true;
        return proposals[proposalId].voteCount >= quorum;
    }

    function getProposal(uint256 proposalId) external view returns (string memory name, uint256 voteCount) {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        return (p.name, p.voteCount);
    }

    function proposalCount() external view returns (uint256) {
        return proposals.length;
    }
}
