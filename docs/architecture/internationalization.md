# Internationalization Architecture

## Purpose

Kori supports one application in three interface languages without duplicating product routes, domain records, or deals.

## Supported locales and default

- Supported locales: `en`, `fr`, `es`.
- Provisional default: `en`.
- Source of truth: `packages/i18n/src/locales.ts`.
- Native display names and HTML metadata: `packages/i18n/src/locale-metadata.ts`.

`packages/i18n` is framework-independent and does not import React, Next.js, or next-intl.

## Localized URL strategy

Every public application URL has an explicit locale prefix:

```text
/en
/fr
/es
```

Each page exists once below `apps/web/app/[locale]`. Locale-aware navigation helpers in `apps/web/i18n/navigation.ts` are used for internal localized navigation across public pages, dashboards, and the simulator.

## Negotiation precedence and exclusions

The next-intl proxy applies this precedence:

1. an explicit supported URL locale;
2. a supported locale previously selected through next-intl;
3. a supported browser-language preference;
4. English.

The proxy excludes API routes, Next.js/deployment internals, and file assets. APIs remain locale-independent. Unsupported locale segments must not silently render English.

## Message namespaces and ownership

The web application owns matching namespaces for every locale:

```text
apps/web/messages/{locale}/
  common.json
  navigation.json
  status.json
  validation.json
  home.json
  landing.json
  stories.json
  capital-map.json
  dashboard-common.json
  fund-manager.json
  angel-investor.json
  startup-founder.json
  simulator.json
```

`apps/web/i18n/messages.ts` uses explicit loaders so the bundler can discover every catalog. English, French, and Spanish must maintain recursive key parity.

Application/product copy belongs in `apps/web/messages`. Framework-independent locale facts and reusable formatting options belong in `packages/i18n`.

## Package boundaries

- `packages/i18n`: locale identifiers, metadata, type guards, and plain Intl options.
- `apps/web/i18n`: next-intl routing, request configuration, navigation, and message loading.
- `apps/web/components/i18n`: interactive locale controls and Next.js route behavior.
- `packages/ui`: generic visual primitives; no next-intl imports.
- domain, APIs, database, contracts, and events: stable language-independent identifiers.

## Formatting: locale vs. country vs. time zone vs. currency vs. token

Interface locale controls language-sensitive formatting only. It must not infer:

- country, residency, or legal jurisdiction;
- currency or ISO currency code;
- blockchain token or network;
- time zone.

Currency requires an explicit uppercase three-letter code through `createCurrencyFormat(currency)`. Tokens such as MockUSDC are domain assets, not inferred currencies. Future dates must receive an explicit time zone when the source value is not already unambiguous.

The current next-intl request configuration uses `UTC` as an explicit, locale-independent server-rendering default to prevent hydration differences. A future authenticated profile time zone must replace it at the request boundary when user-specific dates are introduced.

## Future profile fields

If user profiles are added, store these separately:

- preferred interface locale;
- country/residency where legally required;
- time zone;
- preferred display currency;
- wallet/network preferences.

Do not collapse these fields into one locale value.

## Future translation tables

SolarGrid remains one deal with one stable identifier. Dashboard editorial fields use message keys while financial facts, milestone states, entities, and identifiers remain shared in `apps/web/content`. Stable status, sector, instrument, transaction, and document-category codes are translated at the application boundary.

## Future AI source/output language separation

Future evidence analysis must record at least:

- source-document language;
- requested output language;
- model/provider;
- immutable source references;
- translated or summarized output.

Changing the UI language must not rewrite evidence, alter model conclusions, or disguise machine translation as original content.

## Metadata, canonical, and hreflang strategy

Each locale generates a localized title and description, a canonical path for itself, and alternates for `en`, `fr`, and `es`. The localized route parameter is validated before metadata is generated.

A production deployment must supply an authoritative site origin before absolute canonical URLs are required.

## Testing contract

Automated tests verify:

- exactly three supported locales and the English default;
- supported/unsupported locale resolution;
- message namespace and recursive-key parity;
- proxy language negotiation and exclusions;
- route/query preservation in locale switching.

Build verification generates every public locale route and all dashboard/simulator pages. Browser verification confirms 200 responses, matching `<html lang>`, localized titles/content, route-preserving language changes, and narrow-screen layout.

## Deferred work

- profile persistence and server-side locale preferences;
- translated database-backed editorial fields;
- localized emails and notifications;
- localized validation for real product forms;
- country, currency, token, and time-zone preferences;
- AI source/output language handling;
- authenticated locale preferences and locale-aware server data.
