# ProcureChain: User Roles & Dashboard Functions 🚜⚖️

This document outlines the specific actions, powers, and workflows for each persona in the ProcureChain system.

---

## 1. Farmer / Supplier (The Producer) 🌾
**Goal**: To sell produce at a fair price without middlemen exploitation.

### Dashboard Functions:
*   **Voice-Activated Selling**:
    *   Click the microphone button.
    *   Speak natural commands (e.g., *"I want to sell 100 kg Wheat for 2200 rupees"*).
    *   **AI Analysis**: The system analyzes the voice input using Gemini AI to extract `Commodity`, `Quantity`, and `Price`.
*   **Real-Time Price Check (AI-Powered)**:
    *   Before listing, the AI compares the farmer's price against `Agmarknet` market trends.
    *   **Fair Price Check**: If the price is too high or low, it warns the farmer (Anti-Exploitation).
*   **IoT Weight Verification**:
    *   Simulates connecting to a digital scale/weighbridge via QR Code.
    *   Ensures the quantity listed (e.g., 100Kg) is physically verified.

---

## 2. Vendor / Bidder (The Buyer) 🏢
**Goal**: To bid for government tenders competitively and securely.

### Dashboard Functions:
*   **Active Tender Search**:
    *   View a live list of government procurement needs (e.g., "Mid-Day Meal Rice Supply").
    *   Filter by Region, Crop, and Deadline.
*   **Sealed Bid Submission**:
    *   **Encryption**: When a vendor submits a bid (e.g., "₹5,40,000"), it is **immediately encrypted** (masked as `**********`).
    *   **Privacy**: Competitors and Officers CANNOT see this price until the deadline passes.
*   **Live Countdown**:
    *   Watch the "Time Remaining" for tenders. Once it hits zero, the bidding locks.

---

## 3. Procurement Officer (The Government) 🏛️
**Goal**: To approve tenders transparently and ensure quality compliance.

### Dashboard Functions:
*   **Decrypt & Open Tenders**:
    *   **Pre-Deadline**: Sees "Sealed Bids" (Hidden).
    *   **Post-Deadline**: Clicks **"Decrypt Bids"** to reveal the actual amounts and finding the L1 (Lowest) Bidder.
*   **Smart Auto-Validation**:
    *   Runs a 3-step automated check:
        1.  **Deadline Check**: Was it submitted in time?
        2.  **L1 Check**: Is it the best price?
        3.  **Quality Check**: Does it match the grade required?
*   **Digital Signature**:
    *   Once validation passes, the Officer clicks **"Sign Approval"** to authorize the fund release on the Blockchain.

> **❓ Viva Question: If "Smart Validator" exists, why do we need the Officer?**
> *   **The Answer**: The Smart Validator is a **Checklist**, not a **Judge**.
> *   **Validator's Job**: It checks the logical rules (Math, Dates, H1 Price). It prevents *accidental* errors.
> *   **Officer's Job**: They provide the **Legal Authority**. A computer program cannot be sued if the food is poisonous. The Officer's "Digital Signature" confirms: *"I have reviewed the Validator's output and I certify this is correct."*
> *   **Analogy**: It's like Autopilot on a plane. The Autopilot flies the plane (Smart Validator), but the Pilot (Officer) must still be there to land it safely.

---

## 4. Auditor / Regulator (The Watchdog) 🔍
**Goal**: To verify that the process was tamper-proof and corruption-free.

### Dashboard Functions:
*   **Immutable Ledger View**:
    *   Sees a chronological timeline of all actions (Tender Created -> Bid Submitted -> Approved).
    *   **Cannot Delete/Edit**: Confirmation that history is permanent.
*   **Granular Bid Audit**:
    *   Selects a Tender to see all bids associated with it.
    *   **Simulate Reveal**: Verifies that encrypted bids matched the revealed values.
*   **Forensic Hash Verifier**:
    *   **One-Click Verification**: Clicks "Verify Hash" on any transaction.
    *   **Merkle Proof**: The system recalculates the cryptographic hash to prove the data hasn't been changed since it was written to the blockchain.

---

## Workflow Summary
1.  **Farmer** lists crops (verified by AI & IoT).
2.  **Officer** creates a Tender for those crops.
3.  **Vendor** submits a **Sealed Bid**.
4.  **Officer** decrypts bids after deadline and **Signs Approval**.
5.  **Auditor** scans the **Hash** to prove no corruption occurred.
