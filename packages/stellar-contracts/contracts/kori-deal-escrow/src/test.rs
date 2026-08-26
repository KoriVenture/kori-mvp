extern crate std;

use super::*;
use soroban_sdk::{
    contract, contractimpl, contracttype,
    testutils::{Address as _, Events as _, Ledger as _},
    token, Address, BytesN, Env, Event,
};

const NOW: u64 = 1_000;
const FUNDING_DEADLINE: u64 = 2_000;
const RELEASE_DEADLINE: u64 = 3_000;
const TARGET: i128 = 1_000;

#[contract]
struct MockUsdc;

#[contracttype]
enum MockUsdcKey {
    Balance(Address),
    BlockedRecipient(Address),
}

#[contractimpl]
impl MockUsdc {
    pub fn mint(env: Env, to: Address, amount: i128) {
        assert!(amount >= 0);
        let balance = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(
            &MockUsdcKey::Balance(to),
            &balance.checked_add(amount).unwrap(),
        );
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let recipient_is_blocked: bool = env
            .storage()
            .persistent()
            .get(&MockUsdcKey::BlockedRecipient(to.clone()))
            .unwrap_or(false);
        assert!(!recipient_is_blocked);
        let from_balance = Self::balance(env.clone(), from.clone());
        assert!(amount >= 0 && from_balance >= amount);
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(
            &MockUsdcKey::Balance(from),
            &from_balance.checked_sub(amount).unwrap(),
        );
        env.storage().persistent().set(
            &MockUsdcKey::Balance(to),
            &to_balance.checked_add(amount).unwrap(),
        );
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&MockUsdcKey::Balance(id))
            .unwrap_or(0)
    }

    pub fn set_blocked_recipient(env: Env, recipient: Address, blocked: bool) {
        env.storage()
            .persistent()
            .set(&MockUsdcKey::BlockedRecipient(recipient), &blocked);
    }
}

struct Fixture {
    env: Env,
    asset: Address,
    contract_id: Address,
    investor_a: Address,
    investor_b: Address,
    startup: Address,
    fund_manager: Address,
    release_authority: Address,
    client: KoriDealEscrowClient<'static>,
}

fn fixture() -> Fixture {
    fixture_with_target(TARGET)
}

fn fixture_with_target(target: i128) -> Fixture {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_network_id(TESTNET_NETWORK_ID);
    env.ledger().set_timestamp(NOW);

    let asset = Address::from_str(&env, TESTNET_USDC_SAC_ADDRESS);
    env.register_at(&asset, MockUsdc, ());
    let investor_a = Address::generate(&env);
    let investor_b = Address::generate(&env);
    let startup = Address::generate(&env);
    let fund_manager = Address::generate(&env);
    let release_authority = Address::generate(&env);

    let token = MockUsdcClient::new(&env, &asset);
    token.mint(&investor_a, &5_000);
    token.mint(&investor_b, &5_000);

    let contract_id = env.register(
        KoriDealEscrow,
        (
            startup.clone(),
            fund_manager.clone(),
            release_authority.clone(),
            target,
            FUNDING_DEADLINE,
            RELEASE_DEADLINE,
        ),
    );
    let client = KoriDealEscrowClient::new(&env, &contract_id);

    Fixture {
        env,
        asset,
        contract_id,
        investor_a,
        investor_b,
        startup,
        fund_manager,
        release_authority,
        client,
    }
}

fn evidence_hash(env: &Env, byte: u8) -> BytesN<32> {
    BytesN::from_array(env, &[byte; 32])
}

fn fund_exact_target(fixture: &Fixture) {
    fixture.client.fund(&fixture.investor_a, &600);
    fixture.client.fund(&fixture.investor_b, &400);
}

fn submit_and_approve(fixture: &Fixture, byte: u8) -> BytesN<32> {
    let hash = evidence_hash(&fixture.env, byte);
    assert_eq!(fixture.client.submit_evidence(&hash), 1);
    fixture.client.approve_milestone(&hash, &1);
    hash
}

#[test]
#[should_panic]
fn deployment_rejects_a_non_testnet_network() {
    let env = Env::default();
    env.ledger().set_timestamp(NOW);
    env.register(
        KoriDealEscrow,
        (
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
            TARGET,
            FUNDING_DEADLINE,
            RELEASE_DEADLINE,
        ),
    );
}

#[test]
#[should_panic]
fn deployment_rejects_a_non_positive_target() {
    let env = Env::default();
    env.ledger().set_network_id(TESTNET_NETWORK_ID);
    env.ledger().set_timestamp(NOW);
    env.register(
        KoriDealEscrow,
        (
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
            0_i128,
            FUNDING_DEADLINE,
            RELEASE_DEADLINE,
        ),
    );
}

#[test]
#[should_panic]
fn deployment_rejects_expired_or_unordered_deadlines() {
    let env = Env::default();
    env.ledger().set_network_id(TESTNET_NETWORK_ID);
    env.ledger().set_timestamp(NOW);
    env.register(
        KoriDealEscrow,
        (
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
            TARGET,
            NOW,
            RELEASE_DEADLINE,
        ),
    );
}

#[test]
#[should_panic]
fn deployment_rejects_overlapping_control_roles() {
    let env = Env::default();
    env.ledger().set_network_id(TESTNET_NETWORK_ID);
    env.ledger().set_timestamp(NOW);
    let startup_and_manager = Address::generate(&env);
    env.register(
        KoriDealEscrow,
        (
            startup_and_manager.clone(),
            startup_and_manager,
            Address::generate(&env),
            TARGET,
            FUNDING_DEADLINE,
            RELEASE_DEADLINE,
        ),
    );
}

#[test]
fn constructor_pins_config_and_starts_with_empty_accounting() {
    let fixture = fixture();
    let config = fixture.client.config();

    assert_eq!(config.asset, fixture.asset);
    assert_eq!(config.startup, fixture.startup);
    assert_eq!(config.fund_manager, fixture.fund_manager);
    assert_eq!(config.release_authority, fixture.release_authority);
    assert_eq!(config.target_amount, TARGET);
    assert_eq!(config.funding_deadline, FUNDING_DEADLINE);
    assert_eq!(config.release_deadline, RELEASE_DEADLINE);
    assert_eq!(fixture.client.state(), DealState::FundingOpen);
    assert_eq!(fixture.client.total_funded(), 0);
    assert_eq!(fixture.client.total_released(), 0);
    assert_eq!(fixture.client.total_refunded(), 0);
}

#[test]
fn complete_deal_reaches_each_state_and_releases_the_exact_target() {
    let fixture = fixture();

    fixture.client.fund(&fixture.investor_a, &600);
    assert_eq!(fixture.client.state(), DealState::FundingOpen);
    fixture.client.fund(&fixture.investor_b, &400);
    assert_eq!(
        fixture.env.events().all(),
        std::vec![
            Funded {
                investor: fixture.investor_b.clone(),
                amount: 400,
                investor_total: 400,
                deal_total: TARGET,
                schema_version: EVENT_SCHEMA_VERSION,
            }
            .to_xdr(&fixture.env, &fixture.contract_id),
            FundingCompleted {
                total_funded: TARGET,
                completed_at_timestamp: NOW,
                schema_version: EVENT_SCHEMA_VERSION,
            }
            .to_xdr(&fixture.env, &fixture.contract_id),
        ]
    );
    assert_eq!(fixture.client.state(), DealState::Funded);
    assert_eq!(fixture.client.contribution(&fixture.investor_a), 600);
    assert_eq!(fixture.client.contribution(&fixture.investor_b), 400);
    assert_eq!(fixture.client.total_funded(), TARGET);

    let hash = evidence_hash(&fixture.env, 7);
    assert_eq!(fixture.client.submit_evidence(&hash), 1);
    assert_eq!(fixture.client.state(), DealState::EvidenceSubmitted);
    fixture.client.approve_milestone(&hash, &1);
    assert_eq!(fixture.client.state(), DealState::Approved);

    assert_eq!(fixture.client.release(&hash, &1, &TARGET), TARGET);
    assert_eq!(
        fixture.env.events().all(),
        std::vec![Released {
            startup: fixture.startup.clone(),
            evidence_hash: hash,
            evidence_version: 1,
            amount: TARGET,
            released_at_timestamp: NOW,
            schema_version: EVENT_SCHEMA_VERSION,
        }
        .to_xdr(&fixture.env, &fixture.contract_id)]
    );
    assert_eq!(fixture.client.state(), DealState::Released);
    assert!(fixture.client.is_released());
    assert_eq!(fixture.client.total_released(), TARGET);
    assert_eq!(fixture.client.total_refunded(), 0);
    assert_eq!(
        token::Client::new(&fixture.env, &fixture.asset).balance(&fixture.startup),
        TARGET
    );
}

#[test]
fn funding_rejects_non_positive_over_target_and_post_target_amounts() {
    let fixture = fixture();

    assert_eq!(
        fixture.client.try_fund(&fixture.investor_a, &0),
        Err(Ok(Error::InvalidAmount))
    );
    assert_eq!(
        fixture.client.try_fund(&fixture.investor_a, &-1),
        Err(Ok(Error::InvalidAmount))
    );
    fixture.client.fund(&fixture.investor_a, &900);
    assert_eq!(
        fixture.client.try_fund(&fixture.investor_b, &101),
        Err(Ok(Error::FundingTargetExceeded))
    );
    assert_eq!(fixture.client.total_funded(), 900);

    fixture.client.fund(&fixture.investor_b, &100);
    assert_eq!(fixture.client.state(), DealState::Funded);
    assert_eq!(
        fixture.client.try_fund(&fixture.investor_a, &1),
        Err(Ok(Error::InvalidState))
    );
}

#[test]
fn repeated_funding_accumulates_without_losing_attribution() {
    let fixture = fixture();
    fixture.client.fund(&fixture.investor_a, &250);
    fixture.client.fund(&fixture.investor_a, &150);
    fixture.client.fund(&fixture.investor_b, &100);

    assert_eq!(fixture.client.contribution(&fixture.investor_a), 400);
    assert_eq!(fixture.client.contribution(&fixture.investor_b), 100);
    assert_eq!(fixture.client.total_funded(), 500);
    assert_eq!(fixture.client.state(), DealState::FundingOpen);
}

#[test]
fn funding_deadline_is_exclusive_and_opens_underfunded_refunds() {
    let fixture = fixture();
    fixture.client.fund(&fixture.investor_a, &400);
    fixture.env.ledger().set_timestamp(FUNDING_DEADLINE);

    assert_eq!(
        fixture.client.try_fund(&fixture.investor_b, &100),
        Err(Ok(Error::FundingDeadlineReached))
    );
    assert_eq!(
        fixture.client.open_refunds(),
        RefundReason::FundingTargetMissed
    );
    assert_eq!(fixture.client.state(), DealState::Refundable);
    assert_eq!(fixture.client.refundable_amount(&fixture.investor_a), 400);
}

#[test]
fn evidence_can_be_resubmitted_before_but_not_after_exact_approval() {
    let fixture = fixture();
    fund_exact_target(&fixture);
    let first = evidence_hash(&fixture.env, 1);
    let second = evidence_hash(&fixture.env, 2);

    assert_eq!(fixture.client.submit_evidence(&first), 1);
    assert_eq!(fixture.client.submit_evidence(&second), 2);
    assert_eq!(
        fixture.client.try_approve_milestone(&first, &1),
        Err(Ok(Error::EvidenceMismatch))
    );
    assert_eq!(fixture.client.state(), DealState::EvidenceSubmitted);

    fixture.client.approve_milestone(&second, &2);
    let approval = fixture.client.milestone_approval().unwrap();
    assert_eq!(approval.evidence_hash, second);
    assert_eq!(approval.evidence_version, 2);
    assert_eq!(approval.release_amount, TARGET);
    assert_eq!(fixture.client.state(), DealState::Approved);
    assert_eq!(
        fixture.client.try_submit_evidence(&first),
        Err(Ok(Error::InvalidState))
    );
    assert_eq!(
        fixture.client.try_approve_milestone(&second, &2),
        Err(Ok(Error::InvalidState))
    );
}

#[test]
fn evidence_and_approval_are_rejected_before_exact_funding() {
    let fixture = fixture();
    let hash = evidence_hash(&fixture.env, 3);
    fixture.client.fund(&fixture.investor_a, &999);

    assert_eq!(
        fixture.client.try_submit_evidence(&hash),
        Err(Ok(Error::InvalidState))
    );
    assert_eq!(
        fixture.client.try_approve_milestone(&hash, &1),
        Err(Ok(Error::InvalidState))
    );
}

#[test]
fn release_is_bound_to_the_approved_hash_version_and_amount() {
    let fixture = fixture();
    fund_exact_target(&fixture);
    let approved_hash = submit_and_approve(&fixture, 4);
    let wrong_hash = evidence_hash(&fixture.env, 5);

    assert_eq!(
        fixture.client.try_release(&wrong_hash, &1, &TARGET),
        Err(Ok(Error::ReleaseMismatch))
    );
    assert_eq!(
        fixture.client.try_release(&approved_hash, &2, &TARGET),
        Err(Ok(Error::ReleaseMismatch))
    );
    assert_eq!(
        fixture
            .client
            .try_release(&approved_hash, &1, &(TARGET - 1)),
        Err(Ok(Error::ReleaseMismatch))
    );
    assert_eq!(fixture.client.state(), DealState::Approved);
    assert_eq!(fixture.client.total_released(), 0);

    fixture.client.release(&approved_hash, &1, &TARGET);
    assert_eq!(fixture.client.state(), DealState::Released);
}

#[test]
fn release_requires_approval_and_is_irreversible() {
    let fixture = fixture();
    fund_exact_target(&fixture);
    let hash = evidence_hash(&fixture.env, 6);

    assert_eq!(
        fixture.client.try_release(&hash, &1, &TARGET),
        Err(Ok(Error::InvalidState))
    );
    fixture.client.submit_evidence(&hash);
    assert_eq!(
        fixture.client.try_release(&hash, &1, &TARGET),
        Err(Ok(Error::InvalidState))
    );
    fixture.client.approve_milestone(&hash, &1);
    fixture.client.release(&hash, &1, &TARGET);
    assert_eq!(
        fixture.client.try_release(&hash, &1, &TARGET),
        Err(Ok(Error::InvalidState))
    );
    assert_eq!(
        fixture.client.try_open_refunds(),
        Err(Ok(Error::InvalidState))
    );
}

#[test]
fn release_deadline_is_exclusive_even_after_approval() {
    let fixture = fixture();
    fund_exact_target(&fixture);
    let hash = submit_and_approve(&fixture, 8);
    fixture.env.ledger().set_timestamp(RELEASE_DEADLINE);

    assert_eq!(
        fixture.client.try_release(&hash, &1, &TARGET),
        Err(Ok(Error::ReleaseDeadlineReached))
    );
    assert_eq!(
        fixture.client.open_refunds(),
        RefundReason::ReleaseDeadlineMissed
    );
    assert_eq!(fixture.client.state(), DealState::Refundable);
    assert_eq!(
        fixture.client.try_release(&hash, &1, &TARGET),
        Err(Ok(Error::InvalidState))
    );
}

#[test]
fn permissionless_refunds_return_each_contribution_only_to_its_investor() {
    let fixture = fixture();
    let token = token::Client::new(&fixture.env, &fixture.asset);
    fixture.client.fund(&fixture.investor_a, &300);
    fixture.client.fund(&fixture.investor_b, &200);
    let investor_a_after_funding = token.balance(&fixture.investor_a);
    let investor_b_after_funding = token.balance(&fixture.investor_b);
    fixture.env.ledger().set_timestamp(FUNDING_DEADLINE);

    assert_eq!(fixture.client.claim_refund(&fixture.investor_b), 200);
    assert!(fixture.env.auths().is_empty());
    assert_eq!(
        token.balance(&fixture.investor_b),
        investor_b_after_funding + 200
    );
    assert_eq!(fixture.client.state(), DealState::Refundable);
    assert_eq!(fixture.client.total_refunded(), 200);
    assert_eq!(fixture.client.refunded_amount(&fixture.investor_b), 200);
    assert_eq!(
        fixture.client.try_claim_refund(&fixture.investor_b),
        Err(Ok(Error::AlreadyRefunded))
    );

    assert_eq!(fixture.client.claim_refund(&fixture.investor_a), 300);
    assert!(fixture.env.auths().is_empty());
    assert_eq!(
        token.balance(&fixture.investor_a),
        investor_a_after_funding + 300
    );
    assert_eq!(fixture.client.state(), DealState::Refunded);
    assert_eq!(fixture.client.total_refunded(), 500);
    assert_eq!(token.balance(&fixture.contract_id), 0);
}

#[test]
fn fully_funded_deal_refunds_only_after_the_release_deadline() {
    let fixture = fixture();
    fund_exact_target(&fixture);
    fixture.env.ledger().set_timestamp(FUNDING_DEADLINE);

    assert_eq!(
        fixture.client.try_open_refunds(),
        Err(Ok(Error::RefundNotAvailable))
    );
    fixture.env.ledger().set_timestamp(RELEASE_DEADLINE);
    assert_eq!(
        fixture.client.open_refunds(),
        RefundReason::ReleaseDeadlineMissed
    );
    assert_eq!(fixture.client.claim_refund(&fixture.investor_a), 600);
    assert_eq!(fixture.client.claim_refund(&fixture.investor_b), 400);
    assert_eq!(fixture.client.state(), DealState::Refunded);
    assert_eq!(fixture.client.total_released(), 0);
}

#[test]
fn refund_opening_is_idempotent_and_zero_fund_deals_finish_cleanly() {
    let fixture = fixture();
    fixture.env.ledger().set_timestamp(FUNDING_DEADLINE);

    assert_eq!(
        fixture.client.open_refunds(),
        RefundReason::FundingTargetMissed
    );
    assert_eq!(
        fixture.env.events().all(),
        std::vec![
            RefundsOpened {
                reason: RefundReason::FundingTargetMissed,
                total_funded: 0,
                opened_at_timestamp: FUNDING_DEADLINE,
                schema_version: EVENT_SCHEMA_VERSION,
            }
            .to_xdr(&fixture.env, &fixture.contract_id),
            RefundsCompleted {
                total_refunded: 0,
                completed_at_timestamp: FUNDING_DEADLINE,
                schema_version: EVENT_SCHEMA_VERSION,
            }
            .to_xdr(&fixture.env, &fixture.contract_id),
        ]
    );
    assert_eq!(fixture.client.state(), DealState::Refunded);
    assert_eq!(
        fixture.client.open_refunds(),
        RefundReason::FundingTargetMissed
    );
    assert!(fixture.env.events().all().events().is_empty());
    assert_eq!(fixture.client.total_refunded(), 0);
}

#[test]
fn refund_rejects_unknown_investors_and_blocks_every_forward_transition() {
    let fixture = fixture();
    let unknown = Address::generate(&fixture.env);
    let hash = evidence_hash(&fixture.env, 9);
    fixture.client.fund(&fixture.investor_a, &300);
    fixture.env.ledger().set_timestamp(FUNDING_DEADLINE);
    fixture.client.open_refunds();

    assert_eq!(
        fixture.client.try_claim_refund(&unknown),
        Err(Ok(Error::NoContribution))
    );
    assert_eq!(
        fixture.client.try_fund(&fixture.investor_b, &100),
        Err(Ok(Error::InvalidState))
    );
    assert_eq!(
        fixture.client.try_submit_evidence(&hash),
        Err(Ok(Error::InvalidState))
    );
    assert_eq!(
        fixture.client.try_release(&hash, &1, &TARGET),
        Err(Ok(Error::InvalidState))
    );
}

#[test]
fn unsolicited_sac_balance_is_never_counted_released_or_refunded() {
    let release_fixture = fixture();
    fund_exact_target(&release_fixture);
    MockUsdcClient::new(&release_fixture.env, &release_fixture.asset)
        .mint(&release_fixture.contract_id, &125);
    let hash = submit_and_approve(&release_fixture, 10);
    release_fixture.client.release(&hash, &1, &TARGET);

    let release_token = token::Client::new(&release_fixture.env, &release_fixture.asset);
    assert_eq!(release_token.balance(&release_fixture.startup), TARGET);
    assert_eq!(release_token.balance(&release_fixture.contract_id), 125);
    assert_eq!(release_fixture.client.total_released(), TARGET);

    let refund_fixture = fixture();
    refund_fixture.client.fund(&refund_fixture.investor_a, &300);
    MockUsdcClient::new(&refund_fixture.env, &refund_fixture.asset)
        .mint(&refund_fixture.contract_id, &125);
    refund_fixture.env.ledger().set_timestamp(FUNDING_DEADLINE);
    refund_fixture
        .client
        .claim_refund(&refund_fixture.investor_a);

    let refund_token = token::Client::new(&refund_fixture.env, &refund_fixture.asset);
    assert_eq!(refund_token.balance(&refund_fixture.contract_id), 125);
    assert_eq!(refund_fixture.client.total_refunded(), 300);
}

#[test]
fn balance_deficit_stops_release_without_corrupting_approved_state() {
    let fixture = fixture();
    fund_exact_target(&fixture);
    let hash = submit_and_approve(&fixture, 11);
    let external = Address::generate(&fixture.env);
    MockUsdcClient::new(&fixture.env, &fixture.asset).transfer(&fixture.contract_id, &external, &1);

    assert_eq!(
        fixture.client.try_release(&hash, &1, &TARGET),
        Err(Ok(Error::BalanceInvariantViolation))
    );
    assert_eq!(fixture.client.state(), DealState::Approved);
    assert_eq!(fixture.client.total_released(), 0);
}

#[test]
fn failed_sac_payout_rolls_back_the_terminal_release_state() {
    let fixture = fixture();
    fund_exact_target(&fixture);
    let hash = submit_and_approve(&fixture, 13);
    let mock_token = MockUsdcClient::new(&fixture.env, &fixture.asset);
    mock_token.set_blocked_recipient(&fixture.startup, &true);

    assert!(fixture.client.try_release(&hash, &1, &TARGET).is_err());
    assert_eq!(fixture.client.state(), DealState::Approved);
    assert_eq!(fixture.client.total_released(), 0);
    assert_eq!(mock_token.balance(&fixture.contract_id), TARGET);
    assert_eq!(mock_token.balance(&fixture.startup), 0);
}

#[test]
fn failed_sac_refund_rolls_back_accounting_and_refund_activation() {
    let fixture = fixture();
    fixture.client.fund(&fixture.investor_a, &300);
    fixture.env.ledger().set_timestamp(FUNDING_DEADLINE);
    let mock_token = MockUsdcClient::new(&fixture.env, &fixture.asset);
    mock_token.set_blocked_recipient(&fixture.investor_a, &true);

    assert!(fixture
        .client
        .try_claim_refund(&fixture.investor_a)
        .is_err());
    assert_eq!(fixture.client.state(), DealState::FundingOpen);
    assert_eq!(fixture.client.refund_reason(), None);
    assert_eq!(fixture.client.total_refunded(), 0);
    assert_eq!(fixture.client.refunded_amount(&fixture.investor_a), 0);
    assert_eq!(mock_token.balance(&fixture.contract_id), 300);

    mock_token.set_blocked_recipient(&fixture.investor_a, &false);
    assert_eq!(fixture.client.claim_refund(&fixture.investor_a), 300);
    assert_eq!(fixture.client.state(), DealState::Refunded);
}

#[test]
fn each_business_action_requests_only_its_expected_authority() {
    let fixture = fixture();

    fixture.client.fund(&fixture.investor_a, &TARGET);
    assert_eq!(fixture.env.auths()[0].0, fixture.investor_a);

    let hash = evidence_hash(&fixture.env, 12);
    fixture.client.submit_evidence(&hash);
    assert_eq!(fixture.env.auths()[0].0, fixture.startup);

    fixture.client.approve_milestone(&hash, &1);
    assert_eq!(fixture.env.auths()[0].0, fixture.fund_manager);

    fixture.client.release(&hash, &1, &TARGET);
    assert_eq!(fixture.env.auths()[0].0, fixture.release_authority);

    let refund_fixture = fixture_with_target(2_000);
    refund_fixture.client.fund(&refund_fixture.investor_a, &100);
    refund_fixture.env.ledger().set_timestamp(FUNDING_DEADLINE);
    refund_fixture
        .client
        .claim_refund(&refund_fixture.investor_a);
    assert!(refund_fixture.env.auths().is_empty());
}
