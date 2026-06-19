# eVoting dApp

## Deskripsi
Decentralized Application (dApp) untuk sistem pemilihan umum (Voting) secara on-chain. Aplikasi ini menjamin transparansi hasil suara, mencegah manipulasi (satu akun = satu suara), dan memiliki fitur pengaturan batas waktu (deadline) serta syarat minimum pemilih (quorum).

## Anggota Kelompok
| Nama | NRP | Kontribusi |
|------|-----|------------|
| M. Abhinaya Al Faruqi | 5027231011 | Frontend UI/UX & Integrasi Web3 |
| Abhirama Triadyatma Hermawan | 5027231061 | Smart Contract |
| Benjamin Khawarizmi Habibi | 5027231078 | Testing, & Dokumentasi |

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
### Wallet not connected
<img width="1918" height="1021" alt="Screenshot 2026-06-19 104852" src="https://github.com/user-attachments/assets/f7318db4-5eac-4c67-a33c-7d8b9bfa9473" />

### Wallet connected
<img width="1600" height="834" alt="image" src="https://github.com/user-attachments/assets/2565a0a4-30ef-4b9d-90ca-8a9323b0a440" />

### Read operation
<img width="1888" height="982" alt="Screenshot 2026-06-19 110045" src="https://github.com/user-attachments/assets/529e1c15-a33e-4b16-bbac-eda640dcc09f" />

### Write pending
<img width="1893" height="948" alt="Screenshot 2026-06-19 105358" src="https://github.com/user-attachments/assets/56cb3175-86ad-4db5-9bd9-d48a7c993e51" />

### Write success
<img width="1902" height="967" alt="Screenshot 2026-06-19 105230" src="https://github.com/user-attachments/assets/48e6ed01-6292-45cf-9ec8-a8c0b28ef994" />

### MetaMask Popup
<img width="1905" height="970" alt="Screenshot 2026-06-19 110452" src="https://github.com/user-attachments/assets/4fc7bfde-bf62-41ff-a984-8d17945c4062" />


### State updated
Sebelum
<img width="1888" height="982" alt="Screenshot 2026-06-19 110045" src="https://github.com/user-attachments/assets/7ae40432-1bb9-4f62-8560-e0cef4a32e96" />

Sesudah
<img width="1905" height="970" alt="Screenshot 2026-06-19 110452" src="https://github.com/user-attachments/assets/80c02218-7de5-41a8-96bf-151e8c464221" />


### Error handling
<img width="1433" height="453" alt="Screenshot 2026-06-19 105634" src="https://github.com/user-attachments/assets/839aa894-71a6-4762-a999-097b3d6920f1" />


### Arsitektur
```
┌─────────────────────────────────────────────┐
│         FRONTEND (React.js)                 │
│  - UI untuk voting, admin panel             │
│  - MetaMask integration                     │
│  - Real-time event listeners                │
└────────────────────┬────────────────────────┘
                     │ ethers.js
                     │ (contract interaction)
┌────────────────────▼────────────────────────┐
│      BLOCKCHAIN (Hardhat Local Node)        │
│  - Chain ID: 31337 (Localhost)              │
│  - Contract Address: 0x5FbDB2315678afecb... │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│    SMART CONTRACT: Voting.sol (Solidity)    │
│  - Owner management                         │
│  - Proposal management                      │
│  - Voting mechanism                         │
│  - Advanced features (deadline, quorum)     │
└─────────────────────────────────────────────┘
```



