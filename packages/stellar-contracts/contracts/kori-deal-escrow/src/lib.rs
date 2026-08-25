#![no_std]

//! # Kori Deal Escrow
//!
//! Deal-scoped USDC escrow prototype for Kori on Stellar/Soroban.
//!
//! The contract separates two business decisions:
//!
//! 1. a community-scoped Fund Manager approves the hash of an off-chain
//!    milestone evidence package; and
//! 2. a distinct release authority authorizes the final payout.
//!
//! Investors fund the contract through the official Testnet USDC Stellar Asset
//! Contract pinned in this Wasm build.
//! After both governance conditions are satisfied, the entire escrow balance is
//! transferred atomically to the immutable startup address.
//!
//! This prototype intentionally supports one deal, one milestone and one full
//! release. It does not yet implement refunds, deadlines, partial releases,
//! upgrades or production custody controls.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, token,
    Address, BytesN, Env,
};

/// Official Circle USDC SEP-41/SAC address on Stellar Testnet.
///
/// This V1 artifact is intentionally Testnet-only. Mainnet requires a separate,
/// reviewed build with the Mainnet network identifier and USDC SAC address.
pub const TESTNET_USDC_SAC_ADDRESS: &str =
    "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

/// SHA-256(`Test SDF Network ; September 2015`).
pub const TESTNET_NETWORK_ID: [u8; 32] = [
    0xce, 0xe0, 0x30, 0x2d, 0x59, 0x84, 0x4d, 0x32, 0xbd, 0xca, 0x91, 0x5c, 0x82, 0x03, 0xdd, 0x44,
    0xb3, 0x3f, 0xbb, 0x7e, 0xdc, 0x19, 0x05, 0x1e, 0xa3, 0x7a, 0xbe, 0xdf, 0x28, 0xec, 0xd4, 0x72,
];

#[contracttype]
#[derive(Clone)]
/// Immutable role and asset configuration for one Kori deal escrow.
pub struct Config {
    /// Pinned official Testnet USDC Stellar Asset Contract address.
    pub asset: Address,
    /// Immutable payout destination for the funded startup.
    pub startup: Address,
    /// Community-scoped manager who reviews and approves milestone evidence.
    pub fund_manager: Address,
    /// Separate payout authority. This may be a native Stellar multisig account.
    pub release_authority: Address,
}

#[contracttype]
#[derive(Clone)]
/// On-chain attestation that binds approval to a specific evidence package.
pub struct MilestoneApproval {
    /// SHA-256-style 32-byte digest of the canonical off-chain evidence package.
    pub evidence_hash: BytesN<32>,
    /// Stellar ledger sequence at which the Fund Manager approved the evidence.
    pub approved_at_ledger: u32,
}

#[contracttype]
/// Internal storage keys. Configuration and aggregate state use instance storage;
/// investor-level contributions use persistent storage.
pub enum DataKey {
    Config,
    Contribution(Address),
    TotalFunded,
    Approval,
    Released,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
/// Contract errors returned when a state transition violates an escrow invariant.
pub enum Error {
    /// Funding amounts must be strictly greater than zero.
    InvalidAmount = 1,
    /// Funding, approval and release are final once the payout has executed.
    AlreadyReleased = 2,
    /// The Fund Manager has not approved a milestone evidence hash.
    MilestoneNotApproved = 3,
    /// The escrow has no asset balance to release.
    NoFunds = 4,
    /// This Testnet-only Wasm was deployed on a different Stellar network.
    UnsupportedNetwork = 5,
}

#[contractevent]
/// Emitted after an investor contribution and its accounting update succeed.
pub struct Funded {
    #[topic]
    pub investor: Address,
    pub amount: i128,
}

#[contractevent]
/// Emitted when the configured Fund Manager approves an evidence hash.
pub struct MilestoneApproved {
    #[topic]
    pub fund_manager: Address,
    pub evidence_hash: BytesN<32>,
}

#[contractevent]
/// Emitted after the full escrow balance reaches the configured startup.
pub struct Released {
    #[topic]
    pub startup: Address,
    pub amount: i128,
}

#[contract]
/// One-deal, one-milestone USDC escrow governed by separate approval authorities.
pub struct KoriDealEscrow;

#[contractimpl]
impl KoriDealEscrow {
    /// Creates one immutable deal escrow configuration.
    ///
    /// Constructor arguments are fixed atomically during deployment, preventing
    /// a third party from front-running a separate initialization call.
    ///
    /// # Parameters
    ///
    /// - `startup`: immutable payout destination.
    /// - `fund_manager`: address authorized to approve milestone evidence.
    /// - `release_authority`: address authorized to execute the payout; it may
    ///   be a native Stellar multisig account.
    pub fn __constructor(
        env: Env,
        startup: Address,
        fund_manager: Address,
        release_authority: Address,
    ) {
        if env.ledger().network_id() != BytesN::from_array(&env, &TESTNET_NETWORK_ID) {
            panic_with_error!(&env, Error::UnsupportedNetwork);
        }

        let asset = Address::from_str(&env, TESTNET_USDC_SAC_ADDRESS);
        env.storage().instance().set(
            &DataKey::Config,
            &Config {
                asset,
                startup,
                fund_manager,
                release_authority,
            },
        );
        env.storage().instance().set(&DataKey::TotalFunded, &0_i128);
        env.storage().instance().set(&DataKey::Released, &false);
    }

    /// Funds the deal with the configured Stellar asset.
    ///
    /// # Authorization
    ///
    /// `investor` must authorize the complete invocation tree, including the SAC
    /// transfer from the investor to this contract.
    ///
    /// # Effects
    ///
    /// Atomically transfers `amount`, increases the investor's cumulative
    /// contribution and increases the deal's total funded amount.
    ///
    /// # Errors
    ///
    /// Returns [`Error::InvalidAmount`] for non-positive amounts and
    /// [`Error::AlreadyReleased`] after the terminal payout.
    pub fn fund(env: Env, investor: Address, amount: i128) -> Result<(), Error> {
        investor.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if Self::is_released(env.clone()) {
            return Err(Error::AlreadyReleased);
        }

        let config = Self::config(env.clone());
        token::Client::new(&env, &config.asset).transfer(
            &investor,
            env.current_contract_address(),
            &amount,
        );

        let contribution_key = DataKey::Contribution(investor.clone());
        let prior: i128 = env
            .storage()
            .persistent()
            .get(&contribution_key)
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&contribution_key, &(prior + amount));

        let total = Self::total_funded(env.clone());
        env.storage()
            .instance()
            .set(&DataKey::TotalFunded, &(total + amount));

        Funded { investor, amount }.publish(&env);
        Ok(())
    }

    /// Approves one off-chain milestone evidence package by its 32-byte hash.
    ///
    /// # Authorization
    ///
    /// The configured Fund Manager must authorize this invocation. The evidence
    /// itself remains off-chain; the hash provides an integrity anchor.
    ///
    /// # Errors
    ///
    /// Returns [`Error::AlreadyReleased`] after the terminal payout.
    pub fn approve_milestone(env: Env, evidence_hash: BytesN<32>) -> Result<(), Error> {
        if Self::is_released(env.clone()) {
            return Err(Error::AlreadyReleased);
        }

        let config = Self::config(env.clone());
        config.fund_manager.require_auth();
        let approval = MilestoneApproval {
            evidence_hash: evidence_hash.clone(),
            approved_at_ledger: env.ledger().sequence(),
        };
        env.storage().instance().set(&DataKey::Approval, &approval);
        MilestoneApproved {
            fund_manager: config.fund_manager,
            evidence_hash,
        }
        .publish(&env);
        Ok(())
    }

    /// Releases the contract's full asset balance to the configured startup.
    ///
    /// # Authorization
    ///
    /// The configured release authority must authorize this invocation. When it
    /// is a native Stellar multisig account, Stellar enforces that account's
    /// threshold before the call is accepted.
    ///
    /// # Effects
    ///
    /// Marks the deal released and transfers the entire SAC balance atomically.
    /// Soroban rolls back both storage and asset movement if the transfer fails.
    ///
    /// # Errors
    ///
    /// Returns [`Error::MilestoneNotApproved`], [`Error::NoFunds`] or
    /// [`Error::AlreadyReleased`] when the associated invariant is not satisfied.
    pub fn release(env: Env) -> Result<i128, Error> {
        if Self::is_released(env.clone()) {
            return Err(Error::AlreadyReleased);
        }
        if !env.storage().instance().has(&DataKey::Approval) {
            return Err(Error::MilestoneNotApproved);
        }

        let config = Self::config(env.clone());
        config.release_authority.require_auth();
        let token = token::Client::new(&env, &config.asset);
        let escrow = env.current_contract_address();
        let amount = token.balance(&escrow);
        if amount <= 0 {
            return Err(Error::NoFunds);
        }

        // State is updated before the external call; Soroban rolls everything back on failure.
        env.storage().instance().set(&DataKey::Released, &true);
        token.transfer(&escrow, &config.startup, &amount);
        Released {
            startup: config.startup,
            amount,
        }
        .publish(&env);
        Ok(amount)
    }

    /// Returns the immutable asset and role configuration.
    pub fn config(env: Env) -> Config {
        env.storage().instance().get(&DataKey::Config).unwrap()
    }

    /// Returns one investor's cumulative funded amount, or zero when absent.
    pub fn contribution(env: Env, investor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(investor))
            .unwrap_or(0)
    }

    /// Returns the cumulative amount accepted by the escrow.
    pub fn total_funded(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalFunded)
            .unwrap_or(0)
    }

    /// Returns the current milestone approval, including its evidence hash.
    pub fn milestone_approval(env: Env) -> Option<MilestoneApproval> {
        env.storage().instance().get(&DataKey::Approval)
    }

    /// Returns `true` after the irreversible full payout has completed.
    pub fn is_released(env: Env) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::Released)
            .unwrap_or(false)
    }
}

#[cfg(test)]
mod test;
