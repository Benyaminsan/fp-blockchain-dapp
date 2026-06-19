# eVoting dApp

## Deskripsi
Decentralized Application (dApp) untuk sistem pemilihan umum (Voting) secara on-chain. Aplikasi ini menjamin transparansi hasil suara, mencegah manipulasi (satu akun = satu suara), dan memiliki fitur pengaturan batas waktu (deadline) serta syarat minimum pemilih (quorum).

## Anggota Kelompok
| Nama | NRP | Kontribusi |
|------|-----|------------|
| M. Abhinaya Al Faruqi | 5027231011 | Frontend UI/UX & Integrasi Web3 |
| [Nama Teman 1] | [NRP Teman] | Smart Contract |
| Benjamin Khawarizmi Habibi | 5027231078 | Testing, Deploy, & Dokumentasi |

## Tech Stack
- Frontend: React + Vite
- Smart Contract: Solidity + Hardhat
- Web3 Library: ethers.js (v6)
- Wallet: MetaMask

## Fitur
- [x] Connect Wallet (MetaMask)
- [x] Read Data: Menampilkan jumlah suara dan daftar proposal secara *real-time*
- [x] Read Data: Menampilkan sisa waktu (Countdown Timer) dan status Quorum
- [x] Write Data: User dapat memberikan suara (Vote)
- [x] Write Data: Owner dapat membuat Proposal, set Deadline, dan set Quorum (via Admin Panel)

## Cara Menjalankan

### Prerequisites
- Node.js v18+
- MetaMask browser extension
- Git

### 1. Clone Repository
```bash
git clone [url-repo]
cd [nama-folder]
```

### 2. Install Dependencies
```bash
# Root folder (smart contract)
npm install

# Frontend folder
cd frontend
npm install
```

### 3. Jalankan Local Blockchain
```bash
npx hardhat node
```

### 4. Deploy Smart Contract
Di terminal baru, jalankan:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Update Contract Address
- Copy address dari output deploy (biasanya `0x5FbDB...`)
- Paste ke dalam file `frontend/src/utils/contract.js` pada variabel `CONTRACT_ADDRESS`

### 6. Import Account ke MetaMask
- Copy private key dari Hardhat node (Gunakan Account #0 untuk login sebagai Owner/Admin)
- Import ke MetaMask
- Ganti network ke **Localhost 8545** (Chain ID: 31337)

### 7. Jalankan Frontend
```bash
cd frontend
npm run dev
```

### 8. Buka Browser
Buka `http://localhost:5173`

## Contract Address
- Local: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

## Demo
[Masukkan Link Video Demo atau GIF di sini]

## Screenshot
<img width="1600" height="834" alt="image" src="https://github.com/user-attachments/assets/2565a0a4-30ef-4b9d-90ca-8a9323b0a440" />

