# Typpis ESLint Usage Guide

## Install the preset and peers

```bash
npm install --save-dev eslint-config-Typpis-ESLint
node -e "const peers=require('./package.json').peerDependencies; console.log('npm install --save-dev ' + Object.entries(peers).map(([name, version]) => `${name}@${version}`).join(' '));"
```

Run the printed command to keep every peer dependency in sync with the published versions.

## Authoring `eslint.config.mjs`

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import createTyppisConfig from 'eslint-config-Typpis-ESLint/create-config';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default await createTyppisConfig({
    tsconfigRootDir: rootDir,
    tsconfigPath: ['tsconfig.json', 'packages/*/tsconfig.json'],
    ignores: ['**/dist/**', '**/coverage/**']
});
```

### Enabling the strict preset

```js
export default await createTyppisConfig({
    preset: 'all',
    tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
    tsconfigPath: ['tsconfig.json']
});
```

## Running the smoke tests

```bash
npm run lint
npm run lint:all
npm run test
```

`npm run test` performs the plugin load check and resolves both presets to verify they return populated flat config arrays.

## Automated releases

- Store an npm automation token in the repository secrets as `NPM_TOKEN`.
- Tag the release (`git tag v0.1.0 && git push origin v0.1.0`) **or** manually dispatch the `Release` workflow with the target version.
- Use the optional `dry_run` input to exercise the workflow without publishing; the run will still lint, test, and execute `npm pack --dry-run`.
- Successful runs publish with provenance (`npm publish --provenance`) and create a GitHub release that reuses the generated notes.
