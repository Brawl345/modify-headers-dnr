## Modify Headers DNR

WebExtension to modify request and response headers through the [DeclarativeNetRequest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest) (DNR) API.

## Installation

- Available for Firefox on [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/modify-headers-dnr/)

Built with [WXT](https://wxt.dev) + Vue 3 (Manifest V3).

## Development

1. `git clone ...`
2. `npm ci`
3. `npm run dev` (Chrome) or `npm run dev:firefox` (Firefox)

Other commands:

- `npm run build` / `build:firefox` — production build into `.output/`
- `npm run zip` / `zip:firefox` — package for the store
- `npm run lint:types`, `npm run lint:code`, `npm test`
- `npm run release <version>` — bump version, build zips (no upload), tag and push

## Screenshots

![Screenshot](screenshot-chrome-1.png?raw=true "Screenshot")

![Options](screenshot-chrome-2.png?raw=true "Options")
