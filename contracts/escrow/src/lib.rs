#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token,
    Address, Env, String,
    contracterror,
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    SplitBillContract,
    Token,
    EscrowBalance(u64),
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq)]
#[repr(u32)]
pub enum Error {
    Unauthorized = 1,
    InsufficientBalance = 2,
    NotInitialized = 3,
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {

    /// Initialize escrow — called once after deployment
    /// split_bill_contract: the address of the SplitBillContract (only caller allowed to release)
    /// token: the token contract address (USDC on testnet)
    pub fn initialize(env: Env, admin: Address, split_bill_contract: Address, token: Address) {
        admin.require_auth();
        env.storage()
            .persistent()
            .set(&DataKey::SplitBillContract, &split_bill_contract);
        env.storage().persistent().set(&DataKey::Token, &token);
    }

    /// Called by SplitBillContract (inter-contract call) to release funds to bill owner
    pub fn release(
        env: Env,
        bill_id: u64,
        recipient: Address,
        amount: i128,
    ) -> Result<(), Error> {
        // Only the registered SplitBill contract can call this
        let split_bill: Address = env
            .storage()
            .persistent()
            .get(&DataKey::SplitBillContract)
            .ok_or(Error::NotInitialized)?;

        // The caller must be the split bill contract
        split_bill.require_auth();

        let token: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)?;

        // Transfer the collected amount from escrow to recipient
        let token_client = token::Client::new(&env, &token);
        let escrow_balance = token_client.balance(&env.current_contract_address());

        if escrow_balance < amount {
            return Err(Error::InsufficientBalance);
        }

        token_client.transfer(&env.current_contract_address(), &recipient, &amount);

        // Emit release event
        env.events().publish(
            (String::from_str(&env, "escrow"), String::from_str(&env, "released")),
            (bill_id, recipient, amount),
        );

        Ok(())
    }

    /// Deposit funds into escrow — called by members when paying their share
    /// (This is a convenience; actual transfer happens in SplitBillContract via token.transfer)
    pub fn deposit(
        env: Env,
        from: Address,
        amount: i128,
        bill_id: u64,
    ) -> Result<(), Error> {
        from.require_auth();

        let token: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        // Track escrow balance per bill
        let current: i128 = env
            .storage()
            .temporary()
            .get(&DataKey::EscrowBalance(bill_id))
            .unwrap_or(0);
        env.storage()
            .temporary()
            .set(&DataKey::EscrowBalance(bill_id), &(current + amount));

        Ok(())
    }

    /// View: get escrow balance for a specific bill
    pub fn get_escrow_balance(env: Env, bill_id: u64) -> i128 {
        env.storage()
            .temporary()
            .get(&DataKey::EscrowBalance(bill_id))
            .unwrap_or(0)
    }

    /// View: get total escrow contract token balance
    pub fn get_total_balance(env: Env) -> Result<i128, Error> {
        let token: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &token);
        Ok(token_client.balance(&env.current_contract_address()))
    }
}
