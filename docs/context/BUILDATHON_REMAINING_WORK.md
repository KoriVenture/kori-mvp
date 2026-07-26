# Kori MVP - Buildathon Remaining Work

Last updated: 2026-07-23
Repository: `KoriVenture/kori-mvp`
Local path: `/Users/liobrasil/Desktop/ Kori project/kori-mvp`

## Purpose

This document is a handoff brief for another agent or developer. It summarizes what remains to build in the GitHub MVP project using the latest project context gathered from Notion, local docs, and the current repository state.

The goal is not to build a production financial platform. The goal is to deliver a credible buildathon demonstrator:

> Investor deposits test funds, startup submits milestone evidence, AI recommends, human verifier decides, Safe approves, and the contract releases test funds.

Architecture image: [Simplified MVP architecture](assets/kori-simplified-mvp-architecture.png)

## Meeting Alignment - 2026-07-23

The team agreed to keep the buildathon scope deliberately narrow:

- The user starts on the Kori app, then selects the investor profile.
- The investor joins one default demo deal.
- The demo uses one startup, one milestone, and one full release.
- Milestone evidence, AI review, and human verification belong to the startup evidence step.
- Safe is the authorized release caller, not the recipient of funds.
- Funds stay in `KoriEscrow` until Safe calls `release()`, then escrow pays the startup.
- Legal structure, real fiat flows, KYC/KYB, custody, and on/off-ramp design are deferred.

The immediate delivery risk is the frontend workflow and demo narrative. The blockchain layer should remain small and deterministic.

## Current Deadlines

- Pre-sprint window: 2026-07-18 to 2026-07-26.
- Core on-chain flow should be working before: 2026-07-27.
- Main sprint window: 2026-07-27 to 2026-08-16.
- Final submission, review, and live demo deadline: 2026-08-16.

As of 2026-07-23, the repository is behind the ideal pre-sprint roadmap. The immediate priority is to get the smallest possible working on-chain demo.

## Current Repository State

The repository currently has a strong scaffold but not the working product flow.

Implemented:

- pnpm workspace and Turborepo structure.
- Next.js app under `apps/web`.
- Shared UI package under `packages/ui`.
- Empty/scaffolded packages for domain, db, ai, web3, observability, and config.
- Hardhat project under `packages/contracts`.
- Sample `Counter.sol` contract and sample tests.
- Dependencies for wagmi, viem, Safe, Supabase, SIWE, Sentry, PDF.js, Hardhat, and OpenZeppelin.

Not implemented:

- `MockUSDC` contract.
- `KoriEscrow` contract.
- Contract tests for the Kori escrow flow.
- Sepolia deployment script for the Kori contracts.
- Wallet connect UI.
- MockUSDC balance, approve, and deposit UI.
- Milestone evidence submission UI.
- AI evidence review.
- Human verifier decision flow.
- Safe transaction flow.
- End-to-end demo state/timeline.
- Environment variable examples.

## Product Boundary

This MVP is explicitly non-production.

In scope:

- Testnet only.
- MockUSDC only.
- One demo deal.
- One milestone.
- One full release.
- AI advisory review.
- Human verifier approval.
- Safe/multisig approval before release.
- On-chain transparency for deposit/release events.

Out of scope:

- Real KYC/KYB.
- Real AML.
- Real SPV legal structure.
- Real USD, real USDC, or fiat on/off-ramp automation.
- Custody or management of real funds.
- Tokenized securities or investor ownership rights.
- CCTP or cross-chain settlement.
- Multi-deal marketplace.
- Multi-milestone production workflow.
- Full investor, startup, and fund-manager dashboards.
- Cap table.
- Post-investment reporting.

Legal/compliance remains post-MVP. Once capital is available, Kori should onboard legal counsel to define the investment product, SPV/vehicle, regulated actors, custody model, cash accounts, authoritative ownership ledger, disclosures, KYC/KYB, AML, disputes, and refund rules.

## Target Demo Flow

The minimum demo should prove this sequence:

1. User opens the Kori app.
2. User selects the investor profile.
3. Investor sees the default demo deal.
4. Investor connects MetaMask.
5. Investor sees MockUSDC balance.
6. Investor approves `KoriEscrow` to spend MockUSDC.
7. Investor deposits MockUSDC into `KoriEscrow`.
8. App shows funds locked in escrow.
9. Startup submits milestone evidence.
10. AI reads evidence and returns a structured recommendation.
11. Human verifier approves or rejects.
12. If approved, `setMilestone(true)` is recorded.
13. Safe approves the release.
14. Safe calls `release()` on `KoriEscrow`.
15. `KoriEscrow` transfers MockUSDC to the startup wallet.
16. UI shows final status, transaction hash, and balances.

## Priority Order

### P0 - Must finish first

Build the on-chain backbone:

- `MockUSDC.sol`.
- `KoriEscrow.sol`.
- Contract tests.
- Local deploy/test flow.

This is the critical path. Without it, the demo is only a UI mock.

### P1 - Must finish for pre-sprint demo

Build the minimal frontend and Web3 wiring:

- Connect wallet.
- Check Sepolia.
- Read MockUSDC balance.
- Approve escrow.
- Deposit into escrow.
- Read escrow state.
- Show milestone state.
- Show release eligibility.

### P2 - Must finish for credible buildathon demo

Add milestone review and release controls:

- Startup evidence submission UI.
- Mock or real AI evidence recommendation.
- Human verifier approval UI.
- Safe release proposal/execution or a clear manual Safe fallback.
- Transaction timeline.

### P3 - Polish for final submission

- Demo data.
- Error states.
- UX polish.
- Demo runbook.
- Fallback recording.
- Responsible AI and compliance statement.

## Smart Contract Requirements

### `MockUSDC.sol`

Purpose:

- Test ERC-20 token that behaves like USDC for the demo.

Required:

- ERC-20.
- 6 decimals.
- Controlled minting for demo wallets.
- No real value or production claims.

Suggested implementation:

- Use OpenZeppelin ERC20.
- Add `decimals() returns 6`.
- Add owner/admin mint or simple public mint if speed matters. Prefer owner mint for cleaner demo framing.

### `KoriEscrow.sol`

Purpose:

- Hold MockUSDC deposits.
- Track milestone approval.
- Allow release only after milestone approval and only when called by Safe.

Suggested state:

```solidity
IERC20 public immutable token;
address public immutable safe;
address public immutable startup;
address public milestoneVerifier;

bool public milestoneReached;
bool public released;
uint256 public totalDeposited;

mapping(address => uint256) public deposits;
```

Suggested events:

```solidity
event Deposited(address indexed investor, uint256 amount);
event MilestoneUpdated(bool reached, address indexed verifier);
event FundsReleased(address indexed startup, uint256 amount);
event Refunded(address indexed investor, uint256 amount);
```

Required functions:

```solidity
deposit(uint256 amount)
setMilestone(bool reached)
release()
```

Optional only if time permits:

```solidity
refund()
```

Recommended rules:

- `deposit(0)` reverts.
- `deposit()` transfers MockUSDC from investor to escrow.
- `setMilestone()` can only be called by `milestoneVerifier`.
- `setMilestone(false)` is allowed before release.
- `release()` can only be called by `safe`.
- `release()` requires `milestoneReached == true`.
- `release()` requires `released == false`.
- `release()` transfers the full escrow balance to `startup`.
- `release()` sets `released = true` before transfer.
- No personal data or document contents are written on-chain.

## Required Contract Tests

Create tests for:

- Valid MockUSDC mint.
- `deposit()` succeeds after approval.
- `deposit(0)` reverts.
- Deposit without allowance reverts.
- Deposit updates investor deposit and total deposited.
- Authorized verifier can call `setMilestone(true)`.
- Unauthorized wallet cannot call `setMilestone`.
- `release()` before milestone reverts.
- Non-Safe caller cannot call `release()`.
- Safe caller can release after milestone.
- Startup receives full balance.
- Double release reverts.
- `setMilestone(false)` works before release if implemented.
- Refund behavior if refund is included.

Use Hardhat 3 patterns already present in `packages/contracts`. The package has local Hardhat skill instructions in `packages/contracts/AGENTS.md`.

## Frontend Requirements

Replace the current basic page with a compact demo console. Avoid building full dashboards now.

Recommended sections:

- Profile selection.
- Default deal overview.
- Network and wallet status.
- Investor deposit panel.
- Escrow state panel.
- Milestone evidence panel.
- AI recommendation panel.
- Human verifier panel.
- Safe release panel.
- Transaction timeline.

Minimum UI states:

- Wallet disconnected.
- Wrong network.
- No MockUSDC balance.
- Approval needed.
- Deposit pending.
- Deposit confirmed.
- Milestone pending.
- AI review pending/completed.
- Human approved/rejected.
- Safe release pending.
- Released.
- Error.

The UI can use mocked data for startup/evidence while contracts are made real. Do not block the on-chain path on a complete backend.

## Web3 Package Work

`packages/web3` should eventually contain:

- Chain config for Sepolia.
- Contract addresses by environment.
- MockUSDC ABI export.
- KoriEscrow ABI export.
- viem clients or helpers.
- wagmi config.
- Safe helpers if Safe is integrated in-app.

For speed, it is acceptable to keep some wiring in `apps/web` first, then move stable helpers into `packages/web3` once the flow works.

## AI Package Work

The AI feature should be advisory only.

Minimum useful implementation:

- Accept milestone criteria and submitted evidence text.
- Return structured JSON:

```json
{
  "recommendation": "approve | reject | request_more_information",
  "confidence": 0.0,
  "summary": "...",
  "evidence_used": ["..."],
  "missing_information": ["..."],
  "risks": ["..."]
}
```

For the first build, use deterministic mock output if the real provider is not ready. The demo must say clearly whether the AI result is live or pre-generated.

Required guardrail:

- AI never signs.
- AI never calls `setMilestone`.
- AI never calls `release`.
- AI never has private keys.

## Data and Storage Work

For the fastest demo:

- Store demo state in local React state or a simple route handler.
- Store evidence metadata only.
- Use synthetic documents.

If Supabase is introduced:

- Add `.env.example`.
- Add basic client setup.
- Add schema/migration notes.
- Keep RLS and storage private as post-MVP hardening unless time permits.

## Safe Integration Strategy

Preferred:

- Create a Sepolia Safe.
- Set 2-of-3 owners.
- Configure `KoriEscrow.safe` to the Safe address.
- Propose and execute `release()` from Safe.
- Show the Safe transaction in the UI or open Safe externally.

Fallback:

- Keep `release()` restricted to the configured Safe address in contract design.
- For demo, manually execute through Safe web app or show a prepared transaction/recorded flow.
- If Safe blocks implementation, do not weaken the product claim. Present Safe as an operational step and keep the contract interface ready for it.

Do not change the architecture to AI-only or admin-only release just to move faster.

## Environment Variables

Add `.env.example` once the implementation starts.

Likely variables:

```text
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_MOCK_USDC_ADDRESS=
NEXT_PUBLIC_KORI_ESCROW_ADDRESS=
NEXT_PUBLIC_SAFE_ADDRESS=
NEXT_PUBLIC_STARTUP_WALLET=
NEXT_PUBLIC_MILESTONE_VERIFIER=

SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
```

Do not commit real private keys or service credentials.

## Suggested File Plan

Contracts:

- `packages/contracts/contracts/MockUSDC.sol`
- `packages/contracts/contracts/KoriEscrow.sol`
- `packages/contracts/contracts/KoriEscrow.t.sol`
- `packages/contracts/test/KoriEscrow.ts`
- `packages/contracts/ignition/modules/KoriEscrow.ts`
- `packages/contracts/scripts/README.md` or a deployment runbook

Frontend:

- `apps/web/app/page.tsx`
- `apps/web/app/layout.tsx`
- `apps/web/lib/web3.ts`
- `apps/web/lib/contracts.ts`
- `apps/web/components/demo/*`

Shared:

- `packages/web3/src/*`
- `packages/ai/src/*`
- `packages/domain/src/*`

Docs:

- `docs/context/CURRENT_STATUS.md`
- `docs/context/ARCHITECTURE_DECISIONS.md`
- `docs/context/BUILDATHON_REMAINING_WORK.md`
- `docs/demo-runbook.md`

## Recommended Next Task for Another Agent

Start with this exact task:

> Implement `MockUSDC.sol` and `KoriEscrow.sol` with tests in `packages/contracts`. Remove or ignore the sample `Counter` contract only after the Kori tests pass. The first success condition is a local Hardhat test proving: investor deposits MockUSDC, verifier approves milestone, only Safe can release, startup receives funds, double release fails.

Acceptance criteria:

- `pnpm --filter @kori/contracts compile` passes.
- `pnpm --filter @kori/contracts test` passes.
- Tests cover the required release security invariants.
- README or status docs explain the contract flow.

## Known Verification Issue

During the latest inspection, verification commands attempted to install dependencies in the fresh clone. The package registry was very slow and the install was interrupted. No tracked files changed.

Before coding, run:

```bash
pnpm install
pnpm --filter @kori/contracts compile
pnpm --filter @kori/contracts test
pnpm --filter @kori/web typecheck
```

If install is slow, run one command at a time and avoid launching multiple pnpm commands in parallel.

## Current Judgment

The repo has the right scaffold, but the project is not yet on schedule for the July 27 sprint start. The team should stop debating chain choice and start implementing the EVM testnet flow immediately.

Use EVM/Sepolia for speed. Do not add CCTP, Stellar, Hedera, or real fiat conversion to this MVP. Those are post-demo architecture questions.
