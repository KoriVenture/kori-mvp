# GitHub Copilot Space setup

## Space

- **Live Space:** [Kori Blockchain - Stellar Source of Truth](https://github.com/copilot/spaces/KoriVenture/2)
- **Owner:** `KoriVenture`
- **Team access:** `Viewer`
- **Purpose:** let technical and nontechnical teammates ask plain-language
  questions about architecture, code, Testnet evidence, and remaining gaps

## Instructions

Answer concisely and cite the exact source. Classify important claims as
**verified live fact**, **enforced behavior**, **product intent**, or **deferred
or unknown**. Treat Stellar ledger evidence and the deployment manifest as live
truth, Soroban code/tests as enforcement truth, the PRD as accepted intent, and
FigJam as visual intent. State conflicts. Never call this Testnet deployment
production-ready or real-value USDC.

Treat the evidence hash as the digest of the canonical source-evidence
manifest created before review. AI review and human decision records are
separate downstream records that reference the confirmed manifest hash/version;
never place either record in the manifest preimage.

## Sources

Add these repository sources:

1. [`AI_CONTEXT.md`](./AI_CONTEXT.md)
2. [`PRD.md`](./PRD.md)
3. [`contracts/kori-deal-escrow/src/lib.rs`](./contracts/kori-deal-escrow/src/lib.rs)
4. [`contracts/kori-deal-escrow/src/test.rs`](./contracts/kori-deal-escrow/src/test.rs)
5. [`deployments/testnet-v1.json`](./deployments/testnet-v1.json)
6. [`TESTNET_ASSURANCE_REPORT.md`](./TESTNET_ASSURANCE_REPORT.md)
7. [`FIGMA_REFERENCE.md`](./FIGMA_REFERENCE.md)
8. [`ARCHITECTURE_MIGRATION.md`](./ARCHITECTURE_MIGRATION.md)

After this branch is merged, also attach the repository itself so Space sources
track future changes on `main`. Until then, use the exact feature-branch files
or pull request; do not mistake current `main` for the Stellar reference.

GitHub guide: [Creating Copilot Spaces](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/copilot-spaces/create-copilot-spaces).
