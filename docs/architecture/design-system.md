# Kori Design System Foundation

## Audited source

- Historical revision: `main@f95f986`
- Canonical runtime sources: historical root HTML, `../Kori/css/tokens.css`, `base.css`, `components.css`, `dashboard.css`, `landing.css`, and embedded CSS
- Secondary mapping: `../Kori/ANALYSE_COMPLETE_KORI_NEXTJS.md`
- Additional comparison sources: `../Kori/css/colors_and_type.css` and both historical UI-kit CSS files
- Implementation: `packages/ui/src/styles/globals.css`

The sibling repository is read-only. The separately referenced `AUDIT_UI_UX_KORI.md` was absent from the inspected checkout. Source colors are retained as immutable reference variables; components consume semantic tokens.

## Immutable audited source colors

| Token                          | Value     | Observed role                 |
| ------------------------------ | --------- | ----------------------------- |
| `--kori-obsidian`              | `#0D0D0B` | Dark background               |
| `--kori-panel`                 | `#1A1916` | Dark panel                    |
| `--kori-surface`               | `#222220` | Dark secondary surface        |
| `--kori-surface-elevated`      | `#2A2824` | Dark elevated/input surface   |
| `--kori-border-source`         | `#3A3830` | Dark border                   |
| `--kori-gold`                  | `#C9913A` | Primary gold                  |
| `--kori-gold-light`            | `#E8B86A` | Light gold                    |
| `--kori-gold-dark`             | `#5A3A0A` | Dark gold accent              |
| `--kori-teal`                  | `#1D6E52` | Primary teal                  |
| `--kori-teal-medium`           | `#2DA076` | Medium teal                   |
| `--kori-teal-bright`           | `#5DD4A4` | Bright teal                   |
| `--kori-teal-dark`             | `#0B3828` | Dark teal                     |
| `--kori-text-primary`          | `#F5F2EC` | Primary text/light background |
| `--kori-text-secondary`        | `#C4C0B8` | Secondary dark-theme text     |
| `--kori-text-muted-reference`  | `#8A7A60` | Historical muted reference    |
| `--kori-text-subtle-reference` | `#6A6058` | Historical subtle reference   |

## Light semantic mapping

| Semantic token                       | Value                             |
| ------------------------------------ | --------------------------------- |
| background / foreground              | `#F5F2EC` / `#0D0D0B`             |
| card / card foreground               | `#EBE7DF` / `#0D0D0B`             |
| popover / popover foreground         | `#EBE7DF` / `#0D0D0B`             |
| primary / primary foreground         | `#B07E2F` / `#0D0D0B`             |
| secondary / secondary foreground     | `#E2DED6` / `#3A3830`             |
| muted / muted foreground             | `#EBE7DF` / `#5C5347`             |
| accent / accent foreground           | `#F0E4D0` / `#0D0D0B`             |
| success / success foreground         | `#1D6E52` / `#F5F2EC`             |
| warning / warning foreground         | `#D4A24E` / `#0D0D0B`             |
| destructive / destructive foreground | `#B83C3C` / `#F5F2EC`             |
| border / input / ring                | `#C4BEB4` / `#D6D0C6` / `#1D6E52` |

## Dark semantic mapping

| Semantic token                       | Value                             |
| ------------------------------------ | --------------------------------- |
| background / foreground              | `#0D0D0B` / `#F5F2EC`             |
| card / card foreground               | `#1A1916` / `#F5F2EC`             |
| popover / popover foreground         | `#1A1916` / `#F5F2EC`             |
| primary / primary foreground         | `#C9913A` / `#0D0D0B`             |
| secondary / secondary foreground     | `#222220` / `#F5F2EC`             |
| muted / muted foreground             | `#222220` / `#B8A582`             |
| accent / accent foreground           | `#5A3A0A` / `#F5F2EC`             |
| success / success foreground         | `#1D6E52` / `#F5F2EC`             |
| warning / warning foreground         | `#E8B86A` / `#0D0D0B`             |
| destructive / destructive foreground | `#C04848` / `#F5F2EC`             |
| border / input / ring                | `#3A3830` / `#2A2824` / `#E8B86A` |

`#B8A582` raises dark muted text from the audited production reference `#8A7A60` to preserve AA readability on dark panels. The source reference remains available and unchanged.

Gold buttons use dark text (`#0D0D0B`) instead of the historically insufficient light-on-gold treatment.

## Typography

- **Cormorant Garamond:** editorial display, page, and section headings.
- **Jost:** navigation, controls, labels, and compact interface titles.
- **Carlito:** body, descriptions, and long-form copy.
- **System monospace:** financial and technical values.

The fonts are configured in `apps/web/app/fonts.ts` and exposed through `--font-editorial`, `--font-interface`, `--font-body`, and `--font-data`.

## Layout and shape

- Page gutters: 60 px desktop, 32 px at 1024 px, 24 px at 768 px, and 20 px at 390 px.
- Section spacing: 120 px desktop, 80 px at 1024 px, and 60 px at 768 px.
- Base semantic radius: 6 px; faithful dashboard panels use 3–6 px where the historical source requires it.
- Control intent: 2 px, with normalized semantic radii for shared primitives.
- Borders: thin 1 px lines.
- Elevated shadow: a restrained normalized shadow stored in `--kori-shadow-elevated`; pending designer validation against future dense dashboard screens.

## Accessibility foundations

- visible two-pixel focus outlines with an offset;
- semantic focus-ring colors in both themes;
- reduced animation and transitions under `prefers-reduced-motion`;
- status text plus supplemental color/icon;
- flexible content heights and wrapping translated labels;
- dark muted text adjusted for contrast.

## Shared variants

- Button: default/gold, teal, secondary, outline, ghost, destructive, and link.
- Card: default, metric, editorial, interactive, dashboard, and elevated.
- Badge: generic variants plus gold, teal, pending, approved, rejected, locked, released, and warning.
- StatusBadge: stable status-to-variant mapping with a required visible label.
- Progress: default/funding, milestone, locked, and released.

## Asset inventory

| Asset family                                  | Classification                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Historical transparent dark/light lockups     | Required brand assets; validated and copied as `kori-lockup-dark.svg` and `kori-lockup-light.svg` |
| Remaining historical lockups and marks        | Design references; not copied                                                                     |
| Historical `assets/logos` and `visual assets` | Duplicate source families requiring future consolidation                                          |
| 27 unreferenced JPEG files                    | Unused historical assets; not copied                                                              |
| Other page imagery                            | Pending designer validation; not copied                                                           |

## Validation and open review

- Public navigation, dashboard navigation, tables, dialogs, and simulator states are implemented.
- Deterministic screenshots cover 1440, 1280, 1024, 768, 390, and 360 px.
- The historical deployed URL was not reachable during the reconstruction, so no automated pixel-diff baseline is claimed.
- Native-speaker review, client/designer sign-off, formal accessibility audit, and duplicate historical asset consolidation remain open.
