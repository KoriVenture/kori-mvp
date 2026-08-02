# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versioned releases are intended to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

No versioned release has been identified. The entries below are based on the current repository state and the Git history available on this branch.

## [Unreleased]

### Added

- pnpm workspace configuration and Turborepo task orchestration for applications and internal packages.
- Next.js 16 App Router application with English, French, and Spanish routes, browser-language negotiation, localized metadata, and synchronized message namespaces.
- Framework-independent `@kori/i18n` package for supported locales, locale metadata, date/number formats, and explicit currency-format options.
- Accessible language and system/light/dark theme controls using next-intl, next-themes, and existing shared menu primitives.
- Audit-derived Kori source tokens, semantic light/dark themes, font roles, responsive gutters, visible focus, and reduced-motion rules in the shared UI package.
- Kori variants for shared Button, Card, Badge, StatusBadge, and Progress components.
- Validated Kori light/dark transparent logo assets for the localized web application.
- Vitest and Testing Library configuration covering locales, message parity, routing, shared styles, and UI variants.
- Internal package foundations for domain logic, Supabase access, AI/document analysis, Web3/Safe clients, observability, and shared configuration.
- Hardhat 3 project with `MockUSDC`, `KoriEscrow`, local escrow-flow tests, and retained sample Counter files.
- Architecture, audit-fidelity, design-system, project-context, and implementation-plan documentation.
- Faithful eleven-block Kori landing page, localized Stories and map-less Capital Map pages, and historical HTML redirects.
- Addressable Fund Manager, Angel Investor, and Startup Founder dashboard shells with all 16 canonical subviews.
- Local-only pedagogical contract simulator with milestone sequencing, validation, reset, audit log, and demonstration hashes.
- Shared Kori patterns for logos, containers, panels, tags, statistics, milestone progress, and responsive dashboard composition.
- Accessible Sheet navigation, Base UI dialogs, route-preserving locale selection, honest local feedback, and reachable evidence file inputs.
- Localized `robots.txt` and sitemap entries for every public locale.
- Historical source map, technology baseline, and expanded fidelity documentation.

### Changed

- Replaced the generic initial Next.js screen with an audit-derived, multilingual Kori demonstration page that explicitly disables the deferred wallet action.
- Wrapped the existing Next.js configuration with the official next-intl plugin while preserving the existing transpiled workspace packages.
- Kept global styles centralized in `packages/ui/src/styles/globals.css`, with `apps/web/app/globals.css` as an import-only bridge.
- Aligned the UI package's development React and React DOM versions with the web application to prevent duplicate React runtimes in component tests.
- Replaced generic repository documentation with current setup, scope, status, security, localization, and UI architecture guidance.
- Kept Storybook deferred; `apps/storybook` remains a placeholder without a package manifest, configuration, or stories.
- Reconstructed the historical frontend in App Router components while keeping runtime CSS tokens and global styles in `packages/ui`.
- Centralized canonical demonstration fixtures and translated editorial labels at the application boundary without duplicating financial records by locale.
- Replaced dashboard tab-like state with locale-aware, addressable routes and browser-history-compatible navigation.

### Fixed

- Added the Suspense boundary required by Next.js 16 for the query-preserving language switcher during static rendering.
- Added direct application ownership of `lucide-react` instead of relying on the UI package's transitive dependency.
- Restored complete Markdown structures in the root agent instructions and project-context/status documents.
- Corrected the historical `/en` 404 by implementing the locale route tree and root locale negotiation.
- Wrapped Base UI dropdown labels in their required menu groups and retained route/query state during locale changes.
- Removed narrow-screen simulator overflow by allowing grid children, panels, and contract previews to shrink within the viewport.

### Removed

- Browser automation dependency, configuration, end-to-end suite, generated reports, and deterministic captures.
