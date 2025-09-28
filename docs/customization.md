# Customising Typpis ESLint

Typpis exposes a factory helper that makes it simple to layer project-specific tweaks on top of the recommended or strict presets. This guide shows the most common extension points and the patterns we recommend when you need to override a rule.

## 1. Start from the factory helper

```js
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import createTyppisConfig from "eslint-config-typpis-eslint/create-config";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default await createTyppisConfig({
  tsconfigRootDir: rootDir,
  tsconfigPath: ["tsconfig.json"],
  transform(config) {
    // Add your alterations here
  },
});
```

Every configuration returned by `createTyppisConfig` is a plain flat config array. You can push new entries, modify existing ones, or adjust rule severity as needed inside the `transform` callback.

## 2. Adjust rules for a specific plugin

```js
transform(config) {
  const base = config.find((entry) => entry?.name === "typpis/base");
  if (base) {
    base.rules = {
      ...base.rules,
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "perfectionist/sort-objects": "off",
    };
  }
}
```

Because the presets label each major segment (`typpis/base`, `typpis/typescript`, etc.), you can target the relevant block directly.

## 3. Add overrides for new file types

```js
transform(config) {
  config.push({
    name: "local/graphql",
    files: ["**/*.gql", "**/*.graphql"],
    plugins: {
      graphql: require("eslint-plugin-graphql"),
    },
    rules: {
      "graphql/template-strings": "error",
    },
  });
}
```

Flat configs allow you to inject additional parsers or plugins per file glob. Keep overrides at the end of the array so they are evaluated after the Typpis defaults.

## 4. Disable heavy rules in CI-only environments

```js
transform(config) {
  if (process.env.CI !== "true") {
    return;
  }

  const perf = config.find((entry) => entry?.name === "typpis/react-jsx");
  if (perf) {
    perf.rules = {
      ...perf.rules,
      "react-perf/jsx-no-new-function-as-prop": "warn",
    };
  }
}
```

You can branch on environment variables to relax rules locally while keeping full enforcement in CI.

## 5. Enabling `eslint-plugin-prettier`

The presets include `eslint-config-prettier` by default. If you prefer inline formatting enforcement, add the following override:

```js
transform(config) {
  config.push({
    name: "local/prettier",
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      "prettier/prettier": "error",
    },
  });
}
```

Remember to add `eslint-plugin-prettier` to your project dependencies if you intend to run it in addition to Prettier itself.

## 6. Using CommonJS configuration files

If you need a CommonJS entry, wrap the async factory call:

```js
const createTyppisConfig = require("eslint-config-typpis-eslint/create-config");

module.exports = createTyppisConfig({
  tsconfigPath: ["tsconfig.json"],
});
```

## 7. Compose with other shareable configs

When merging Typpis with other flat configs, load Typpis last so its file-type overrides stay intact:

```js
import createTyppisConfig from "eslint-config-typpis-eslint/create-config";
import github from "@github/eslint-config";

const typpis = await createTyppisConfig({ tsconfigPath: ["tsconfig.json"] });

export default [
  ...github,
  ...typpis,
];
```

This approach keeps global ignores merged correctly and ensures Typpis parsers win when extensions overlap.
