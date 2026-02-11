# AgriProcure: Decentralized Offline-First Procurement Ecosystem

**AgriProcure** is a blockchain-based agricultural procurement platform designed to bridge the digital divide. It connects offline farmers (via **USSD/GSM**) directly to government and private buyers, ensuring transparent pricing, immutable quality verification, and instant payments via **Smart Contracts**.

---

## 🌾 The Core Problem & Solution

*   **The Problem:** Small farmers in remote India lack internet access (4G/5G) and smartphones, excluding them from digital marketplaces. They depend on middlemen who exploit this lack of information.
*   **The Solution:** A "Phygital" (Physical + Digital) bridge.
    1.  **Offline Access:** Farmers use simple feature phones ("Dumb Phones") to list produce via **USSD (Unstructured Supplementary Service Data)**.
    2.  **Trustless Trade:** All bids and payments are locked in **Blockchain Escrows** (Ethereum/Polygon).
    3.  **Immutable Logic:** No human intervention in payment release; it’s automated by code.

---

## 🚀 Key Features Built

### 1. 📞 Multi-Language USSD Interface (Offline)
*   **Technology:** GSM Standard Protocol (Works on Nokia 1100).
*   **Features:**
    *   **No Internet Required:** Works purely on telecom signaling.
    *   **Vernacular Support:** Fully localized in **English, Tamil (தமிழ்), and Hindi (हिंदी)**.
    *   **Native Scripting:** innovation that renders native unicode scripts on supported handsets.
    *   **Action:** Farmers can Check Status, Deposit Crops, and View Wallet Balance by dialing a code.

### 2. 🛡️ Blockchain Escrow & Smart Contracts
*   **Contract:** `AgriProcure.sol`
*   **Logic:**
    *   **Deposit:** Officer verifies crop -> Mints "Batch Token" on chain.
    *   **Escrow:** Buyer deposits funds -> Smart Contract locks encryption.
    *   **Release:** Upon "Delivery Confirmation" (or Time Expiry), funds move *automatically* to the Farmer's wallet.
    *   **Safety:** Removing the "Trust" factor. No one can run away with the money.

### 3. 🌌 Antigravity Store (IPFS Integration)
*   **Concept:** "Content-Addressable Storage" for Audit Trails.
*   **Implementation:**
    *   **Digital Certificates:** Officer verification creates a JSON Manifest.
    *   **Proof of Delivery:** Logistics creates a signed delivery receipt.
    *   **Immutability:** These documents are hashed (SHA-256) and stored on **IPFS**, generating a `CID` (Content ID) that is permanently linked to the Blockchain Transaction.
    *   **Zero-Refresh UI:** The dashboard uses Optimistic UI updates to reflect these heavy operations instantly.

### 4. 👮 Role-Based Dashboards (Web PWA)
*   **Officer App:** For physical physical verification and digital signing.
*   **Buyer/Vendor Portal:** For placing bids and confirming delivery.
*   **Tech:** Next.js 14, Tailwind CSS, Framer Motion.

---

## 🏗️ System Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Connectivity** | **USSD / GSM** | Connects offline farmers to the cloud via Telecom Gateways. |
| **Backend Logic** | **Python (FastAPI)** | Handles USSD Session State, Language Translation, and IPFS Hashing. |
| **Trust Layer** | **Hardhat / Solidity** | The Source of Truth. Holds funds and logic. |
| **Storage** | **IPFS (InterPlanetary File System)** | Stores heavy documents (Images/PDFs) immutably. |
| **Frontend** | **Next.js 14** | Responsive Web Interface for Officers & Buyers. |

---

## 🛠️ How to Run (Manual Setup)

Running this system requires starting three separate services. Open 3 Terminal Windows:

### Terminal 1: Backend (USSD & AI Logic)
*Critical: Must run on Port 8001 for the Simulator to connect.*
```bash
cd ai
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

### Terminal 2: Frontend (Dashboards)
*Runs on Port 3000.*
```bash
cd web
npm run dev
```

### Terminal 3: Blockchain (Local Node)
*Runs on Port 8545.*
```bash
cd chain
npx hardhat node
```

---

## 🔮 Future Roadmap (Antigravity)
*   **ZKP (Zero-Knowledge Proofs):** Verify farmer land ownership without revealing personal identity.
*   **IoT Integration:** Direct weight scale integration via Bluetooth to the USSD session.
*   **DeFi Lending:** Use "Committed Crop" tokens as collateral for micro-loans.
