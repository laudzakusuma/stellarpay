#!/bin/bash
# StellarPay — Soroban Contract Deployment Script (Testnet)
# Usage: ./scripts/deploy.sh

set -e

NETWORK="testnet"

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}StellarPay Deployment — Testnet${NC}"
echo "=================================="

# ── Prerequisite check ────────────────────────────────────────────────────────
if ! command -v stellar &> /dev/null; then
  echo "Stellar CLI not found. Install: https://developers.stellar.org/docs/tools/developer-tools/cli/install"
  exit 1
fi

# ── Generate deploy keypair if needed (skip if already exists) ────────────────
if stellar keys address deployer &> /dev/null; then
  echo -e "${YELLOW}Using existing 'deployer' identity${NC}"
else
  echo -e "${YELLOW}Generating deployer keypair...${NC}"
  stellar keys generate deployer --network $NETWORK
  ADDR=$(stellar keys address deployer)
  echo -e "Address: ${GREEN}$ADDR${NC}"
  echo -e "${YELLOW}Funding via Friendbot...${NC}"
  curl -s "https://friendbot.stellar.org/?addr=$ADDR" > /dev/null && echo -e "${GREEN}Funded!${NC}"
  sleep 3
fi

DEPLOYER_ADDRESS=$(stellar keys address deployer)
echo -e "Deployer: ${GREEN}$DEPLOYER_ADDRESS${NC}"

# ── Fund existing address if needed ──────────────────────────────────────────
echo -e "\n${CYAN}Checking account balance (funding if needed)...${NC}"
curl -s "https://friendbot.stellar.org/?addr=$DEPLOYER_ADDRESS" > /dev/null || true

# ── Build contracts ───────────────────────────────────────────────────────────
echo -e "\n${CYAN}Building WASM contracts...${NC}"
cd contracts
RUSTFLAGS="-C target-feature=-reference-types" \
  cargo build --target wasm32-unknown-unknown --release --workspace
cd ..

ESCROW_WASM="contracts/target/wasm32-unknown-unknown/release/escrow.wasm"
SPLIT_BILL_WASM="contracts/target/wasm32-unknown-unknown/release/split_bill.wasm"

# ── Optimize WASM (strips size, removes unused sections) ─────────────────────
echo -e "\n${CYAN}Optimizing WASM...${NC}"
stellar contract optimize --wasm "$ESCROW_WASM" || true
stellar contract optimize --wasm "$SPLIT_BILL_WASM" || true

# Use optimized versions if they exist, else fallback to original
ESCROW_WASM_OPT="contracts/target/wasm32-unknown-unknown/release/escrow.optimized.wasm"
SPLIT_BILL_WASM_OPT="contracts/target/wasm32-unknown-unknown/release/split_bill.optimized.wasm"
[ -f "$ESCROW_WASM_OPT" ] && ESCROW_WASM="$ESCROW_WASM_OPT"
[ -f "$SPLIT_BILL_WASM_OPT" ] && SPLIT_BILL_WASM="$SPLIT_BILL_WASM_OPT"

# ── Deploy Escrow ─────────────────────────────────────────────────────────────
echo -e "\n${CYAN}Deploying Escrow contract...${NC}"
ESCROW_ID=$(stellar contract deploy \
  --wasm "$ESCROW_WASM" \
  --source deployer \
  --network $NETWORK \
  --fee 1000000)
echo -e "Escrow contract: ${GREEN}$ESCROW_ID${NC}"

# ── Initialize Escrow ─────────────────────────────────────────────────────────
echo -e "\n${CYAN}Initializing Escrow...${NC}"
stellar contract invoke \
  --id "$ESCROW_ID" \
  --source deployer \
  --network $NETWORK \
  -- \
  initialize \
  --admin "$DEPLOYER_ADDRESS"

# ── Deploy SplitBill ──────────────────────────────────────────────────────────
echo -e "\n${CYAN}Deploying SplitBill contract...${NC}"
SPLIT_BILL_ID=$(stellar contract deploy \
  --wasm "$SPLIT_BILL_WASM" \
  --source deployer \
  --network $NETWORK \
  --fee 1000000)
echo -e "SplitBill contract: ${GREEN}$SPLIT_BILL_ID${NC}"

# ── Initialize SplitBill ──────────────────────────────────────────────────────
echo -e "\n${CYAN}Initializing SplitBill...${NC}"
stellar contract invoke \
  --id "$SPLIT_BILL_ID" \
  --source deployer \
  --network $NETWORK \
  -- \
  initialize \
  --admin "$DEPLOYER_ADDRESS" \
  --escrow_contract "$ESCROW_ID"

# ── Write frontend/.env.local ─────────────────────────────────────────────────
echo -e "\n${CYAN}Writing frontend/.env.local...${NC}"
cat > frontend/.env.local << EOF
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_SPLIT_BILL_CONTRACT_ID=$SPLIT_BILL_ID
NEXT_PUBLIC_ESCROW_CONTRACT_ID=$ESCROW_ID
NEXT_PUBLIC_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
NEXT_PUBLIC_USDC_CODE=USDC
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo "=================================="
echo -e "Escrow Contract:    ${GREEN}$ESCROW_ID${NC}"
echo -e "SplitBill Contract: ${GREEN}$SPLIT_BILL_ID${NC}"
echo ""
echo "View on Stellar Expert:"
echo "  https://stellar.expert/explorer/testnet/contract/$ESCROW_ID"
echo "  https://stellar.expert/explorer/testnet/contract/$SPLIT_BILL_ID"
echo ""
echo -e "Next: ${CYAN}cd frontend && npm install && npm run dev${NC}"
