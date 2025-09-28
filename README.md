# Typpis-ESLint

An opinionated ESLint flat configuration that composes the full Typpis plugin stack for TypeScript, React, Electron, Node.js, and content files such as MDX, Markdown, JSON, YAML, TOML, and HTML.

## Installation

Install the preset along with the peer dependencies that match the versions published in `peerDependencies`.

```bash
npm install --save-dev eslint-config-typpis-eslint
```

For monorepos replicate the versions in `peerDependencies` for each workspace. A quick way to produce the full installation command is:

```bash
node -e "const peers=require('./package.json').peerDependencies; console.log('npm install --save-dev ' + Object.entries(peers).map(([name, version]) => `${name}@${version}`).join(' '));"
```

Run the printed command with your preferred package manager (`npm`, `pnpm`, or `yarn`).

## Usage

The presets resolve asynchronously because they dynamically load the Typpis plugin suite. The easiest way to consume them is through the factory helper exported at `eslint-config-typpis-eslint/create-config`.

### Quick start with `eslint.config.mjs`

```js
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import createTyppisConfig from "eslint-config-typpis-eslint/create-config";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default await createTyppisConfig({
  tsconfigRootDir: rootDir,
  tsconfigPath: ["tsconfig.json", "packages/*/tsconfig.json"],
  ignores: ["**/dist/**", "**/coverage/**"],
});
```

The helper clones the recommended preset, injects your `parserOptions.project` values, synchronises the TypeScript import resolver, and lets you prepend additional ignore globs. Switch to the strict preset by passing `preset: 'all'`.

### Using the preset modules directly

If you prefer to import the preset modules yourself, remember that the exports resolve to promises:

```js
import typpisRecommended from "eslint-config-typpis-eslint/recommended";

export default await typpisRecommended;
```

The strict variant follows the same pattern:

```js
import typpisAll from "eslint-config-typpis-eslint/all";

export default await typpisAll;
```

### Factory options

`createTyppisConfig` accepts the following options:

- `preset` (`'recommended' | 'all'`, default `'recommended'`): choose the rule profile.
- `tsconfigPath` (`string | string[]`, default `'tsconfig.json'`): forwarded to `parserOptions.project` and the TypeScript import resolver.
- `tsconfigRootDir` (`string`, default `process.cwd()`): synchronises both the parser and import resolver root.
- `ignores` (`string | string[]`): prepends additional glob patterns ahead of the Typpis gitignore preset.
- `transform` (`(config) => void`): optional callback that can mutate the generated config before it is returned, useful for wiring project-specific overrides.

A fully documented example lives in `eslint.config.example.mjs` inside the package.

## Scripts

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
- `lib/create-config.js` – factory helper that injects project-specific options
- `tests/fixtures/` – sample files that exercise the rule configuration
- `scripts/` – helper scripts used by the npm commands above

## Node Compatibility

- Node.js >= 18.18

## Release Automation

The repository ships an automated `Release` workflow that publishes the package to npm and creates a matching GitHub release once tests succeed.

1. Generate an npm automation token with publish rights and add it to the repository secrets as `NPM_TOKEN` (an automation token is strongly recommended).
2. Update `package.json`/`package-lock.json`, `CHANGELOG.md`, and other release notes locally.
3. Choose one of the following triggers:
   - Push an annotated tag named `v<version>` (for example `v0.1.0`) to `main`. The workflow verifies that the tag matches `package.json` before publishing.
   - Manually run **Release** → **Run workflow** in GitHub Actions. Supply the exact version string, optionally override the npm dist-tag, and enable **dry_run** to rehearse without publishing.
4. The reusable workflow runs `npm run lint`, `npm run lint:all`, and `npm test`, performs an `npm pack --dry-run` inspection, publishes with `npm publish --provenance`, and autogenerates GitHub release notes via the REST API.

If you need to publish to an alternate npm channel, provide the desired dist-tag when dispatching the workflow manually. The workflow defaults to the `latest` dist-tag for tag-triggered releases.
