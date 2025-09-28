# Typpis ESLint Usage Guide

This companion guide walks through the most common installation paths and project setups. It assumes you already added `eslint-config-typpis-eslint` to your devDependencies.

## 1. Install the preset and peers

```bash
npm install --save-dev eslint-config-typpis-eslint
node -e "const peers=require('./package.json').peerDependencies; console.log('npm install --save-dev ' + Object.entries(peers).map(([name, version]) => `${name}@${version}`).join(' '));"
```

Run the printed command to keep every peer dependency in sync with the published versions. Repeat this step whenever you upgrade the preset.

## 2. Authoring `eslint.config.mjs`

```js
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import createTyppisConfig from "eslint-config-typpis-eslint/create-config";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default await createTyppisConfig({
  tsconfigRootDir: rootDir,
  tsconfigPath: ["tsconfig.json", "packages/*/tsconfig.json"],
  ignores: ["**/dist/**", "**/coverage/**", "**/.next/**"],
});
```

### Common variants

- **Strict preset:** `preset: 'all'`
- **Custom ignore list:** add `ignores: ['**/vendor/**']`
- **Multiple tsconfig files:** pass every reference in `tsconfigPath`
- **CommonJS configuration:** use `module.exports = createTyppisConfig({ ... })`

## 3. Monorepo patterns

When you manage several packages, point Typpis at every workspace `tsconfig`:

```js
export default await createTyppisConfig({
  tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
  tsconfigPath: [
    "tsconfig.base.json",
    "packages/*/tsconfig.json",
    "apps/*/tsconfig.json",
  ],
});
```

Typpis synchronises `eslint-import-resolver-typescript`, so path aliases defined in any of the listed configs resolve automatically.

## 4. Enabling focused overrides

Need per-directory rules? Use the transform hook:

```js
export default await createTyppisConfig({
  tsconfigPath: ["tsconfig.json"],
  transform(config) {
    config.push({
      name: "project/storybook",
      files: ["stories/**/*.{ts,tsx}", "**/*.stories.{ts,tsx}"],
      rules: {
        "storybook/await-interactions": "warn",
        "unicorn/filename-case": "off",
      },
    });
  },
});
```

See [`docs/customization.md`](./customization.md) for additional recipes.

## 5. Editor integration

- **VS Code:** install the official ESLint extension, set `"eslint.experimental.useFlatConfig": true`, and ensure the workspace has a local ESLint binary (`node_modules/.bin/eslint`).
- **WebStorm / IntelliJ:** enable “Automatic ESLint configuration” so the IDE consumes `eslint.config.mjs` directly.
- **Neovim / coc.nvim:** point the ESLint language server to the project root; the flat config is detected automatically when `eslint` v9+ is present.

## 6. Running the smoke tests

```bash
npm run lint
npm run lint:all
npm run test
```

`npm run test` executes `tests/run-tests.mjs`, which loads both presets and the configuration factory. Keep this script green when you extend the preset to catch accidental regressions.

## 7. Continuous integration

Add a workflow step similar to:

```yaml
- name: Lint
  run: npm run lint

- name: Strict lint (optional)
  run: npm run lint:all

- name: Config smoke tests
  run: npm run test
```

If you adopt the provided release workflow, these steps run automatically before publish.

## 8. Automated releases (recap)

- Store an npm automation token in the repository secrets as `NPM_TOKEN`.
- Tag the release (`git tag v0.1.0 && git push origin v0.1.0`) **or** manually dispatch the `Release` workflow with the target version.
- Use the optional `dry_run` input to exercise the workflow without publishing; the run will still lint, test, and execute `npm pack --dry-run`.
- Successful runs publish with provenance (`npm publish --provenance`) and create a GitHub release that reuses the generated notes.

## 9. Recommended reads

- [`docs/plugins.md`](./plugins.md) – discover the plugin families bundled with Typpis.
- [`docs/troubleshooting.md`](./troubleshooting.md) – resolve common setup issues quickly.
- [`docs/customization.md`](./customization.md) – layer project-specific overrides without forking the preset.
