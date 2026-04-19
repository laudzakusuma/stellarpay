# StellarPay — Architecture Document

## Overview

StellarPay is a full-stack decentralized application (dApp) built on the Stellar blockchain (Testnet). It provides two core primitives: **instant remittance** via Stellar Path Payment and **on-chain bill splitting** via Soroban smart contracts.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LAYER                                   │
│   Web Browser (Next.js 14 + TypeScript)                              │
│   Mobile Browser (responsive, PWA-ready)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────────┐
│                       FRONTEND (Vercel CDN)                          │
│                                                                      │
│  Pages                  Components              Libraries            │
│  ├─ / (Landing)         ├─ WalletButton         ├─ @stellar/sdk     │
│  ├─ /send               ├─ Navbar               ├─ StellarWalletsKit│
│  ├─ /split              ├─ Card / Badge         ├─ framer-motion    │
│  ├─ /history            ├─ Input / Button       ├─ zustand          │
│  └─ /pay/[id]           └─ Modal                └─ react-hot-toast  │
│                                                                      │
│  State: Zustand (wallet) + React Query (server state)                │
└─────────┬──────────────────────────┬────────────────────────────────┘
          │                          │
          │ Horizon REST API         │ Soroban JSON-RPC
          ▼                          ▼
┌─────────────────────┐   ┌──────────────────────────────────────────┐
│  Stellar Horizon    │   │         Soroban RPC Node                  │
│  (Testnet)          │   │         (Testnet)                         │
│                     │   │                                           │
│  - Account info     │   │  - Contract simulation                    │
│  - Submit tx        │   │  - Transaction assembly                   │
│  - Payment history  │   │  - State queries                          │
│  - Path payment     │   │                                           │
└─────────────────────┘   └──────────────┬─────────────────────────┘
                                         │ Ledger State
                          ┌──────────────▼─────────────────────────┐
                          │         Stellar Ledger (Testnet)         │
                          │                                          │
                          │  ┌────────────────┐  ┌───────────────┐  │
                          │  │ EscrowContract │  │SplitBillContr.│  │
                          │  │ (Soroban/Rust) │◄─│(Soroban/Rust) │  │
                          │  │                │  │               │  │
                          │  │ create_escrow  │  │ create_bill   │  │
                          │  │ release        │  │ pay_share     │  │
                          │  │ cancel         │  │ cancel_bill   │  │
                          │  └────────────────┘  └───────────────┘  │
                          │                                          │
                          │  Native Assets: XLM, USDC (Circle)       │
                          └──────────────────────────────────────────┘
```

---

## Smart Contract Architecture

### EscrowContract (`contracts/escrow/src/lib.rs`)

Handles secure holding and conditional release of funds.

```
EscrowData {
  depositor:  Address    // who created the escrow
  beneficiary: Address   // who receives on release
  token:      Address    // token contract (USDC)
  amount:     i128       // locked amount (7 decimal places)
  status:     Active | Released | Cancelled
  release_condition: Symbol
}

Storage:
  Instance: Admin, Counter
  Persistent: Escrow(id) → EscrowData
```

**Key functions:**
- `initialize(admin)` — sets admin, counter=0
- `create_escrow(depositor, beneficiary, token, amount, condition)` → `escrow_id`
- `release(caller, escrow_id)` — transfers to beneficiary
- `cancel(caller, escrow_id)` — refunds to depositor

### SplitBillContract (`contracts/split_bill/src/lib.rs`)

Manages group bill creation and per-member payment collection with automatic settlement.

```
Bill {
  id:           u64
  owner:        Address    // receives full amount
  title:        String
  token:        Address    // payment token
  total_amount: i128
  collected:    i128
  members:      Vec<MemberShare>
  status:       Open | FullyPaid | Cancelled
  escrow_id:    u64        // inter-contract reference
  created_at:   u64        // ledger timestamp
}

MemberShare {
  address: Address
  amount:  i128
  status:  Pending | Paid
}
```

**Inter-contract call:** `SplitBill → EscrowContract` for escrow creation.

**Key functions:**
- `create_bill(owner, title, token, members[], amounts[])` → `bill_id`
- `pay_share(member, bill_id)` — member pays; auto-releases when all paid
- `cancel_bill(caller, bill_id)` — refunds paid members
- `get_bill(bill_id)` → `Bill`

---

## Payment Flow — Remittance

```
User fills form
     │
     ▼
Build Stellar transaction
├─ Operation: payment (USDC) OR pathPaymentStrictReceive (XLM→USDC)
├─ Memo (optional, ≤28 chars)
└─ Fee: BASE_FEE (~0.00001 XLM)
     │
     ▼
Sign via StellarWalletsKit
├─ Freighter (browser extension)
├─ Albedo (web-based, no install)
└─ xBull
     │
     ▼
Submit to Horizon
     │
     ▼ ~5 seconds
Transaction confirmed on ledger
     │
     ▼
Receiver can off-ramp via Anchor
(MoneyGram / StellarX → local bank)
```

---

## Payment Flow — Split Bill

```
Owner creates bill on-chain (Soroban tx)
     │
     ▼
SplitBillContract stores bill + member list
     │
     ▼
Each member receives payment link / notification
     │
     ▼
Member calls pay_share()
├─ Token transfer: member → contract
└─ MemberShare.status = Paid
     │
     ▼ (last member pays)
Auto-release triggered
├─ Token transfer: contract → owner (full amount)
└─ Bill.status = FullyPaid
```

---

## Wallet Integration

```typescript
// StellarWalletsKit supports:
FREIGHTER_ID  — browser extension (recommended)
ALBEDO_ID     — web-based, zero friction for new users
XBULL_ID      — mobile-friendly
```

Payment Link flow (no wallet needed for receiver):
1. Sender generates link → `/pay/{nanoid(12)}`
2. Receiver opens link in browser
3. Albedo web wallet authenticates and signs
4. Transaction submitted — no install required

---

## Database / Storage

StellarPay uses **no centralized database**. All state lives on-chain:

| Data             | Storage          |
|------------------|------------------|
| Bill data        | Soroban persistent storage |
| Member payments  | Soroban persistent storage |
| Escrow state     | Soroban persistent storage |
| Tx history       | Stellar Horizon (ledger) |
| Payment links    | Encoded in URL (stateless) |

---

## CI/CD Pipeline

```
Push to main/develop
     │
     ├─ Job: contracts
     │   ├─ cargo test --workspace
     │   └─ cargo build --target wasm32-unknown-unknown --release
     │
     ├─ Job: frontend
     │   ├─ npm run lint
     │   ├─ tsc --noEmit
     │   ├─ vitest
     │   └─ next build
     │
     └─ Job: deploy (main only)
         └─ vercel --prod
```

---

## Technology Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 14, TypeScript, Tailwind    |
| Animations   | Framer Motion, CSS transitions      |
| State        | Zustand, React Query                |
| Contracts    | Soroban (Rust), soroban-sdk 20.0.0  |
| Blockchain   | Stellar Testnet                     |
| Payments     | Stellar Path Payment, USDC          |
| Wallets      | Freighter, Albedo, xBull            |
| Hosting      | Vercel (frontend)                   |
| CI/CD        | GitHub Actions                      |
| Testing      | Vitest (frontend), cargo test (Rust)|

---

## Security Considerations

1. **Authorization checks** — Every Soroban function that mutates state requires `address.require_auth()`.
2. **Amount validation** — All amounts must be positive; checked before token transfers.
3. **Access control** — Only depositor/owner or admin can release/cancel.
4. **Overflow protection** — Rust contract compiled with `overflow-checks = true`.
5. **Testnet only** — `.env` clearly marks TESTNET; mainnet requires audit.
6. **No private key storage** — All signing delegated to user wallet.
