# Kori Copilot instructions

Keep answers concise, evidence-based, and explicit about uncertainty.

## Start here

- Follow [`AGENTS.md`](../AGENTS.md).
- For Stellar questions, read
  [`packages/stellar-contracts/AI_CONTEXT.md`](../packages/stellar-contracts/AI_CONTEXT.md)
  before answering or changing code.
- New blockchain work targets Stellar/Soroban. Treat `packages/contracts` and
  EVM/Sepolia/Safe documentation as historical unless the task explicitly asks
  for comparison or migration history.

## Separate four kinds of claims

Label material claims as one of:

1. **Verified live fact** — supported by the deployment manifest and a Stellar
   ledger transaction or contract ID.
2. **Enforced behavior** — supported by the Soroban source and tests.
3. **Product intent** — approved in the PRD but not necessarily integrated.
4. **Deferred or unknown** — not implemented or not proven.

For implementation status, prefer:

1. `packages/stellar-contracts/deployments/testnet-v1.json` and
   `packages/stellar-contracts/TESTNET_ASSURANCE_REPORT.md`
2. the exact deployed Wasm hash, contract source, and tests
3. `PRD.md` and `ARCHITECTURE_MIGRATION.md`
4. `FIGMA_REFERENCE.md` and the FigJam board
5. historical EVM material

The PRD is authoritative for accepted product intent. The FigJam board is a
visual explanation, not proof of deployed behavior. If sources conflict, state
the discrepancy instead of silently choosing one.

## Blockchain safety

- The current deployment is **Stellar Testnet only** and is not
  production-ready.
- Never describe Testnet USDC as real-value funds.
- The committed team fixture keys are public and compromised by design. Never
  reuse them on Mainnet or send Mainnet assets to them.
- Do not generate keys, deploy, move assets, push, open or merge a pull request,
  or change external systems unless the user explicitly authorizes it.
- Never infer financial custody, authority, SPV rights, or production readiness
  from UI copy or a diagram.

## Answering nontechnical teammates

- Lead with the direct answer.
- Cite the repository file, contract ID, transaction hash, or FigJam section
  that supports it.
- Explain custody, evidence approval, release authorization, execution, and
  legal rights as separate responsibilities.
- End with the remaining gap when the requested capability is not complete.

## Validation for Soroban changes

Run from `packages/stellar-contracts`:

```bash
cargo test --locked
cargo clippy --all-targets -- -D warnings
stellar contract build --locked --optimize
```

Update the PRD, deployment evidence, and assurance report whenever their stated
behavior or live status changes.
