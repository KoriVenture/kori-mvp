# Frontend Architecture

This directory records the verified architecture of the Kori frontend reconstruction. The implementation is a multilingual, local-only demonstration; it does not imply backend, wallet, Safe, AI, or real-fund integration.

## Documents

- [Technology baseline](technology-baseline.md) — installed stack, package boundaries, and command ownership.
- [Internationalization](internationalization.md) — locale routing, messages, formatting, and stable-code boundaries.
- [UI migration strategy](ui-migration-strategy.md) — corrected-fidelity principles and completed migration phases.
- [UI component strategy](ui-component-strategy.md) — primitive, shared-pattern, and application-composition ownership.
- [Design system](design-system.md) — Kori palette, semantic tokens, typography, spacing, motion, and assets.
- [Historical UI source map](historical-ui-source-map.md) — canonical source-to-route/component mapping.
- [Audit fidelity matrix](audit-fidelity-matrix.md) — implementation evidence, deviations, and open decisions.

## Runtime boundaries

```text
packages/i18n  -> locale facts and Intl definitions
packages/ui    -> shared primitives, Kori patterns, global tokens/styles
apps/web       -> Next.js routes, next-intl, fixtures, interactions, metadata
```

Global CSS remains in `packages/ui/src/styles/globals.css`; `apps/web/app/globals.css` is an import-only bridge. Server Components own static localized pages and fixtures. Focused Client Components own theme, language, mobile navigation, reveal behavior, dialogs, waitlist state, and simulator state.

## Source-of-truth order

1. Historical root HTML.
2. Historical runtime CSS and page-embedded CSS.
3. Historical runtime JavaScript.
4. Validated Kori SVG assets.
5. `ANALYSE_COMPLETE_KORI_NEXTJS.md`.
6. Secondary previews and UI kits only when they do not conflict with runtime sources.

The historical checkout at `../Kori`, revision `main@f95f986`, is read-only. The referenced `AUDIT_UI_UX_KORI.md` was not present during this reconstruction.
