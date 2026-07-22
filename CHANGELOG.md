# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versioned releases are intended to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The available Git history contains only the initial `.gitignore` commit. The entries below are therefore based on the confirmed current repository state rather than a complete release history. No versioned release has been inferred.

## [Unreleased]

### Added

- pnpm workspace configuration and Turborepo task orchestration for applications and internal packages.
- Next.js App Router application with an initial Kori MVP screen.
- Shared `@kori/ui` package with reusable shadcn/ui components, utilities, and global Tailwind CSS styles consumed by the web application.
- Internal package scaffolds for domain logic, Supabase access, AI and document analysis, Web3 and Safe clients, observability, and shared configuration.
- Hardhat 3 project with Solidity configuration, Viem tooling, a generated `Counter` sample contract, an Ignition module, and sample tests.
- Vitest and Testing Library dependencies and package scripts, plus the root Playwright dependency for future browser testing.
- Project context, architecture-decision, and current-status documentation under `docs/context`.

### Changed

- Replaced the generic create-next-app README with repository-specific setup, scope, status, security, and development guidance.
- Clarified that integration dependencies and internal package directories are scaffolds, not completed Supabase, Safe, SIWE, AI, observability, or Sepolia features.
- Kept Storybook deferred; only empty placeholder directories exist under `apps/storybook`, with no configured Storybook application or stories.

### Fixed

- Added the Base UI runtime dependency and shared `cn` utility required by the generated UI components so the initial Next.js page can compile and render.
