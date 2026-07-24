# UI Migration Strategy

## Reference and intent

The historical Kori prototype is the factual visual and workflow reference. It is not the technical architecture to copy.

The sibling repository remains read-only at `main@f95f986`. Historical root HTML is canonical for structure and copy; production and embedded CSS define visual values; runtime JavaScript defines behavior. `ANALYSE_COMPLETE_KORI_NEXTJS.md` supplies a secondary audited mapping. The separately referenced `AUDIT_UI_UX_KORI.md` was not present in the inspected checkout.

Realistic fictional data is intentional because the MVP must tell a credible demonstration story without presenting live financial activity. Fictional data must be internally consistent, visibly demonstrative, and never described as real-time unless it is.

## Roles to preserve

- Fund Manager
- Angel Investor
- Startup Founder

The current monorepo uses the product-facing labels Investor, Startup, and Fund Manager. Future fixture/content mapping must preserve the intent of the three historical journeys without importing their page implementation.

## Strengths to preserve

- restrained obsidian, gold, and teal identity;
- editorial headings paired with compact interface labels;
- thin borders, dense financial information, and restrained depth;
- milestone and escrow narrative;
- distinct role journeys;
- visible progress and status;
- realistic fictional company/deal context.

## Defects not to copy

- undefined CSS classes and variables;
- conflicting production and preview design systems;
- insufficient muted-text and gold-button contrast;
- interactions that look active but do nothing;
- inconsistent or misleading financial totals;
- simulated “real-time” claims;
- list, modal, form, and simulator states that do not match behavior;
- privacy-sensitive dates or evidence exposed without a policy;
- fixed dimensions that truncate long copy;
- color-only statuses and incomplete keyboard/focus behavior;
- duplicated image families and unreferenced assets.

## Migration principles

1. Recreate intent through semantic tokens and shared primitives.
2. Migrate one shell or journey at a time.
3. Separate stable data/status codes from translated labels.
4. Keep fictional fixtures centralized and internally consistent.
5. Mark unavailable actions disabled or demonstrative.
6. Add integration behavior only in a separately approved task.
7. Verify English, French, and Spanish at desktop, tablet, and narrow mobile widths.

## Priorities

### P0 — Foundation and functional truth — implemented

- localized routes and message ownership;
- audited source tokens and semantic themes;
- typography, spacing, focus, and reduced-motion rules;
- shared component variants;
- truthful local-only actions and deferred integrations;
- audit and architecture documentation.

### P1 — Public layout and shared dashboard shell — implemented

- localized public header/navigation;
- reusable dashboard frame and role navigation;
- consistent page headers, breadcrumbs, status areas, and mobile behavior;
- centralized SolarGrid demonstration fixture;
- no backend or wallet integration.

### P2 — Role journeys and complex UI patterns — implemented as demonstrations

- Investor, Startup, and Fund Manager views;
- tables, filters, milestones, evidence lists, and financial summaries;
- accessible local dialogs, evidence file inputs, tables, and milestone states;
- consistent fictional data across roles and locales.

### P3 — Validation — implemented for the reconstructed frontend

- responsive browser coverage at six reference widths;
- keyboard/dialog/reduced-motion smoke checks;
- interaction tests and deterministic screenshot records;
- final client/designer review remains pending;
- integrations, security hardening, persistence, and observability remain separately scoped.

## Exit criteria for a migrated surface

A surface is migrated only when it:

- uses shared semantic tokens and components;
- has matching English, French, and Spanish keys;
- has truthful available/deferred states;
- works without truncation at the target widths;
- has visible focus and non-color status labels;
- passes tests, type checking, and build;
- is represented in the audit-fidelity matrix.
