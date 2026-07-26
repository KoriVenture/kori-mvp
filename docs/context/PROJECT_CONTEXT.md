# Kori MVP — Project Context

## Purpose

Kori is a demonstration platform for milestone-based startup investment and controlled fund release. It is not a production financial platform, does not handle real client funds, and does not provide regulated investment services or professional advice.

The product principle is simple: AI may analyze milestone evidence, but a human must make the decision and a multisig must control release.

## Main actors

### Investor

- Reviews investment opportunities.
- Deposits test funds.
- Tracks investment ownership and locked capital.
- Reviews milestone progress.

### Startup

- Creates or manages a project.
- Defines milestones.
- Uploads supporting evidence.
- Tracks milestone decisions and released test funds.

### Fund Manager

- Reviews projects and submitted evidence.
- Uses AI analysis as decision support.
- Makes or participates in the human decision.
- Participates in controlled approval workflows.

Operations and compliance responsibilities may exist in a future architecture, but the first application scope focuses on Investor, Startup, and Fund Manager.

## Core workflow

```text
Investor deposits test funds
  -> funds remain in escrow
  -> startup submits milestone evidence
  -> AI produces advisory analysis
  -> a human reviews and decides
  -> a Safe multisig approves release
  -> test funds are released or the request is rejected
```

## Current product state

The repository currently contains:

- localized Next.js public pages for `en`, `fr`, and `es`;
- addressable Fund Manager, Angel Investor, and Startup Founder dashboards;
- a local-only pedagogical milestone-release simulator;
- historical HTML redirects and localized public metadata;
- a corrected-fidelity Kori theme and shared UI component foundation;
- a framework-independent locale package;
- Vitest and Testing Library coverage for locale, routing, shared-style, and component behavior;
- local `MockUSDC` and `KoriEscrow` contracts with tests;
- scaffolds and dependencies for future application integrations.

The web application is not connected to the contracts, Supabase, wallets, Safe, or an AI provider. Dashboard and simulator actions use static fixtures or local in-memory state; the end-to-end financial workflow is not implemented.

## Historical visual reference

The earlier Kori prototype remains the visual and workflow reference, not the technical architecture for this monorepo. The sibling repository was inspected read-only at `main@f95f986`. Its root HTML, runtime CSS, embedded page CSS, runtime JavaScript, validated SVG assets, and `ANALYSE_COMPLETE_KORI_NEXTJS.md` supplied the reconstruction baseline.

`AUDIT_UI_UX_KORI.md` was referenced by project instructions but was not present in the inspected historical checkout. Its absence is recorded rather than silently treating another file as the audit. Production CSS under `../Kori/css` and the validated transparent lockups provided the factual source for Kori tokens, typography, spacing, and brand treatment. Known CSS regressions, inaccessible contrast, misleading interactions, and inconsistent data were corrected rather than copied.

## Language and data boundaries

The interface supports English, French, and Spanish with explicit URL prefixes. Interface language does not determine:

- country or legal jurisdiction;
- currency or blockchain token;
- time zone;
- wallet network;
- persisted domain status codes.

Those values must remain explicit. APIs, blockchain events, and domain identifiers stay language-independent; the application translates their presentation.

Architecture image: [Simplified MVP architecture](assets/kori-simplified-mvp-architecture.png)
