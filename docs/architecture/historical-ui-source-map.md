# Historical UI Source Map

Historical reference: read-only sibling checkout `../Kori` at `main@f95f986`.

| Current route                            | Canonical historical HTML            | Style/behavior sources                                                                       | Message namespace                     | Current implementation                                        |
| ---------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| `/[locale]`                              | `index.html`                         | `tokens.css`, `base.css`, `components.css`, `landing.css`, `theme.js`, `nav.js`, `reveal.js` | `landing`, `navigation`, `common`     | `apps/web/app/[locale]/page.tsx`, marketing components        |
| `/[locale]/stories`                      | `success-stories.html`               | Embedded CSS, theme/navigation scripts                                                       | `stories`, `navigation`, `common`     | `apps/web/app/[locale]/stories/page.tsx`, `StoryCaseStudy`    |
| `/[locale]/capital-map`                  | `capital-map.html`                   | Embedded CSS, theme/navigation scripts                                                       | `capital-map`, `navigation`, `common` | `apps/web/app/[locale]/capital-map/page.tsx`                  |
| `/[locale]/dashboard/fund-manager/**`    | `fund-manager-dashboard.html`        | `tokens.css`, `base.css`, `components.css`, `dashboard.css`                                  | `fund-manager`, `dashboard-common`    | `DashboardShell`, `DashboardPage`, five routes                |
| `/[locale]/dashboard/angel-investor/**`  | `angel-investor-dashboard.html`      | Same dashboard runtime CSS                                                                   | `angel-investor`, `dashboard-common`  | `DashboardShell`, `DashboardPage`, five routes                |
| `/[locale]/dashboard/startup-founder/**` | `startup-founder-dashboard.html`     | Same dashboard runtime CSS                                                                   | `startup-founder`, `dashboard-common` | `DashboardShell`, `DashboardPage`, six routes                 |
| `/[locale]/simulator`                    | `kori_smart_contract_simulator.html` | Embedded simulator CSS and script                                                            | `simulator`, `common`                 | `apps/web/app/[locale]/simulator/page.tsx`, `SimulatorClient` |

## Shared assets and components

- Historical transparent lockups map to `apps/web/public/brand/kori-lockup-dark.svg` and `kori-lockup-light.svg`.
- Shared tokens and runtime aliases map to `packages/ui/src/styles/globals.css`.
- Reusable historical card, status, progress, and panel treatments map to `packages/ui/src/components` and `packages/ui/src/patterns`.
- Theme, locale, navigation, reveal, dialog, and simulator behaviors map to focused Client Components under `apps/web/components`.

## Historical redirects

| Historical URL                        | Canonical target                      |
| ------------------------------------- | ------------------------------------- |
| `/index.html`                         | `/[locale]`                           |
| `/success-stories.html`               | `/[locale]/stories`                   |
| `/capital-map.html`                   | `/[locale]/capital-map`               |
| `/fund-manager-dashboard.html`        | `/[locale]/dashboard/fund-manager`    |
| `/angel-investor-dashboard.html`      | `/[locale]/dashboard/angel-investor`  |
| `/startup-founder-dashboard.html`     | `/[locale]/dashboard/startup-founder` |
| `/kori_smart_contract_simulator.html` | `/[locale]/simulator`                 |

## Corrected deviations

- Dashboard tabs became addressable App Router pages.
- Inert or misleading actions became accessible local-demo dialogs or disabled controls.
- Missing file inputs and dialog keyboard behavior were restored with shared primitives.
- Stable business codes are translated only at the application boundary.
- Capital Map remains map-less because the canonical DOM contains country tables rather than a rendered map.
- Reduced-motion behavior exposes content without animation.
