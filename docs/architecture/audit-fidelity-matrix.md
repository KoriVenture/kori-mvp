# Audit Fidelity Matrix

This matrix records source-based corrected fidelity against the historical checkout at `main@f95f986`. The deployed reference was unavailable, and the referenced `AUDIT_UI_UX_KORI.md` was absent, so “implemented” does not mean client-approved pixel parity.

## Visual system

| Requirement            | Canonical source/value                                        | New token/component                                 | Status      | Verification                       | Deliberate deviation or open decision               |
| ---------------------- | ------------------------------------------------------------- | --------------------------------------------------- | ----------- | ---------------------------------- | --------------------------------------------------- |
| Dark background strata | `#0D0D0B`, `#1A1916`, `#222220`, `#2A2824`, `#3A3830`         | `--kori-obsidian`, panel/surface/rim tokens         | Implemented | CSS contract tests                 | None                                                |
| Gold family            | `#C9913A`, `#E8B86A`, `#5A3A0A`                               | source tokens and semantic primary/accent/warning   | Implemented | CSS tests                          | Dark foreground on gold improves contrast           |
| Teal family            | `#1D6E52`, `#2DA076`, `#5DD4A4`, `#0B3828`                    | source tokens and semantic success                  | Implemented | CSS tests, status/progress renders | Teal remains semantic rather than decorative        |
| Primary text           | `#F5F2EC`, `#C4C0B8`                                          | foreground/card foreground                          | Implemented | CSS tests                          | None                                                |
| Muted text             | historical `#8A7A60`, `#6A6058`                               | accessible aliases `#B8A582`, `#94897A`             | Implemented | CSS tests                          | Raised contrast; formal audit pending               |
| Light theme            | audited light panels, borders, gold, teal                     | semantic light aliases                              | Implemented | CSS tests                          | White card alias retained where the runtime used it |
| Typography roles       | Cormorant Garamond, Jost, Carlito, mono                       | `fonts.ts`, editorial/interface/body/data variables | Implemented | build downloads exact families     | OS rasterization may vary                           |
| Type scale             | 48–88 display, 34–52 page, 24–32 section, compact labels/data | `text-kori-*` utilities                             | Implemented | CSS tests, source review           | Fluid `clamp()` preserves responsive intent         |
| Spacing                | 60/32/24/20 px gutters; 120/80/60 px section rhythm           | `--kori-page-gutter`, `--kori-section-space`        | Implemented | CSS breakpoint tests               | Historical breakpoints mapped to Tailwind families  |
| Borders and radii      | 1 px hairlines; small 2–6 px radii                            | shared primitives/patterns                          | Implemented | UI tests                           | No generic large-radius/shadow system               |
| Reveal motion          | 30 px, 800 ms; 100/250/400/550 ms delays                      | `RevealOnScroll`, `.reveal-item`                    | Implemented | CSS tests, source review           | Reduced motion removes transforms                   |
| Hero motion            | 6 s expanding rings; 2 s scroll line                          | shared global keyframes                             | Implemented | source review                      | Decorative motion hidden on narrow screens          |
| Brand lockups          | validated dark/light transparent SVGs                         | `KoriLogo`, two public SVGs                         | Implemented | file hashes, source review         | Duplicate unused historical assets not copied       |

## Behavior and architecture

| Requirement          | Canonical source/behavior       | New implementation                            | Status              | Verification                           | Deliberate deviation or open decision                          |
| -------------------- | ------------------------------- | --------------------------------------------- | ------------------- | -------------------------------------- | -------------------------------------------------------------- |
| Explicit locale URLs | product brief                   | `/[locale]` App Router tree                   | Implemented         | locale and route tests                 | English remains provisional fallback                           |
| Root negotiation     | browser/cookie/en fallback      | `proxy.ts`                                    | Implemented         | proxy unit tests                       | None                                                           |
| Historical URLs      | historical root files           | seven locale-preserving redirects             | Implemented         | proxy unit tests                       | `.html` URLs are not duplicated pages                          |
| Theme                | `theme.js`                      | one next-themes provider, `data-theme`        | Implemented         | provider and CSS tests                 | System preference supported                                    |
| Language switch      | historical menu intent          | Base UI DropdownMenu and localized navigation | Implemented         | locale-path unit tests                 | Required DropdownMenu groups restore valid primitive structure |
| Public navigation    | `index.html`                    | localized header, mobile menu, anchors        | Implemented         | Not automated                          | Semantic links replace clickable containers                    |
| Dashboard navigation | three dashboard HTML files      | desktop sidebar plus mobile Sheet             | Implemented         | route configuration tests              | Tab state became addressable routes                            |
| Dialogs and forms    | historical modal/inert controls | Base UI Dialog, labels, file inputs           | Implemented locally | Not automated                          | No persistence or remote success claim                         |
| Waitlist             | historical form                 | local-only validated interaction              | Implemented locally | component tests                        | No submission endpoint                                         |
| Simulator            | historical embedded script      | pure model plus local client state            | Implemented locally | model and component tests              | No contract deployment or wallet                               |
| Stable status codes  | architecture requirement        | codes in fixtures, translated at app boundary | Implemented         | key parity, typecheck, unit tests       | Native-speaker review pending                                  |
| Global CSS ownership | monorepo requirement            | `packages/ui/src/styles/globals.css`          | Implemented         | import/style tests                     | `apps/web/app/globals.css` remains a bridge                    |

## Canonical page and route coverage

| Historical page / current route              | Implementation status                   | Test or screenshot                     | Open decision                                     |
| -------------------------------------------- | --------------------------------------- | -------------------------------------- | ------------------------------------------------- |
| `index.html` → `/[locale]`                   | Implemented, eleven blocks              | content and locale tests               | Deployed pixel comparison unavailable             |
| `success-stories.html` → `/[locale]/stories` | Implemented                             | public-content unit tests               | Native-speaker editorial review                   |
| `capital-map.html` → `/[locale]/capital-map` | Implemented in canonical map-less state | public-content unit tests               | No map invented                                   |
| `fund-manager-dashboard.html` → overview     | Implemented                             | route configuration tests              | Backend actions deferred                          |
| Fund Manager `/spvs`                         | Implemented                             | route configuration tests              | Sorting/filtering not required for static fixture |
| Fund Manager `/pipeline`                     | Implemented                             | route configuration tests              | Backend actions deferred                          |
| Fund Manager `/milestones`                   | Implemented                             | route configuration tests              | Evidence service deferred                         |
| Fund Manager `/investors`                    | Implemented                             | route configuration tests              | Invitation persistence deferred                   |
| `angel-investor-dashboard.html` → overview   | Implemented                             | route configuration tests              | Wallet/investment flow deferred                   |
| Angel Investor `/deals`                      | Implemented                             | route and localization tests           | Commitments remain local demos                    |
| Angel Investor `/portfolio`                  | Implemented                             | route configuration tests              | Live positions deferred                           |
| Angel Investor `/milestones`                 | Implemented                             | route configuration tests              | Evidence service deferred                         |
| Angel Investor `/transactions`               | Implemented                             | route configuration tests              | Hashes are labeled demonstrations                 |
| `startup-founder-dashboard.html` → overview  | Implemented                             | route configuration tests              | Persistence deferred                              |
| Startup Founder `/raise`                     | Implemented                             | route configuration tests              | Real fundraising deferred                         |
| Startup Founder `/investors`                 | Implemented                             | route configuration tests              | Agreements/auth deferred                          |
| Startup Founder `/milestones`                | Implemented                             | route and localization tests           | Uploaded files remain local                       |
| Startup Founder `/disbursements`             | Implemented                             | route configuration tests              | No funds move                                     |
| Startup Founder `/documents`                 | Implemented                             | route configuration tests              | Storage/privacy policy deferred                   |
| Simulator `/[locale]/simulator`              | Implemented                             | model and component tests              | Contract/Web3 wiring deferred                     |

## Validation scope

- Vitest covers locale contracts, message parity, redirects, components, themes, and simulator calculations.
- Production build generates 64 pages.
- Client/designer review, deployed-reference comparison, native-speaker review, and a formal accessibility audit remain pending.
