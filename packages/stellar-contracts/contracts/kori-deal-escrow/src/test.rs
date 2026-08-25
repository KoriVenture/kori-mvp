extern crate std;

use super::*;
use soroban_sdk::{
    contract, contractimpl,
    testutils::{Address as _, Ledger as _},
    token, Address, BytesN, Env,
};

#[contract]
struct MockUsdc;

#[contractimpl]
impl MockUsdc {
    pub fn mint(env: Env, to: Address, amount: i128) {
        let balance = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(&to, &(balance + amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_balance = Self::balance(env.clone(), from.clone());
        assert!(amount >= 0 && from_balance >= amount);
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&from, &(from_balance - amount));
        env.storage().persistent().set(&to, &(to_balance + amount));
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().persistent().get(&id).unwrap_or(0)
    }
}

struct Fixture {
    env: Env,
    asset: Address,
    investor: Address,
    startup: Address,
    fund_manager: Address,
    release_authority: Address,
    client: KoriDealEscrowClient<'static>,
}

fn fixture() -> Fixture {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_network_id(TESTNET_NETWORK_ID);

    let asset = Address::from_str(&env, TESTNET_USDC_SAC_ADDRESS);
    env.register_at(&asset, MockUsdc, ());
    let investor = Address::generate(&env);
    let startup = Address::generate(&env);
    let fund_manager = Address::generate(&env);
    let release_authority = Address::generate(&env);

    MockUsdcClient::new(&env, &asset).mint(&investor, &1_000);

    let contract_id = env.register(
        KoriDealEscrow,
        (
            startup.clone(),
            fund_manager.clone(),
            release_authority.clone(),
        ),
    );
    let client = KoriDealEscrowClient::new(&env, &contract_id);

    Fixture {
        env,
        asset,
        investor,
        startup,
        fund_manager,
        release_authority,
        client,
    }
}

#[test]
#[should_panic]
fn deployment_rejects_a_non_testnet_network() {
    let env = Env::default();
    env.register(
        KoriDealEscrow,
        (
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
        ),
    );
}

#[test]
fn complete_deal_transfers_the_full_escrow_balance_to_the_startup() {
    // Given a funded investor and a newly deployed deal escrow.
    let fixture = fixture();
    fixture.client.fund(&fixture.investor, &600);

    // Then the investor-level and deal-level accounting agree.
    assert_eq!(fixture.client.contribution(&fixture.investor), 600);
    assert_eq!(fixture.client.total_funded(), 600);

    // When the Fund Manager approves the evidence and the release authority signs.
    fixture
        .client
        .approve_milestone(&BytesN::from_array(&fixture.env, &[7; 32]));
    let released = fixture.client.release();

    // Then the complete balance reaches the startup and the deal becomes final.
    assert_eq!(released, 600);
    assert!(fixture.client.is_released());
    assert_eq!(
        token::Client::new(&fixture.env, &fixture.asset).balance(&fixture.startup),
        600
    );
}

#[test]
fn funding_rejects_a_non_positive_amount() {
    // Given a valid empty escrow, a zero-value contribution must not create state.
    let fixture = fixture();
    assert_eq!(
        fixture.client.try_fund(&fixture.investor, &0),
        Err(Ok(Error::InvalidAmount))
    );
}

#[test]
fn repeated_funding_accumulates_the_investors_attributed_contribution() {
    // Given one investor funding the same deal more than once.
    let fixture = fixture();
    fixture.client.fund(&fixture.investor, &250);
    fixture.client.fund(&fixture.investor, &150);

    // Then both the investor attribution and aggregate total are cumulative.
    assert_eq!(fixture.client.contribution(&fixture.investor), 400);
    assert_eq!(fixture.client.total_funded(), 400);
}

#[test]
fn release_rejects_a_funded_deal_without_milestone_approval() {
    // Given real funds in escrow but no Fund Manager evidence approval.
    let fixture = fixture();
    fixture.client.fund(&fixture.investor, &500);

    assert_eq!(
        fixture.client.try_release(),
        Err(Ok(Error::MilestoneNotApproved))
    );
}

#[test]
fn release_rejects_an_approved_but_empty_escrow() {
    // Given valid evidence approval but no investor contribution.
    let fixture = fixture();
    fixture
        .client
        .approve_milestone(&BytesN::from_array(&fixture.env, &[9; 32]));

    assert_eq!(fixture.client.try_release(), Err(Ok(Error::NoFunds)));
}

#[test]
fn release_is_terminal_and_cannot_execute_twice() {
    // Given a deal that completed its approval and payout lifecycle.
    let fixture = fixture();
    fixture.client.fund(&fixture.investor, &300);
    fixture
        .client
        .approve_milestone(&BytesN::from_array(&fixture.env, &[4; 32]));
    fixture.client.release();

    // Then a replayed release cannot transfer funds or reopen the final state.
    assert_eq!(
        fixture.client.try_release(),
        Err(Ok(Error::AlreadyReleased))
    );
}

#[test]
fn each_business_action_requires_the_expected_role_authorization() {
    // Given the four distinct roles configured by the fixture.
    let fixture = fixture();

    // Funding requires the investor's authorization.
    fixture.client.fund(&fixture.investor, &200);
    assert_eq!(fixture.env.auths()[0].0, fixture.investor);

    // Evidence approval requires the configured Fund Manager's authorization.
    fixture
        .client
        .approve_milestone(&BytesN::from_array(&fixture.env, &[8; 32]));
    assert_eq!(fixture.env.auths()[0].0, fixture.fund_manager);

    // Payout requires the separately configured release authority.
    fixture.client.release();
    assert_eq!(fixture.env.auths()[0].0, fixture.release_authority);
}
