# Typpis ESLint

Typpis ships the entire Typpis plugin stack as a ready-to-use ESLint 9 flat configuration for TypeScript, React, Electron, and content heavy apps. It layers security, accessibility, performance, formatting, and documentation checks into two batteries-included presets that you can drop into any workspace.

- **Full-stack coverage** – HTML, MDX, JSON, YAML, TOML, TailwindCSS, SQL templates, testing frameworks, and more.
- **Strict by default** – sensible recommended rules with an opt-in `all` preset that maximises type safety and runtime guarantees.
- **Monorepo aware** – works across pnpm, npm, and yarn workspaces with zero manual resolver wiring.
- **Release ready** – includes CI smoke tests and an automated publishing workflow for npm provenance releases.

## Quick links

- [Installation](#installation)
- [Quick start](#quick-start)
- [Preset overview](#preset-overview)
- [Customising the config](#customising-the-config)
- [Prettier integration](#prettier-integration)
- [Project recipes](#project-recipes)
- [Troubleshooting](#troubleshooting)
- [Release automation](#release-automation)
- [Further reading](#further-reading)

## Installation

The package name is `eslint-config-typpis-eslint`. Install it together with the peer dependencies (versions mirror the published preset so you do not need to curate them manually).

```bash
npm install --save-dev eslint-config-typpis-eslint
node -e "const peers=require('./package.json').peerDependencies; console.log('npm install --save-dev ' + Object.entries(peers).map(([name, version]) => `${name}@${version}`).join(' '));"
```

Equivalent commands:

```bash
pnpm add -D eslint-config-typpis-eslint
pnpm dlx qnm peer eslint-config-typpis-eslint  # inspect installed versions
```

```bash
yarn add --dev eslint-config-typpis-eslint
node -e "const peers=require('./package.json').peerDependencies; console.log('yarn add --dev ' + Object.entries(peers).map(([name, version]) => `${name}@${version}`).join(' '));"
```

Typpis targets Node.js >= 18.18.0. Confirm your runtimes (`node --version`) match before enabling the preset.

## Quick start

### Option A – async flat config (recommended)

```js
// eslint.config.mjs
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

### Option B – direct preset import

```js
// eslint.config.mjs
import typpisRecommended from "eslint-config-typpis-eslint/recommended";

export default await typpisRecommended;
```

Switch to the strict profile by importing `eslint-config-typpis-eslint/all` or passing `preset: 'all'` to the factory helper.

## Preset overview

| Preset | Description | Typical use |
| --- | --- | --- |
| `recommended` | Balanced defaults for product teams. Includes accessibility, security, testing, and formatting compatibility without overwhelming existing codebases. | Day-to-day development, gradual adoption, CI + editor tooling. |
| `all` | Enables every optional and strict mode rule across the stack (Unicorn, Tailwind, Total Functions, SonarJS, etc.). Assumes strongly typed TypeScript projects. | Safety-critical systems, template repos, or new greenfield codebases. |

Both presets:

- register file-type overrides for TS/TSX, JSX, JS, MDX, Markdown, HTML, JSON, JSONC, YAML, TOML.
- wire `@typescript-eslint/parser` with your `tsconfig` files and synchronise `eslint-import-resolver-typescript` automatically.
- apply `eslint-config-prettier` last to avoid formatting conflicts.

See [`docs/plugins.md`](docs/plugins.md) for a succinct view of every plugin that ships with Typpis.

## Customising the config

Use the `transform` callback exposed by `createTyppisConfig` to tweak rules, add overrides, or bring in additional plugins.

```js
export default await createTyppisConfig({
  tsconfigRootDir: rootDir,
  tsconfigPath: ["tsconfig.json"],
  transform(config) {
    const typescript = config.find((entry) => entry?.name === "typpis/typescript");
    if (typescript) {
      typescript.rules = {
        ...typescript.rules,
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      };
    }

    config.push({
      name: "local/graphql",
      files: ["**/*.gql", "**/*.graphql"],
      plugins: {
        graphql: require("@graphql-eslint/eslint-plugin"),
      },
      rules: {
        "graphql/template-strings": "error",
      },
    });
  },
});
```

More patterns—including how to branch on environment variables and how to enable `eslint-plugin-prettier`—live in [`docs/customization.md`](docs/customization.md).

## Prettier integration

Typpis assumes you run Prettier separately (via `prettier --check` or an IDE integration) and therefore ends each preset with `eslint-config-prettier` so lint fixes never fight Prettier. If you want ESLint to report formatting issues:

1. Install `eslint-plugin-prettier` in your project.
2. Append the override documented in [`docs/customization.md`](docs/customization.md#5-enabling-eslint-plugin-prettier).
3. Consider scoping the rule to staged files only to avoid noisy CI failures.

## Project recipes

- **React/Vite/Electron** – use the default factory options. The React-specific plugins (`eslint-plugin-react`, `@eslint-react/eslint-plugin`, `eslint-plugin-react-refresh`, etc.) are already enabled with JSX transforms.
- **Backend/Node services** – disable JSX-specific rules by updating the `files` globs in the transform callback and turning off React-specific sections if you do not ship UI code.
- **Libraries / SDKs** – add `files: ["**/src/**/*.ts"]` overrides to enforce stricter exports (`eslint-plugin-filename-export`, `eslint-plugin-boundaries`) and set `preset: 'all'` once the codebase adheres to the recommended preset.
- **Monorepos** – pass every `tsconfig` file (workspace root, packages) in `tsconfigPath`, and commit a shared `eslint.config.mjs` at the repository root. The resolver honours project references automatically.
- **Content-heavy docs sites** – keep the Markdown/MDX overrides, and add additional processors for fenced code blocks via the `transform` hook if you embed other languages.

## Scripts and local workflows

```bash
npm run lint        # Recommended preset against the fixtures directory
npm run lint:all    # Strict run over the same fixtures (ensures rules stay in sync)
npm run lint:fix    # Apply safe fixes when iterating locally
npm run check:plugins # Verifies every plugin can be required successfully
npm run test        # Smoke tests that both presets and the config factory resolve
```

Adopt the same commands in your downstream project so upgrades remain predictable.

## Troubleshooting

Common setup issues (missing peers, parser errors, resolver misconfiguration, publishing failures) are documented in [`docs/troubleshooting.md`](docs/troubleshooting.md). Start there if you hit unexpected ESLint output.

## Release automation

The repository provides a reusable GitHub Actions workflow that performs a provenance-enabled npm publish.

1. Create an npm automation token and store it as `NPM_TOKEN` in repository secrets.
2. Update `package.json`, `package-lock.json`, and documentation with the new version.
3. Trigger the workflow by pushing a tag (`git tag v0.2.0 && git push origin v0.2.0`) or by manually dispatching **Release** in the Actions tab. Supply the version and optional dist-tag.
4. The workflow runs lint, strict lint, tests, `npm pack --dry-run`, publishes with `npm publish --provenance`, and generates GitHub release notes. Use the `dry_run` input for rehearsals.

For more detail, open `.github/workflows/release.yml` and `.github/workflows/reusable-publish.yml`.

## Further reading

- [`docs/usage.md`](docs/usage.md) – step-by-step setup for new projects, strict preset toggles, and CI scripts.
- [`docs/customization.md`](docs/customization.md) – advanced overrides, composing with other shareable configs, and environment-specific tweaks.
- [`docs/plugins.md`](docs/plugins.md) – grouped list of every plugin bundled with Typpis.
- [`docs/troubleshooting.md`](docs/troubleshooting.md) – quick fixes for common error messages.

If you need a new rule set or discover conflicts, open an issue with context about your project layout and the rules you would like to see adjusted.
