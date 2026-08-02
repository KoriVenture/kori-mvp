# UI Component Strategy

## Library responsibilities

- **shadcn/Base UI:** accessible interaction primitives and composition contracts.
- **Tailwind CSS:** layout, responsive behavior, spacing, and semantic token utilities.
- **CVA:** named Kori variants for shared components.
- **Lucide:** generic interface icons only; never a replacement for the Kori logo or custom brand marks.
- **next-themes:** the only source of system/light/dark theme state.
- **React Hook Form and Zod:** available for validated forms; the current local dialogs use focused native form state.
- **Sonner:** honest feedback after an actual local state transition; never a claim of remote success.
- **TanStack Table:** reserved for data-heavy tables that require sorting/filtering/column behavior; static demo tables use the shared Table primitive.
- **TanStack Query:** future server-state fetching and mutation lifecycles, not local presentation state.

No competing UI framework or second theme store should be introduced.

## Three component layers

### 1. Generic primitives

Location: `packages/ui/src/components`.

Examples: Button, Card, Badge, Progress, DropdownMenu, Dialog, Sheet, Table, and Sonner.

Rules:

- no product data;
- no next-intl or Next.js imports;
- semantic token utilities only;
- preserve primitive keyboard, focus, and ARIA behavior;
- expose CVA factories when shared variants need focused tests.

### 2. Reusable Kori patterns

Location: `packages/ui/src/patterns`.

Current examples: KoriLogo, Container, Panel, Tag, StatCard, MilestoneBar, SectionLabel, and StatusBadge.

Rules:

- compose generic primitives;
- accept stable codes and already translated labels;
- remain independent of routing, messages, and product data fetching;
- communicate status with text or accessible names, never color alone.

### 3. Application compositions

Locations: `apps/web/components` and `apps/web/app`.

Examples: LanguageSwitcher, ThemeToggle, MarketingHeader, MarketingFooter, RevealOnScroll, DashboardShell, role navigation, dashboard views, demo dialogs, waitlist interaction, and SimulatorClient.

Rules:

- may import Next.js and next-intl;
- own translations, navigation, metadata, product fixtures, and feature state;
- compose shared primitives/patterns rather than restyling them from scratch;
- mark deferred actions honestly;
- keep API/integration code outside generic presentation components.

## Placement decisions

Put a component in `packages/ui/src/components` when it is a generic primitive usable without Kori product knowledge.

Put it in `packages/ui/src/patterns` when it represents reusable Kori presentation but does not need messages, routing, or data access.

Put it in `apps/web/components` when it needs localization, Next.js, application providers, feature flags, product fixtures, or integration state.

Route-specific compositions remain next to their App Router page/layout when reuse is not established.

## Variants and statuses

Shared variants use semantic names such as `gold`, `teal`, `editorial`, `locked`, and `released`. React components consume semantic utilities (`bg-primary`, `text-success`) rather than historical hex values.

Domain status codes remain stable and language-independent. Application code maps a stable code to a translated label, then passes that label to `StatusBadge`. Translated labels must not be persisted, written to contracts, or returned as API identifiers.

## Forms and feedback

Future forms must use labels, descriptions, field-level errors, disabled/submitting states, and schema validation. Dialogs must preserve focus management and escape behavior from the primitive.

Sonner feedback is allowed only after an actual local or remote state change. Current demo dialogs and simulator actions identify their in-memory scope; unavailable remote actions are disabled or explicitly labeled.

## Testing

- test variant behavior through exported CVA factories;
- render real shared primitives when asserting accessible output;
- test application helpers at routing/data boundaries;
- preserve recursive message-key parity;
- use running-application/browser checks for responsive and interactive composition.
