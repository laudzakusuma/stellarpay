#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BillStatus {
    Open,
    FullyPaid,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MemberStatus {
    Pending,
    Paid,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct MemberShare {
    pub address: Address,
    pub amount: i128,
    pub status: MemberStatus,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Bill {
    pub id: u64,
    pub owner: Address,
    pub title: String,
    pub token: Address,
    pub total_amount: i128,
    pub collected: i128,
    pub members: Vec<MemberShare>,
    pub status: BillStatus,
    pub escrow_contract: Address,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Bill(u64),
    Counter,
    Admin,
    EscrowContract,
}

pub trait SplitBillTrait {
    fn initialize(env: Env, admin: Address, escrow_contract: Address);

    fn create_bill(
        env: Env,
        owner: Address,
        title: String,
        token: Address,
        members: Vec<Address>,
        amounts: Vec<i128>,
    ) -> u64;

    fn pay_share(env: Env, member: Address, bill_id: u64);

    fn cancel_bill(env: Env, caller: Address, bill_id: u64);

    fn get_bill(env: Env, bill_id: u64) -> Bill;

    fn get_member_status(env: Env, bill_id: u64, member: Address) -> MemberStatus;

    fn get_bill_count(env: Env) -> u64;
}

#[contract]
pub struct SplitBillContract;

#[contractimpl]
impl SplitBillTrait for SplitBillContract {
    fn initialize(env: Env, admin: Address, escrow_contract: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::EscrowContract, &escrow_contract);
        env.storage().instance().set(&DataKey::Counter, &0u64);
    }

    /// Create a new bill with specific amounts per member.
    /// owner pays nothing — they are the recipient.
    fn create_bill(
        env: Env,
        owner: Address,
        title: String,
        token: Address,
        members: Vec<Address>,
        amounts: Vec<i128>,
    ) -> u64 {
        owner.require_auth();

        assert!(!members.is_empty(), "At least one member required");
        assert!(
            members.len() == amounts.len(),
            "Members and amounts length mismatch"
        );

        let mut total: i128 = 0;
        let mut member_shares: Vec<MemberShare> = Vec::new(&env);

        for i in 0..members.len() {
            let addr = members.get(i).unwrap();
            let amt = amounts.get(i).unwrap();
            assert!(amt > 0, "Each amount must be positive");
            total += amt;
            member_shares.push_back(MemberShare {
                address: addr,
                amount: amt,
                status: MemberStatus::Pending,
            });
        }

        let escrow_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::EscrowContract)
            .expect("Escrow contract not set");

        let counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let bill_id = counter + 1;
        env.storage()
            .instance()
            .set(&DataKey::Counter, &bill_id);

        let bill = Bill {
            id: bill_id,
            owner: owner.clone(),
            title,
            token,
            total_amount: total,
            collected: 0,
            members: member_shares,
            status: BillStatus::Open,
            escrow_contract,
            created_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Bill(bill_id), &bill);

        env.events().publish(
            (Symbol::new(&env, "bill_created"), bill_id),
            (owner, total),
        );

        bill_id
    }

    /// A member pays their share. Once all members have paid,
    /// collected funds are released to the bill owner automatically.
    fn pay_share(env: Env, member: Address, bill_id: u64) {
        member.require_auth();

        let mut bill: Bill = env
            .storage()
            .persistent()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        assert!(bill.status == BillStatus::Open, "Bill is not open");

        let mut member_idx: Option<u32> = None;
        let mut member_amount: i128 = 0;

        for i in 0..bill.members.len() {
            let ms = bill.members.get(i).unwrap();
            if ms.address == member {
                assert!(
                    ms.status == MemberStatus::Pending,
                    "Member already paid"
                );
                member_amount = ms.amount;
                member_idx = Some(i);
                break;
            }
        }

        let idx = member_idx.expect("Member not found in this bill");

        let token_client = token::Client::new(&env, &bill.token);
        token_client.transfer(
            &member,
            &env.current_contract_address(),
            &member_amount,
        );

        let mut ms = bill.members.get(idx).unwrap();
        ms.status = MemberStatus::Paid;
        bill.members.set(idx, ms);
        bill.collected += member_amount;

        env.events().publish(
            (Symbol::new(&env, "share_paid"), bill_id),
            (member.clone(), member_amount),
        );

        let all_paid = bill
            .members
            .iter()
            .all(|m| m.status == MemberStatus::Paid);

        if all_paid {
            token_client.transfer(
                &env.current_contract_address(),
                &bill.owner,
                &bill.collected,
            );
            bill.status = BillStatus::FullyPaid;

            env.events().publish(
                (Symbol::new(&env, "bill_fully_paid"), bill_id),
                bill.collected,
            );
        }

        env.storage()
            .persistent()
            .set(&DataKey::Bill(bill_id), &bill);
    }

    fn cancel_bill(env: Env, caller: Address, bill_id: u64) {
        caller.require_auth();

        let mut bill: Bill = env
            .storage()
            .persistent()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not set");

        assert!(
            caller == bill.owner || caller == admin,
            "Unauthorized: only owner or admin can cancel"
        );
        assert!(bill.status == BillStatus::Open, "Bill is not open");

        if bill.collected > 0 {
            let token_client = token::Client::new(&env, &bill.token);
            for i in 0..bill.members.len() {
                let ms = bill.members.get(i).unwrap();
                if ms.status == MemberStatus::Paid {
                    token_client.transfer(
                        &env.current_contract_address(),
                        &ms.address,
                        &ms.amount,
                    );
                }
            }
        }

        bill.status = BillStatus::Cancelled;
        env.storage()
            .persistent()
            .set(&DataKey::Bill(bill_id), &bill);

        env.events()
            .publish((Symbol::new(&env, "bill_cancelled"), bill_id), bill_id);
    }

    fn get_bill(env: Env, bill_id: u64) -> Bill {
        env.storage()
            .persistent()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found")
    }

    fn get_member_status(env: Env, bill_id: u64, member: Address) -> MemberStatus {
        let bill: Bill = env
            .storage()
            .persistent()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        for ms in bill.members.iter() {
            if ms.address == member {
                return ms.status;
            }
        }
        panic!("Member not found in bill")
    }

    fn get_bill_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{token, Address, Env, String, Vec};

    fn create_token<'a>(
        env: &Env,
        admin: &Address,
    ) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        (
            token::Client::new(env, &sac.address()),
            token::StellarAssetClient::new(env, &sac.address()),
        )
    }

    #[test]
    fn test_full_split_bill_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let owner = Address::generate(&env);
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);
        let carol = Address::generate(&env);

        let (token, token_admin) = create_token(&env, &admin);
        token_admin.mint(&alice, &500);
        token_admin.mint(&bob, &300);
        token_admin.mint(&carol, &200);

        let escrow_dummy = Address::generate(&env);
        let split_id = env.register_contract(None, SplitBillContract);
        let split_client = SplitBillContractClient::new(&env, &split_id);
        split_client.initialize(&admin, &escrow_dummy);

        let mut members = Vec::new(&env);
        members.push_back(alice.clone());
        members.push_back(bob.clone());
        members.push_back(carol.clone());

        let mut amounts = Vec::new(&env);
        amounts.push_back(500i128);
        amounts.push_back(300i128);
        amounts.push_back(200i128);

        let bill_id = split_client.create_bill(
            &owner,
            &String::from_str(&env, "Team dinner"),
            &token.address,
            &members,
            &amounts,
        );

        assert_eq!(bill_id, 1);

        split_client.pay_share(&alice, &bill_id);
        split_client.pay_share(&bob, &bill_id);

        let bill = split_client.get_bill(&bill_id);
        assert_eq!(bill.status, BillStatus::Open);
        assert_eq!(bill.collected, 800);

        split_client.pay_share(&carol, &bill_id);

        let bill = split_client.get_bill(&bill_id);
        assert_eq!(bill.status, BillStatus::FullyPaid);
        assert_eq!(token.balance(&owner), 1000);
    }

    #[test]
    fn test_cancel_bill_with_refund() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let owner = Address::generate(&env);
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        let (token, token_admin) = create_token(&env, &admin);
        token_admin.mint(&alice, &500);
        token_admin.mint(&bob, &500);

        let escrow_dummy = Address::generate(&env);
        let split_id = env.register_contract(None, SplitBillContract);
        let split_client = SplitBillContractClient::new(&env, &split_id);
        split_client.initialize(&admin, &escrow_dummy);

        let mut members = Vec::new(&env);
        members.push_back(alice.clone());
        members.push_back(bob.clone());

        let mut amounts = Vec::new(&env);
        amounts.push_back(500i128);
        amounts.push_back(500i128);

        let bill_id = split_client.create_bill(
            &owner,
            &String::from_str(&env, "Hotel split"),
            &token.address,
            &members,
            &amounts,
        );

        split_client.pay_share(&alice, &bill_id);
        assert_eq!(token.balance(&alice), 0);

        split_client.cancel_bill(&owner, &bill_id);

        assert_eq!(token.balance(&alice), 500);
        let bill = split_client.get_bill(&bill_id);
        assert_eq!(bill.status, BillStatus::Cancelled);
    }
}