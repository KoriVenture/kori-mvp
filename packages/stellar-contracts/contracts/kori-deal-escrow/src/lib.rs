#![no_std]

//! # Kori Deal Escrow
//!
//! Testnet-only, deal-scoped USDC escrow for Kori on Stellar/Soroban.
//!
//! V1 deliberately supports one deal, one startup, one milestone, one exact
//! funding target, and one full release. Investors fund the contract C-address
//! through the pinned Testnet USDC Stellar Asset Contract (SAC). The startup
//! submits an off-chain evidence hash, the deal-scoped Fund Manager approves
//! that exact evidence version, and a separate weighted Stellar release account
//! authorizes the exact payout.
//!
//! The release account is an authorization mechanism, not the custodian. Its
//! required signer policy is enforced by the Stellar account configuration:
//! Investor Representative plus either the Lead Investor (normal path) or Kori
//! Release Officer (recovery path). If release does not occur before the
//! immutable deadline, refunds become permissionless and always return to each
//! original investor address.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, token,
    Address, BytesN, Env,
};

/// Official Circle USDC SEP-41/SAC address on Stellar Testnet.
///
/// This artifact is intentionally Testnet-only. Mainnet requires a separately
/// reviewed build with the Mainnet network ID and SAC address.
pub const TESTNET_USDC_SAC_ADDRESS: &str =
    "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

/// SHA-256(`Test SDF Network ; September 2015`).
pub const TESTNET_NETWORK_ID: [u8; 32] = [
    0xce, 0xe0, 0x30, 0x2d, 0x59, 0x84, 0x4d, 0x32, 0xbd, 0xca, 0x91, 0x5c, 0x82, 0x03, 0xdd, 0x44,
    0xb3, 0x3f, 0xbb, 0x7e, 0xdc, 0x19, 0x05, 0x1e, 0xa3, 0x7a, 0xbe, 0xdf, 0x28, 0xec, 0xd4, 0x72,
];

/// Schema version included in every Kori contract event.
pub const EVENT_SCHEMA_VERSION: u32 = 1;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
/// Immutable configuration for one V1 deal escrow.
pub struct Config {
    /// Pinned official Testnet USDC Stellar Asset Contract address.
    pub asset: Address,
    /// Immutable payout destination and V1 evidence submitter.
    pub startup: Address,
    /// Deal-scoped Lead Investor/Fund Manager who approves evidence.
    pub fund_manager: Address,
    /// Weighted Stellar G-account that authorizes the payout.
    pub release_authority: Address,
    /// Exact V1 funding target, maximum, and full release amount in base units.
    pub target_amount: i128,
    /// Absolute Unix timestamp after which incomplete funding is refundable.
    pub funding_deadline: u64,
    /// Absolute Unix timestamp after which every unreleased deal is refundable.
    pub release_deadline: u64,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
/// Explicit lifecycle for the one-deal V1 escrow.
pub enum DealState {
    /// Contributions are accepted until the target or funding deadline.
    FundingOpen,
    /// The exact target is held and startup evidence may be submitted.
    Funded,
    /// The startup has submitted a current evidence hash.
    EvidenceSubmitted,
    /// The Fund Manager approved the current evidence hash and version.
    Approved,
    /// The exact target was irreversibly paid to the startup.
    Released,
    /// Unreleased contributions are claimable by original investor address.
    Refundable,
    /// Every accounted contribution was returned, including the zero-fund case.
    Refunded,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
/// Deterministic timeout that opened the refund path.
pub enum RefundReason {
    /// The funding deadline elapsed before the exact target was reached.
    FundingTargetMissed,
    /// The release deadline elapsed before a valid full payout.
    ReleaseDeadlineMissed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
/// Current startup-submitted evidence anchor.
pub struct EvidenceSubmission {
    /// SHA-256-style digest of the canonical off-chain evidence manifest.
    pub evidence_hash: BytesN<32>,
    /// Monotonic version; resubmission is allowed only before approval.
    pub version: u32,
    /// Ledger sequence in which this version was submitted.
    pub submitted_at_ledger: u32,
    /// Ledger close timestamp in which this version was submitted.
    pub submitted_at_timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
/// Immutable approval of one evidence version and exact release amount.
pub struct MilestoneApproval {
    /// Approved evidence digest.
    pub evidence_hash: BytesN<32>,
    /// Approved evidence version.
    pub evidence_version: u32,
    /// Exact amount the release authority is permitted to release.
    pub release_amount: i128,
    /// Ledger sequence in which the Fund Manager approved the evidence.
    pub approved_at_ledger: u32,
    /// Ledger close timestamp in which the Fund Manager approved the evidence.
    pub approved_at_timestamp: u64,
}

#[contracttype]
/// Internal storage keys. Aggregate state uses instance storage; investor
/// accounting uses persistent storage.
pub enum DataKey {
    Config,
    State,
    Contribution(Address),
    RefundedAmount(Address),
    TotalFunded,
    TotalReleased,
    TotalRefunded,
    Evidence,
    Approval,
    RefundReason,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
/// Contract errors returned when an escrow invariant would be violated.
pub enum Error {
    /// Amounts and the immutable target must be strictly positive.
    InvalidAmount = 1,
    /// Constructor deadlines are expired or not strictly ordered.
    InvalidDeadline = 2,
    /// Startup, Fund Manager, and release authority must be distinct.
    InvalidRoleConfiguration = 3,
    /// This Testnet-only Wasm was deployed on another Stellar network.
    UnsupportedNetwork = 4,
    /// The requested transition is not valid from the current deal state.
    InvalidState = 5,
    /// The funding deadline has elapsed.
    FundingDeadlineReached = 6,
    /// The contribution would exceed the exact V1 target.
    FundingTargetExceeded = 7,
    /// The release deadline has elapsed.
    ReleaseDeadlineReached = 8,
    /// The supplied evidence hash/version is not the current submission.
    EvidenceMismatch = 9,
    /// The supplied release hash/version/amount is not the immutable approval.
    ReleaseMismatch = 10,
    /// No applicable deadline has elapsed, so refunds cannot open yet.
    RefundNotAvailable = 11,
    /// The requested address has no recorded contribution.
    NoContribution = 12,
    /// This investor's complete contribution was already refunded.
    AlreadyRefunded = 13,
    /// The SAC balance is below the remaining accounted obligation.
    BalanceInvariantViolation = 14,
    /// Checked accounting arithmetic exceeded the supported integer range.
    ArithmeticOverflow = 15,
}

#[contractevent]
/// Emitted after an accepted investor contribution and accounting update.
pub struct Funded {
    #[topic]
    pub investor: Address,
    pub amount: i128,
    pub investor_total: i128,
    pub deal_total: i128,
    pub schema_version: u32,
}

#[contractevent]
/// Emitted when the exact immutable V1 funding target is reached.
pub struct FundingCompleted {
    pub total_funded: i128,
    pub completed_at_timestamp: u64,
    pub schema_version: u32,
}

#[contractevent]
/// Emitted for each startup-submitted evidence version.
pub struct EvidenceSubmitted {
    #[topic]
    pub startup: Address,
    pub evidence_hash: BytesN<32>,
    pub evidence_version: u32,
    pub submitted_at_timestamp: u64,
    pub schema_version: u32,
}

#[contractevent]
/// Emitted when the Fund Manager approves the current evidence version.
pub struct MilestoneApproved {
    #[topic]
    pub fund_manager: Address,
    pub evidence_hash: BytesN<32>,
    pub evidence_version: u32,
    pub release_amount: i128,
    pub approved_at_timestamp: u64,
    pub schema_version: u32,
}

#[contractevent]
/// Emitted after the exact approved amount reaches the immutable startup.
pub struct Released {
    #[topic]
    pub startup: Address,
    pub evidence_hash: BytesN<32>,
    pub evidence_version: u32,
    pub amount: i128,
    pub released_at_timestamp: u64,
    pub schema_version: u32,
}

#[contractevent]
/// Emitted once when a deterministic timeout opens permissionless refunds.
pub struct RefundsOpened {
    pub reason: RefundReason,
    pub total_funded: i128,
    pub opened_at_timestamp: u64,
    pub schema_version: u32,
}

#[contractevent]
/// Emitted after one investor's contribution is returned to that same address.
pub struct Refunded {
    #[topic]
    pub investor: Address,
    pub amount: i128,
    pub total_refunded: i128,
    pub schema_version: u32,
}

#[contractevent]
/// Emitted once all accounted contributions have been returned.
pub struct RefundsCompleted {
    pub total_refunded: i128,
    pub completed_at_timestamp: u64,
    pub schema_version: u32,
}

#[contract]
/// One-deal, one-milestone USDC escrow with timeout-safe investor refunds.
pub struct KoriDealEscrow;

#[contractimpl]
impl KoriDealEscrow {
    /// Creates one immutable Testnet deal escrow.
    ///
    /// # Parameters
    ///
    /// - `startup`: immutable USDC recipient and V1 evidence submitter.
    /// - `fund_manager`: deal Lead Investor who approves evidence.
    /// - `release_authority`: weighted G-account enforcing the approved signer
    ///   combinations outside this contract.
    /// - `target_amount`: exact funding cap and one-time release amount.
    /// - `funding_deadline`: absolute Unix timestamp for incomplete funding.
    /// - `release_deadline`: later absolute Unix timestamp for unreleased funds.
    ///
    /// Constructor arguments are written atomically during deployment. There is
    /// no setter or upgrade entry point in V1.
    pub fn __constructor(
        env: Env,
        startup: Address,
        fund_manager: Address,
        release_authority: Address,
        target_amount: i128,
        funding_deadline: u64,
        release_deadline: u64,
    ) {
        if env.ledger().network_id() != BytesN::from_array(&env, &TESTNET_NETWORK_ID) {
            panic_with_error!(&env, Error::UnsupportedNetwork);
        }
        if target_amount <= 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }
        let now = env.ledger().timestamp();
        if funding_deadline <= now || release_deadline <= funding_deadline {
            panic_with_error!(&env, Error::InvalidDeadline);
        }
        if startup == fund_manager
            || startup == release_authority
            || fund_manager == release_authority
        {
            panic_with_error!(&env, Error::InvalidRoleConfiguration);
        }

        let config = Config {
            asset: Address::from_str(&env, TESTNET_USDC_SAC_ADDRESS),
            startup,
            fund_manager,
            release_authority,
            target_amount,
            funding_deadline,
            release_deadline,
        };
        let instance = env.storage().instance();
        instance.set(&DataKey::Config, &config);
        instance.set(&DataKey::State, &DealState::FundingOpen);
        instance.set(&DataKey::TotalFunded, &0_i128);
        instance.set(&DataKey::TotalReleased, &0_i128);
        instance.set(&DataKey::TotalRefunded, &0_i128);
    }

    /// Transfers an investor's authorized USDC contribution into the escrow.
    ///
    /// Funding is accepted only while `FundingOpen`, strictly before the
    /// funding deadline, and only up to the exact target. Reaching the target
    /// atomically closes funding and moves the deal to `Funded`.
    pub fn fund(env: Env, investor: Address, amount: i128) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if Self::state(env.clone()) != DealState::FundingOpen {
            return Err(Error::InvalidState);
        }

        let config = Self::config(env.clone());
        if env.ledger().timestamp() >= config.funding_deadline {
            return Err(Error::FundingDeadlineReached);
        }

        let total = Self::total_funded(env.clone());
        let new_total = total.checked_add(amount).ok_or(Error::ArithmeticOverflow)?;
        if new_total > config.target_amount {
            return Err(Error::FundingTargetExceeded);
        }

        let contribution_key = DataKey::Contribution(investor.clone());
        let prior: i128 = env
            .storage()
            .persistent()
            .get(&contribution_key)
            .unwrap_or(0);
        let new_contribution = prior.checked_add(amount).ok_or(Error::ArithmeticOverflow)?;

        investor.require_auth();
        token::Client::new(&env, &config.asset).transfer(
            &investor,
            env.current_contract_address(),
            &amount,
        );

        env.storage()
            .persistent()
            .set(&contribution_key, &new_contribution);
        env.storage()
            .instance()
            .set(&DataKey::TotalFunded, &new_total);

        Funded {
            investor,
            amount,
            investor_total: new_contribution,
            deal_total: new_total,
            schema_version: EVENT_SCHEMA_VERSION,
        }
        .publish(&env);

        if new_total == config.target_amount {
            Self::set_state(&env, DealState::Funded);
            FundingCompleted {
                total_funded: new_total,
                completed_at_timestamp: env.ledger().timestamp(),
                schema_version: EVENT_SCHEMA_VERSION,
            }
            .publish(&env);
        }
        Ok(())
    }

    /// Anchors a startup evidence manifest by its 32-byte hash.
    ///
    /// The immutable startup address must authorize the call. Resubmission
    /// replaces the current hash and increments its version only while evidence
    /// remains unapproved. Documents and AI analysis stay off-chain.
    pub fn submit_evidence(env: Env, evidence_hash: BytesN<32>) -> Result<u32, Error> {
        let state = Self::state(env.clone());
        if state != DealState::Funded && state != DealState::EvidenceSubmitted {
            return Err(Error::InvalidState);
        }
        let config = Self::config(env.clone());
        if env.ledger().timestamp() >= config.release_deadline {
            return Err(Error::ReleaseDeadlineReached);
        }

        let prior_version = Self::evidence_submission(env.clone())
            .map(|evidence| evidence.version)
            .unwrap_or(0);
        let version = prior_version
            .checked_add(1)
            .ok_or(Error::ArithmeticOverflow)?;

        config.startup.require_auth();
        let submission = EvidenceSubmission {
            evidence_hash: evidence_hash.clone(),
            version,
            submitted_at_ledger: env.ledger().sequence(),
            submitted_at_timestamp: env.ledger().timestamp(),
        };
        env.storage()
            .instance()
            .set(&DataKey::Evidence, &submission);
        Self::set_state(&env, DealState::EvidenceSubmitted);
        EvidenceSubmitted {
            startup: config.startup,
            evidence_hash,
            evidence_version: version,
            submitted_at_timestamp: submission.submitted_at_timestamp,
            schema_version: EVENT_SCHEMA_VERSION,
        }
        .publish(&env);
        Ok(version)
    }

    /// Approves the current evidence version and immutable full release amount.
    ///
    /// Only the configured Fund Manager may approve. Approval is final: the
    /// startup cannot replace evidence after this transition.
    pub fn approve_milestone(
        env: Env,
        evidence_hash: BytesN<32>,
        evidence_version: u32,
    ) -> Result<(), Error> {
        if Self::state(env.clone()) != DealState::EvidenceSubmitted {
            return Err(Error::InvalidState);
        }
        let config = Self::config(env.clone());
        if env.ledger().timestamp() >= config.release_deadline {
            return Err(Error::ReleaseDeadlineReached);
        }
        let evidence = Self::evidence_submission(env.clone()).ok_or(Error::EvidenceMismatch)?;
        if evidence.evidence_hash != evidence_hash || evidence.version != evidence_version {
            return Err(Error::EvidenceMismatch);
        }

        config.fund_manager.require_auth();
        let approval = MilestoneApproval {
            evidence_hash: evidence_hash.clone(),
            evidence_version,
            release_amount: config.target_amount,
            approved_at_ledger: env.ledger().sequence(),
            approved_at_timestamp: env.ledger().timestamp(),
        };
        env.storage().instance().set(&DataKey::Approval, &approval);
        Self::set_state(&env, DealState::Approved);
        MilestoneApproved {
            fund_manager: config.fund_manager,
            evidence_hash,
            evidence_version,
            release_amount: approval.release_amount,
            approved_at_timestamp: approval.approved_at_timestamp,
            schema_version: EVENT_SCHEMA_VERSION,
        }
        .publish(&env);
        Ok(())
    }

    /// Releases the exact approved target to the immutable startup address.
    ///
    /// The weighted `release_authority` G-account must authorize this exact
    /// invocation, binding its signatures to the contract, evidence hash,
    /// evidence version, and amount. The Stellar account configuration must
    /// enforce Investor Representative plus Lead Investor or Kori.
    pub fn release(
        env: Env,
        evidence_hash: BytesN<32>,
        evidence_version: u32,
        amount: i128,
    ) -> Result<i128, Error> {
        if Self::state(env.clone()) != DealState::Approved {
            return Err(Error::InvalidState);
        }
        let config = Self::config(env.clone());
        if env.ledger().timestamp() >= config.release_deadline {
            return Err(Error::ReleaseDeadlineReached);
        }
        let approval = Self::milestone_approval(env.clone()).ok_or(Error::ReleaseMismatch)?;
        if approval.evidence_hash != evidence_hash
            || approval.evidence_version != evidence_version
            || approval.release_amount != amount
            || amount != config.target_amount
        {
            return Err(Error::ReleaseMismatch);
        }
        if Self::total_funded(env.clone()) != config.target_amount
            || Self::total_refunded(env.clone()) != 0
        {
            return Err(Error::BalanceInvariantViolation);
        }

        let token = token::Client::new(&env, &config.asset);
        let escrow = env.current_contract_address();
        if token.balance(&escrow) < amount {
            return Err(Error::BalanceInvariantViolation);
        }

        config.release_authority.require_auth();
        Self::set_state(&env, DealState::Released);
        env.storage()
            .instance()
            .set(&DataKey::TotalReleased, &amount);
        token.transfer(&escrow, &config.startup, &amount);
        Released {
            startup: config.startup,
            evidence_hash,
            evidence_version,
            amount,
            released_at_timestamp: env.ledger().timestamp(),
            schema_version: EVENT_SCHEMA_VERSION,
        }
        .publish(&env);
        Ok(amount)
    }

    /// Opens permissionless refunds after the applicable immutable deadline.
    ///
    /// No authorization is required. The function is idempotent after refunds
    /// have opened and cannot affect a released deal.
    pub fn open_refunds(env: Env) -> Result<RefundReason, Error> {
        Self::activate_refunds(&env)
    }

    /// Returns one investor's complete unreleased contribution.
    ///
    /// Anyone may call this function for any investor after refunds are
    /// eligible. The destination is hard-bound to `investor`; the caller cannot
    /// redirect or receive the funds. One investor is processed per invocation.
    pub fn claim_refund(env: Env, investor: Address) -> Result<i128, Error> {
        Self::activate_refunds(&env)?;

        let contribution = Self::contribution(env.clone(), investor.clone());
        if contribution <= 0 {
            return Err(Error::NoContribution);
        }
        let refunded = Self::refunded_amount(env.clone(), investor.clone());
        if refunded >= contribution {
            return Err(Error::AlreadyRefunded);
        }
        let amount = contribution
            .checked_sub(refunded)
            .ok_or(Error::ArithmeticOverflow)?;
        let prior_total_refunded = Self::total_refunded(env.clone());
        let new_total_refunded = prior_total_refunded
            .checked_add(amount)
            .ok_or(Error::ArithmeticOverflow)?;
        let total_funded = Self::total_funded(env.clone());
        if new_total_refunded > total_funded {
            return Err(Error::BalanceInvariantViolation);
        }

        let config = Self::config(env.clone());
        let token = token::Client::new(&env, &config.asset);
        let escrow = env.current_contract_address();
        let outstanding = total_funded
            .checked_sub(prior_total_refunded)
            .ok_or(Error::ArithmeticOverflow)?;
        if token.balance(&escrow) < outstanding {
            return Err(Error::BalanceInvariantViolation);
        }

        env.storage()
            .persistent()
            .set(&DataKey::RefundedAmount(investor.clone()), &contribution);
        env.storage()
            .instance()
            .set(&DataKey::TotalRefunded, &new_total_refunded);
        if new_total_refunded == total_funded {
            Self::set_state(&env, DealState::Refunded);
        }

        token.transfer(&escrow, &investor, &amount);
        Refunded {
            investor,
            amount,
            total_refunded: new_total_refunded,
            schema_version: EVENT_SCHEMA_VERSION,
        }
        .publish(&env);
        if new_total_refunded == total_funded {
            RefundsCompleted {
                total_refunded: new_total_refunded,
                completed_at_timestamp: env.ledger().timestamp(),
                schema_version: EVENT_SCHEMA_VERSION,
            }
            .publish(&env);
        }
        Ok(amount)
    }

    /// Returns the immutable deal configuration.
    pub fn config(env: Env) -> Config {
        env.storage().instance().get(&DataKey::Config).unwrap()
    }

    /// Returns the current explicit deal state.
    pub fn state(env: Env) -> DealState {
        env.storage().instance().get(&DataKey::State).unwrap()
    }

    /// Returns one investor's cumulative accepted contribution.
    pub fn contribution(env: Env, investor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(investor))
            .unwrap_or(0)
    }

    /// Returns one investor's cumulative amount already returned.
    pub fn refunded_amount(env: Env, investor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::RefundedAmount(investor))
            .unwrap_or(0)
    }

    /// Returns the amount currently claimable by one investor.
    pub fn refundable_amount(env: Env, investor: Address) -> i128 {
        let state = Self::state(env.clone());
        if state != DealState::Refundable {
            return 0;
        }
        Self::contribution(env.clone(), investor.clone())
            .checked_sub(Self::refunded_amount(env, investor))
            .unwrap_or(0)
    }

    /// Returns the cumulative amount accepted by the escrow.
    pub fn total_funded(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalFunded)
            .unwrap_or(0)
    }

    /// Returns the one-time amount paid to the startup, or zero.
    pub fn total_released(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalReleased)
            .unwrap_or(0)
    }

    /// Returns cumulative investor refunds.
    pub fn total_refunded(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalRefunded)
            .unwrap_or(0)
    }

    /// Returns the current evidence submission, if any.
    pub fn evidence_submission(env: Env) -> Option<EvidenceSubmission> {
        env.storage().instance().get(&DataKey::Evidence)
    }

    /// Returns the immutable milestone approval, if any.
    pub fn milestone_approval(env: Env) -> Option<MilestoneApproval> {
        env.storage().instance().get(&DataKey::Approval)
    }

    /// Returns the timeout reason after refunds have opened.
    pub fn refund_reason(env: Env) -> Option<RefundReason> {
        env.storage().instance().get(&DataKey::RefundReason)
    }

    /// Returns `true` only after the irreversible startup payout.
    pub fn is_released(env: Env) -> bool {
        Self::state(env) == DealState::Released
    }
}

impl KoriDealEscrow {
    fn set_state(env: &Env, state: DealState) {
        env.storage().instance().set(&DataKey::State, &state);
    }

    fn activate_refunds(env: &Env) -> Result<RefundReason, Error> {
        let state = Self::state(env.clone());
        if state == DealState::Refundable || state == DealState::Refunded {
            return Self::refund_reason(env.clone()).ok_or(Error::InvalidState);
        }
        if state == DealState::Released {
            return Err(Error::InvalidState);
        }

        let config = Self::config(env.clone());
        let now = env.ledger().timestamp();
        let reason = match state {
            DealState::FundingOpen if now >= config.funding_deadline => {
                RefundReason::FundingTargetMissed
            }
            DealState::Funded | DealState::EvidenceSubmitted | DealState::Approved
                if now >= config.release_deadline =>
            {
                RefundReason::ReleaseDeadlineMissed
            }
            _ => return Err(Error::RefundNotAvailable),
        };

        let total_funded = Self::total_funded(env.clone());
        env.storage()
            .instance()
            .set(&DataKey::RefundReason, &reason);
        Self::set_state(
            env,
            if total_funded == 0 {
                DealState::Refunded
            } else {
                DealState::Refundable
            },
        );
        RefundsOpened {
            reason,
            total_funded,
            opened_at_timestamp: now,
            schema_version: EVENT_SCHEMA_VERSION,
        }
        .publish(env);
        if total_funded == 0 {
            RefundsCompleted {
                total_refunded: 0,
                completed_at_timestamp: now,
                schema_version: EVENT_SCHEMA_VERSION,
            }
            .publish(env);
        }
        Ok(reason)
    }
}

#[cfg(test)]
mod test;
