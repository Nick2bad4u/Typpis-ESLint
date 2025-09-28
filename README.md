# Typpis-ESLint

An opinionated ESLint flat configuration that brings together the Typpis plugin stack for TypeScript, React, Electron, and modern full stack applications.

## Installation

```bash
npm install --save-dev eslint-config-Typpis-ESLint
```

## Usage

Import the configuration you need from the package and export it from your ESLint flat config.

```js
// eslint.config.js
import typpisRecommended from 'eslint-config-Typpis-ESLint/recommended';

export default typpisRecommended;
```

For the fully locked down ruleset you can use the `all` configuration instead:

```js
import typpisStrict from 'eslint-config-Typpis-ESLint/all';

export default typpisStrict;
```

## Available Scripts

```bash
npm run lint        # Lint fixtures with the recommended configuration
npm run lint:all    # Lint fixtures using both recommended and strict configs
npm run lint:fix    # Auto-fix lint issues where possible
npm run check:plugins # Smoke-test that every plugin dependency can be loaded
npm run test        # Smoke-test config loading
```

## Repository Layout

- `lib/configs/recommended.js` – base multi-environment flat config
- `lib/configs/all.js` – strict extension of the recommended config
- `tests/fixtures/` – sample files that exercise the rule configuration
- `scripts/` – helper scripts used by the npm commands above

## Node Compatibility

- Node.js >= 18.18
