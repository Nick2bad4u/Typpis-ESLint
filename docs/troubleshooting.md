# Troubleshooting

The Typpis presets surface strict rules, so setup issues usually appear as actionable error messages. This guide lists the most common ones and how to resolve them quickly.

## Missing peer dependencies

```
Error: Failed to load plugin ... declared in 'typpis/base': Cannot find module 'eslint-plugin-...'
```

Run the install helper again to ensure every peer dependency matches the versions listed in `package.json`:

```bash
node -e "const peers=require('./package.json').peerDependencies; console.log('npm install --save-dev ' + Object.entries(peers).map(([name, version]) => `${name}@${version}`).join(' '));"
```

## `parserOptions.project` required

Typed rules for `@typescript-eslint`, `eslint-plugin-boundaries`, and `eslint-plugin-paths` require TypeScript program information. Make sure your config sets `tsconfigPath` and `tsconfigRootDir`:

```js
export default await createTyppisConfig({
  tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
  tsconfigPath: ["tsconfig.json"],
});
```

If you rely on project references, pass every relevant `tsconfig` file in the array.

## Cannot resolve imports after enabling path aliases

Typpis activates `eslint-import-resolver-typescript` automatically. Ensure the resolver has access to your `tsconfig` paths:

```js
export default await createTyppisConfig({
  tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
  tsconfigPath: ["tsconfig.base.json", "packages/*/tsconfig.json"],
});
```

If ESLint still cannot resolve a module, confirm the `paths` entry exists in your `tsconfig` and the glob matches.

## ESLint configuration must resolve to an array

All exports are asynchronous flat configs. When authoring an `eslint.config.mjs`, remember to `await` the import:

```js
import typpisRecommended from "eslint-config-typpis-eslint/recommended";

export default await typpisRecommended;
```

## HTML indentation errors on existing markup

The HTML plugin is strict by default. If you are gradually adopting the preset, relax the indentation rule temporarily:

```js
transform(config) {
  const html = config.find((entry) => entry?.name === "typpis/html");
  if (html) {
    html.rules = {
      ...html.rules,
      "@html-eslint/indent": ["warn", 2],
    };
  }
}
```

## npm publish fails with "invalid package name"

npm requires lowercase names for new packages. The Typpis package publishes under `eslint-config-typpis-eslint`. Make sure your `package.json` matches this casing before tagging a release.

## GitHub Actions workflow fails with `NPM_TOKEN` missing

Add an [automation token](https://docs.npmjs.com/creating-and-viewing-access-tokens) to the repository secrets as `NPM_TOKEN`. The reusable publish workflow reads the secret to authenticate `npm publish`.

## Need more help?

Open an issue with the failing command, your `eslint.config.*` file, and the project structure so the maintainers can reproduce and suggest targeted fixes.
