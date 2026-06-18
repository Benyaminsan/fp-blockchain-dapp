# Voting — Project 2 Smart Contract


|Nama|NRP|
|------|------|
||50272310|
||50272310|
||50272310|

Contract: `Voting.sol`

Features implemented:
- Owner can create proposals
- Users can vote once per proposal
- View proposal name and vote count
- Events for proposal creation and voting

Quick start

Prerequisites: Node.js v18+

Install deps:

```bash
npm install
```

Compile:
```bash
npx hardhat compile
```

Run tests:
```bash
npx hardhat test
```

Deploy local:
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

Contract layout: see `contracts/Voting.sol`.

## Flow (Alur Program)

	- Owner (pembuat kontrak) dapat memanggil `createProposal(name)` untuk menambahkan proposal baru.
	- User memanggil `vote(proposalId)` untuk memberikan suara ke proposal tertentu (catatan: implementasi sekarang membatasi satu suara per alamat untuk seluruh election).
	- Kontrak menyimpan `hasVoted[address]` (global satu suara per alamat) untuk mencegah double-vote.
	- Semua aksi penting memancarkan event: `ProposalCreated` dan `Voted`.

1. Jalankan `npx hardhat node`.
2. Import salah satu private key yang ditampilkan ke MetaMask (gunakan jaringan RPC `http://127.0.0.1:8545`).
3. Deploy kontrak dengan `deploy.js` atau catat alamat dari proses deploy.
4. Gunakan alamat kontrak untuk membuat transaksi `createProposal` dan `vote` dari akun yang sesuai di MetaMask.

### Bonus Features & Updated Flow

- **Voting rule (implemented)**: one vote per user globally — each address can cast exactly one vote for the whole election (not once per proposal). This is enforced by `mapping(address => bool) public hasVoted;` and a `require(!hasVoted[msg.sender], "Already voted");` in `vote()`.

- **Deadline (bonus)**: owner can set a voting deadline with `setDeadline(uint256 timestamp)`. If `deadline != 0` votes after `deadline` are rejected with `Voting closed`.
	- Configure it with the dedicated script instead of the console:
		```bash
		npx hardhat run scripts/configureBonus.js --network localhost deadline 1730000000
		```

- **Quorum (bonus)**: owner can set a minimum quorum with `setQuorum(uint256)`. Check `meetsQuorum(proposalId)` to see if a proposal reached quorum.
	- Configure it with:
		```bash
		npx hardhat run scripts/configureBonus.js --network localhost quorum 10
		```

- **Weighted voting (bonus)**: owner can set per-address weight with `setWeight(address,uint256)`. `vote()` adds the voter's weight to the chosen proposal (default weight = 1 if unset).
	- Configure it with:
		```bash
		npx hardhat run scripts/configureBonus.js --network localhost weight 0xYourVoterAddress 3
		```

- **Bonus setup flow (script only, no console)**:
	- Use `scripts/configureBonus.js` to set deadline, quorum, and weights.
	- The script can run in interactive mode if you omit arguments:
		```bash
		npx hardhat run scripts/configureBonus.js --network localhost
		```
	- It will prompt you to choose `deadline`, `quorum`, or `weight`, then ask for the values.

- **Scripts & UX updates**:
	- Scripts now print transaction hashes immediately (e.g. `createProposal tx: <hash>`, `vote tx: <hash>`), then wait for confirmations. Use `deployedAddress.txt` to get the address.
	- Quick commands:
		```bash
		# deploy (writes deployedAddress.txt)
		npx hardhat run scripts/deploy.js --network localhost

		# create multiple proposals (interactive or args)
		npx hardhat run scripts/createProposals.js --network localhost Alice Bob Carol

		# configure bonus features without Hardhat console
		npx hardhat run scripts/configureBonus.js --network localhost deadline 1730000000
		npx hardhat run scripts/configureBonus.js --network localhost quorum 10
		npx hardhat run scripts/configureBonus.js --network localhost weight 0xYourVoterAddress 3

		# interactive voting (lists proposals and prompts signer index + proposal id)
		npx hardhat run scripts/voteInteractive.js --network localhost
		```

- **Notes for demo**:
	- Start `npx hardhat node` and keep it running while you deploy and demo.
	- Use `type deployedAddress.txt` (Windows) to copy the contract address for MetaMask/Remix.
	- Use `hasVoted(address)` to check whether an address already cast their vote.

## Frontend integration (quick)

- A minimal helper was added: `frontend/src/utils/contract.js` which exports `CONTRACT_ADDRESS` and `CONTRACT_ABI` (ABI copied from Hardhat artifacts). Update `CONTRACT_ADDRESS` after you deploy to local/testnet.

- Minimal integration checklist (required by project spec):
  - Wallet Connection: detect MetaMask and request account access.
  - Network Detection: show warning if MetaMask is on a wrong network (local vs testnet).
  - Account Display: show connected account address in the UI.
  - Read Operations: read proposal count and each proposal (`proposalCount()`, `getProposal(id)`).
  - Write Operations: allow the connected signer to call `vote(proposalId)` and show pending / success / error states.
  - Transaction Feedback: show spinner or status while `tx.wait()` is pending and show confirmation or error.

- Example snippets (ethers v6 style):

  Connect & provider:
  ```js
  import { ethers } from "ethers";
  import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./utils/contract";

  async function connectWallet() {
    if (!window.ethereum) throw new Error("Install MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return { provider, account: accounts[0] };
  }
  ```

  Read proposals:
  ```js
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const count = Number(await contract.proposalCount());
  for (let i = 0; i < count; i++) {
    const [name, votes] = await contract.getProposal(i);
    // render name and votes.toString()
  }
  ```

  Write (vote):
  ```js
  const signer = await provider.getSigner();
  const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contractWithSigner.vote(proposalId);
  // show pending; await tx.wait(); show success/error
  ```

## Status

- Tests: All Hardhat tests pass (11 passing locally).
- Contract ABI: present at `artifacts/contracts/Voting.sol/Voting.json` and copied into `frontend/src/utils/contract.js`.
- Contract address: `deployedAddress.txt` contains the latest address from the last deploy. Redeploy if you restarted `hardhat node`.

## Next suggested steps

1. If you want, I can scaffold a minimal React + Vite frontend implementing the required checklist (ConnectWallet, ProposalList, VoteButton, network/account display, tx feedback). (I can add routing/styles later.)
2. Or update the `CONTRACT_ADDRESS` after you run deploy and test the UI manually.

---

