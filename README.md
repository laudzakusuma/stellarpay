# StellarPay — Borderless Remittance & On-chain Split Bill

**Stellar Testnet | Soroban Smart Contracts | Level 5 MVP**

Send USDC anywhere in the world in 5 seconds for less than $0.001 fee. Split bills transparently with Soroban smart contracts and automatic settlement.

[![CI](https://github.com/YOUR_USERNAME/stellarpay/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/stellarpay/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Live Demo

- **App:** https://stellarpay.vercel.app _(deploy after setup)_
- **Demo Video:** [Watch on YouTube](https://youtube.com/YOUR_DEMO) _(record after deploy)_

---

## Features

**Instant Remittance**
Send USDC to any Stellar address in under 5 seconds. Stellar Path Payment automatically converts XLM to USDC along the optimal route. Receiver can off-ramp directly to their local bank via Stellar Anchors (MoneyGram / StellarX).

**On-chain Split Bill**
Create a bill group, assign amounts per member, and the SplitBillContract collects payments and automatically releases the full amount to the bill owner once every member has paid. No trust required — everything is transparent and auditable on-chain.

**Payment Link (no wallet install)**
Generate a payment link anyone can open in a browser. Receivers authenticate via Albedo — a web-based Stellar wallet requiring zero installation. Perfect for onboarding non-crypto users.

**Transaction History**
All transactions recorded on Stellar ledger. Full history with amounts, counterparties, memos, and links to Stellar Expert explorer.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system diagram, contract design, and payment flows.

**Quick summary:**

```
Next.js Frontend (Vercel)
      │
      ├─ Horizon REST API  →  Stellar Ledger (payments, history)
      └─ Soroban RPC       →  EscrowContract + SplitBillContract
```

**Soroban Contracts (Rust):**
- `EscrowContract` — holds funds, releases on condition
- `SplitBillContract` — manages bill groups, calls EscrowContract (inter-contract call)

---

## Tech Stack

| Layer      | Technology                                         |
|------------|---------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS              |
| Animations | Framer Motion, CSS keyframes                      |
| State      | Zustand, React Query                              |
| Contracts  | Soroban (Rust), soroban-sdk 20.0.0               |
| Blockchain | Stellar Testnet                                   |
| Wallets    | Freighter, Albedo, xBull (StellarWalletsKit)      |
| CI/CD      | GitHub Actions → Vercel                           |
| Testing    | Vitest (frontend), cargo test (Rust)              |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Rust + `wasm32-unknown-unknown` target
- Stellar CLI

```bash
# Install Rust target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli --features opt
```

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/stellarpay.git
cd stellarpay

# Frontend
cd frontend && npm install
```

### 2. Deploy Contracts

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This script:
- Generates a deployer keypair
- Funds it via Friendbot (testnet)
- Builds WASM contracts
- Deploys EscrowContract and SplitBillContract
- Writes `frontend/.env.local` with contract IDs

### 3. Run Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### 4. Run Tests

```bash
# Contract tests
cd contracts && cargo test --workspace

# Frontend tests
cd frontend && npm test
```

---

## Contract Addresses (Testnet)

| Contract    | Address                                              |
|-------------|------------------------------------------------------|
| EscrowContract    | `_Fill after deploy_`                          |
| SplitBillContract | `_Fill after deploy_`                          |

View on [Stellar Expert Testnet](https://stellar.expert/explorer/testnet)

---

## User Traction (Level 5)

### Testnet Users

| # | Name | Wallet Address | Date |
|---|------|----------------|------|
| 1 | _Add after onboarding_ | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

**User Onboarding Form:** [Google Form Link](https://forms.google.com/YOUR_FORM)

**Exported Responses:** [user-feedback.xlsx](./docs/user-feedback.xlsx)

### Traction Timeline

- **Week 1:** Deploy + share in Stellar Indonesia Telegram/Discord
- **Week 2:** Live split bill demo with friends — screenshot proof of real users
- **Week 3:** Twitter/X video demo of international USDC transfer
- **Week 4:** Submit — show on-chain transaction count as traction proof

---

## User Feedback & Iteration

### Feedback Summary

_(Fill after collecting 5+ responses from Google Form)_

| Area | Feedback | Status |
|------|----------|--------|
| UX | | Planned |
| Feature | | Planned |

### Iteration Commits

Based on user feedback, the following improvements were made:

- **[Improvement 1]** — [Git commit link](https://github.com/YOUR_USERNAME/stellarpay/commit/HASH)
- **[Improvement 2]** — [Git commit link](https://github.com/YOUR_USERNAME/stellarpay/commit/HASH)

### Planned Next Phase

1. **Mainnet readiness** — full security audit of Soroban contracts
2. **Push notifications** — notify members when a bill is created
3. **Fiat on-ramp** — MoneyGram Anchor integration for direct IDR → USDC
4. **Recurring payments** — subscription-style monthly remittance
5. **Mobile app** — React Native wrapper with Freighter Mobile support

---

## Deployment

The frontend auto-deploys to Vercel on every push to `main` via GitHub Actions.

```bash
# Manual deploy
cd frontend && npx vercel --prod
```

Required GitHub secrets:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SPLIT_BILL_CONTRACT_ID
ESCROW_CONTRACT_ID
```

---

## License

MIT — see [LICENSE](./LICENSE)

---

## Contributing

PRs welcome. Please open an issue first for major changes.
