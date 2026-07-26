# Technology Baseline

## Workspace

- Package manager: pnpm `10.33.0`, pinned by the root `packageManager` field.
- Monorepo: pnpm workspaces and Turborepo `^2.10.5`.
- Application: `apps/web`.
- Shared runtime packages: `packages/ui`, `packages/i18n`, `packages/domain`, `packages/web3`, `packages/db`, `packages/ai`, and `packages/observability`.
- Contracts: `packages/contracts`.
- Shared configuration: `packages/config`.

All pnpm commands run from the repository root. Package-local installs and lockfiles are not part of the intended workflow.

## Frontend

| Responsibility     | Installed baseline                                    |
| ------------------ | ----------------------------------------------------- |
| Framework          | Next.js `16.2.11`, App Router                         |
| Rendering          | React and React DOM `19.2.4`                          |
| Language           | TypeScript (`^5` in web; `^7.0.2` in shared packages) |
| Localization       | next-intl `4.13.4`, `@kori/i18n`                      |
| Styling            | Tailwind CSS 4, PostCSS, tw-animate-css               |
| Primitives         | shadcn `4.13.1`, Base UI `^1.6.0`, Radix UI `^1.6.4`  |
| Variants/utilities | CVA, clsx, tailwind-merge                             |
| Theme              | next-themes `^0.4.6`                                  |
| Icons              | Lucide React `^1.25.0` for generic UI icons           |
| Forms              | React Hook Form, Zod, hookform resolvers              |
| Tables/query       | TanStack Table and TanStack Query                     |
| Feedback           | Sonner `^2.0.7`                                       |
| Unit tests         | Vitest `^4.1.10`, Testing Library, jsdom              |

Dependency presence does not imply that every library is active on every page. TanStack Query, external persistence, authentication, wallet clients, Safe clients, and monitoring integrations remain unwired.

## Contracts

The contracts package uses Solidity `0.8.28`, Hardhat `^3.11.0`, OpenZeppelin Contracts `^5.6.1`, Viem `^2.55.5`, and the Hardhat Viem toolbox. Its local tests are independent from the current frontend.

## Verified command surface

```bash
pnpm --filter @kori/web dev
pnpm --filter @kori/web lint
pnpm --filter @kori/web typecheck
pnpm --filter @kori/web test
pnpm --filter @kori/web build
pnpm --filter @kori/ui typecheck
pnpm --filter @kori/i18n typecheck
pnpm --filter @kori/i18n test
```

Root `build`, `lint`, `typecheck`, and `test` commands delegate to Turborepo. Their result depends on every participating scaffold package, so frontend validation also records the focused commands separately.

Known inconsistency: `@kori/observability` declares `tsc --noEmit` and `vitest run --passWithNoTests` without declaring TypeScript or Vitest. Root typecheck/test therefore stop in that package after a clean install; fixing its manifest is outside the frontend reconstruction.

## Build constraints

The first web production build needs network access because `next/font` retrieves Jost, Cormorant Garamond, and Carlito.

Next.js currently reports an additional workspace marker at `apps/web/pnpm-workspace.yaml`. It does not block the web build, but repository owners should decide separately whether to remove that file or set an explicit Next.js workspace root.
