# LLM Guidance

This file provides guidance to LLMs when working with code in this repository.

## Overview

Chrome/Firefox web extension that modifies HTTP request and response headers via the
[DeclarativeNetRequest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest)
(DNR) API. TypeScript + Vue 3 (`<script setup>`, scoped styles), built with [WXT](https://wxt.dev) (Vite),
linted/formatted with Biome, tested with Vitest. Manifest V3.

## Architecture

Framework-free logic lives in `lib/`; Vue UI in `entrypoints/` + `components/`:

- **`lib/types.ts`**: `FilterRule`/`Options` data model, `HeaderOperation`/`ApplyOn`/`RESOURCE_TYPES` constants.
  The model is storage-compatible with older versions (the `format` field drives migrations) — do not change its
  shape without a migration.
- **`lib/storage.ts`**: defaults, `newRule`, `getOptions`/`saveOptions`. Persists to `storage.sync` so rules sync
  across devices.
- **`lib/dnr.ts`**: `constructNewRules` (FilterRule → DNR rule) and `applyRules` (atomically replaces the dynamic
  rule set). Shared by the options page, popup and background.
- **`lib/validation.ts`**: `validateRules` → `Record<index, RuleError>`.
- **`entrypoints/background.ts`**: install (load synced rules into DNR, open options), update migrations (`format`
  1→2→3), dev-only `onRuleMatchedDebug` logging.
- **`entrypoints/options/`**: rule overview. Rules render compact; "Edit" expands a card inline.
- **`entrypoints/popup/`**: global enable/disable toggle + link to options.

## Commands (npm + Node 20+)

- `npm run build`: Production build → `.output/chrome-mv3` (use this, never `dev` for verification)
- `npm run build:firefox`: Firefox MV3 build → `.output/firefox-mv3`
- `npm run lint:types`: `wxt prepare` + `vue-tsc` type checking
- `npm run lint:code`: Biome linting (`format` to format)
- `npm test`: Vitest unit tests
- `npm run zip` / `zip:firefox`: Package the extension
- `npm run dev` / `dev:firefox`: Launch in a browser (user runs manually)
- `npm run release <version>`: Bump version, build zips, tag and push (no upload/signing)

## Internationalization

All user-facing strings live in `public/_locales/{en,de}/messages.json` and are accessed via the `t()` helper
(`lib/i18n.ts`), never hardcoded. Add every new key to **both** locales. German translations use the informal "Du" form.

## Key Technical Details

The unified `browser` API (`wxt/browser`) is used instead of raw `chrome.*` so the same code runs on Chrome and
Firefox. DNR string values (operations, resource types) are defined as our own constants in `lib/types.ts` rather than
relying on the `chrome.declarativeNetRequest.*` enums, which Firefox does not expose at runtime.
