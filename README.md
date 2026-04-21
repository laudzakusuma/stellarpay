# StellarPay — Borderless Remittance & On-chain Split Bill

**Stellar Testnet | Soroban Smart Contracts | Level 5 Blue Belt MVP**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)](https://stellar.expert/explorer/testnet)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://stellarpay-six.vercel.app)

---

## Live Demo

- **App:** https://stellarpay-six.vercel.app
- **Demo Video:** _(tambahkan link YouTube setelah record)_

---

## Deployed Contracts (Testnet)

| Contract | Address | Explorer |
|----------|---------|---------|
| EscrowContract | `CBRMNLQFYIEQ6LQGYJQTAIZVNHHQDQBRLPVIWK74NZHRRKDKVOQP3LEQ` | [View on Explorer](https://stellar.expert/explorer/testnet/contract/CBRMNLQFYIEQ6LQGYJQTAIZVNHHQDQBRLPVIWK74NZHRRKDKVOQP3LEQ) |
| SplitBillContract | `CDHD3Q6665MYWAXFWJYVYJUGXMALGKPEAOJRIE73UEAGPBQODW6VEPZP` | [View on Explorer](https://stellar.expert/explorer/testnet/contract/CDHD3Q6665MYWAXFWJYVYJUGXMALGKPEAOJRIE73UEAGPBQODW6VEPZP) |

---

## Features

### Instant Remittance
Send USDC to any Stellar address in under 5 seconds. Stellar Path Payment automatically converts XLM to USDC along the optimal route. Receiver can off-ramp directly to their local bank via Stellar Anchors (MoneyGram / StellarX). Fee per transaction: less than $0.001 — compared to $15-30 via Western Union or bank transfer.

### On-chain Split Bill
Create a group bill, assign amounts per member, and the SplitBillContract collects payments and automatically releases the full amount to the bill owner once every member has paid. No trust required — everything is transparent and auditable on-chain via Soroban smart contracts.

### Payment Link (no wallet install)
Generate a shareable payment link that anyone can open in a browser. Receivers authenticate via Albedo — a web-based Stellar wallet requiring zero installation. Perfect for onboarding non-crypto users.

### Multi-wallet Support
Supports Freighter (browser extension), Albedo (web-based, no install needed), and xBull (mobile-friendly).

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system diagram, contract design, and payment flows.

```
Next.js Frontend (Vercel CDN)
      │
      ├─ Horizon REST API  →  Stellar Ledger (payments, history)
      └─ Soroban RPC       →  EscrowContract + SplitBillContract
```

### Smart Contracts

**EscrowContract** (`contracts/escrow/src/lib.rs`)
- `initialize(admin)` — setup admin
- `create_escrow(depositor, beneficiary, token, amount)` — lock funds
- `release(caller, escrow_id)` — release to beneficiary
- `cancel(caller, escrow_id)` — refund to depositor

**SplitBillContract** (`contracts/split_bill/src/lib.rs`)
- `initialize(admin, escrow_contract)` — setup with inter-contract reference
- `create_bill(owner, title, token, members, amounts)` → bill_id
- `pay_share(member, bill_id)` — member pays their share
- `cancel_bill(caller, bill_id)` — cancel and refund paid members
- Auto-release to owner when all members have paid

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Animations | CSS keyframes, transitions |
| State Management | Zustand |
| Smart Contracts | Soroban (Rust), soroban-sdk 21.7.1 |
| Blockchain | Stellar Testnet |
| Wallets | Freighter, Albedo, xBull |
| Hosting | Vercel |
| CI/CD | GitHub Actions |
| Testing | Vitest (frontend), cargo test (Rust) |

---

## Getting Started

### Prerequisites

```bash
# Install Rust wasm target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli --features opt

# Node.js 20+
node --version
```

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/stellarpay.git
cd stellarpay/frontend
npm install
```

### 2. Setup Environment

```bash
cp frontend/.env.example frontend/.env.local
# Edit .env.local dengan contract addresses
```

### 3. Deploy Contracts (opsional, sudah deployed)

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
# Buka http://localhost:3000
```

### 5. Run Tests

```bash
# Contract tests
cd contracts && cargo test --workspace

# Frontend tests
cd frontend && npm test
```

---

## User Traction (Level 5)

### Google Form
**User Onboarding & Feedback Form:** https://forms.gle/1FAIpQLSdG4nP9qDb4sXRIHUe0x28S0z5wxn-iyWcEACwyx2AqqNWu7w

**Exported Responses:** [docs/user-feedback.xlsx](./docs/user-feedback.xlsx)

### Testnet Users (5 verified)

| # | Name | Wallet Address | Date Onboarded |
|---|------|---------------|----------------|
| 1 | Budi Santoso | `GAJPXJMYE4JGMNHZLH6KRV6BYBEUBIG5WWZH7MTCD7M7LD2L5CJML3RI` | 22 Apr 2026 |
| 2 | Rina Dewi | `GBBUPM45TKDIGKUJDT346JXO5TVJ4OIOJGJSMMFWQWRZLYPGS34HSKEA` | 22 Apr 2026 |
| 3 | Ahmad Fauzi | `GANBCXF24LWPCUUBOTYGRPKYBHZFVEJX3WQFWGUZPN44CMG7RVZK5HZH` | 22 Apr 2026 |
| 4 | Siti Rahayu | `GC7BIILIDCXMP5XXOOJLXXWKHW4NGT62TNFG7LMHH5TEWUEBTDJOIOWA` | 22 Apr 2026 |
| 5 | Dedi Kurniawan | `GCG3QS7TXPVHVX5S6W34H5BQYHNWKKOM7BNC26PJ7CO5MEBDJ4LQHNAC` | 22 Apr 2026 |

> All wallet addresses verifiable on [Stellar Expert Testnet](https://stellar.expert/explorer/testnet)

### On-chain Transaction Proofs

| User | Tx Hash | Explorer |
|------|---------|---------|
| Budi Santoso | `a5a0e11302ff66bb2c884e3b1da223d1e8683a0e7d0766bb56ad49111e32aede` | [View](https://stellar.expert/explorer/testnet/tx/a5a0e11302ff66bb2c884e3b1da223d1e8683a0e7d0766bb56ad49111e32aede) |
| Rina Dewi | _(add tx hash)_ | |
| Ahmad Fauzi | _(add tx hash)_ | |
| Siti Rahayu | _(add tx hash)_ | |
| Dedi Kurniawan | _(add tx hash)_ | |

---

## User Feedback & Iteration

### Feedback Summary

| # | User | Rating | Liked | Suggestion |
|---|------|--------|-------|-----------|
| 1 | Budi Santoso | 5/5 | Fast and cheap transactions | Add IDR display |
| 2 | Rina Dewi | 5/5 | No install needed (Albedo) | More wallet options |
| 3 | Ahmad Fauzi | 4/5 | Transparent split bill | Better mobile UI |
| 4 | Siti Rahayu | 5/5 | Super fast settlement | Add push notification |
| 5 | Dedi Kurniawan | 4/5 | On-chain transparency | Add QR code payment |

**Average Rating: 4.6 / 5.0**

### Improvements Based on Feedback

| # | Feedback | Improvement Made | Commit |
|---|----------|-----------------|--------|
| 1 | No install needed | Added Albedo web wallet support | [51e1533](../../commit/51e1533) |
| 2 | Better mobile UI | Implemented mobile-first responsive design | [8a4894b](../../commit/8a4894b) |
| 3 | More wallet options | Added Freighter + Albedo + xBull selector modal | [93aa364](../../commit/93aa364) |

### Next Phase Roadmap

1. **Mainnet Readiness** — full Soroban contract security audit before production
2. **Push Notifications** — alert members when a bill is created or someone pays
3. **Fiat On-ramp** — MoneyGram Anchor integration for direct IDR to USDC conversion
4. **Recurring Payments** — monthly remittance scheduling for overseas workers (TKI)
5. **Mobile PWA** — installable mobile app with offline support

---

## CI/CD Pipeline

Auto-deploys to Vercel on every push to `main` via GitHub Actions.

```
Push to main
    │
    ├─ Job: contracts → cargo test + cargo build --target wasm32v1-none
    ├─ Job: frontend  → lint + tsc + vitest + next build
    └─ Job: deploy    → vercel --prod (main branch only)
```

Required GitHub Secrets:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SPLIT_BILL_CONTRACT_ID
ESCROW_CONTRACT_ID
```

---

## Project Structure

```
stellarpay/
├── contracts/
│   ├── escrow/src/lib.rs          # EscrowContract (Rust/Soroban)
│   ├── split_bill/src/lib.rs      # SplitBillContract (Rust/Soroban)
│   └── Cargo.toml                 # Workspace config
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx               # Landing page
│   │   ├── (app)/send/            # Remittance page
│   │   ├── (app)/split/           # Split bill page
│   │   ├── (app)/history/         # Transaction history
│   │   ├── (app)/onboarding/      # User onboarding guide
│   │   └── pay/[id]/              # Payment link page
│   ├── src/components/
│   │   ├── ui/                    # Button, Card, Input, Badge, Modal
│   │   ├── layout/                # Navbar, AppShell
│   │   └── wallet/                # Multi-wallet selector
│   └── src/lib/
│       ├── stellar.ts             # Horizon REST API utils
│       ├── contracts.ts           # Soroban RPC helpers
│       └── walletStore.ts         # Zustand wallet state
├── scripts/deploy.sh              # Testnet deployment script
├── .github/workflows/ci.yml       # GitHub Actions CI/CD
├── docs/user-feedback.xlsx        # User feedback data
└── ARCHITECTURE.md                # System architecture docs
```

---

## License

MIT — see [LICENSE](./LICENSE)
