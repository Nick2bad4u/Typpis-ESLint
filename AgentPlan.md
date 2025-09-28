You are an expert TypeScript/Node/Electron ESLint engineer. Build a fully shareable ESLint configuration npm package that wraps the entire plugin import list below into an installable preset that anyone can extend.

## Objective

- Ship a production-ready package named `eslint-config-typpis-eslint`
- Consume **every plugin and parser in the provided import list** without omission or renaming.
- Deliver clear documentation, CI, and tests so consumers can install, extend, and publish the preset.
- Typescript used where possible.
- Only support new eslint 9 flat configs.

## Global Requirements

- Research every plugin to understand recommended usage, options, and conflicts; reflect that knowledge in configs/comments/docs. If a plugin needs manual setup, document it and wire what you can programmatically.
- Assume Node.js LTS (≥18). Use CommonJS for configs (`index.cjs` or `index.js`) unless you add tooling for ESM; document import usage for both CJS and ESM consumers.
- Enforce Prettier compatibility; explain when to enable `eslint-plugin-prettier` vs running Prettier separately.
- Keep configs, docs, and scripts ASCII-only unless a dependency mandates otherwise.
- No TODOs or incomplete sections—be prescriptive.
- You must use proper parsers for each file type (e.g., `@typescript-eslint/parser` for TS/TSX, `jsonc-eslint-parser` for JSON/JSONC, `@html-eslint/parser` for HTML, `yaml-eslint-parser` for YAML, `toml-eslint-parser` for TOML, `eslint-mdx` for MDX).
- Provide `overrides` for each file type to attach the right parser, parserOptions, plugins, and extends.
- Include `globals` support where relevant (use the `globals` package).

## Deliverables (output each file with the required file block syntax)

1. `package.json` — include name/description/version placeholder, scripts (`lint`, `lint:all`, `test`, `check:plugins`, `prepare`, etc.), repository/license placeholders, engines, and **explicit dependencies, devDependencies, and peerDependencies listing every plugin/parser/import resolver**. Pin versions where possible; if you use `"latest"`, mark it clearly (e.g., `"eslint-plugin-foo": "latest // latest"`). Separate which entries are dependencies vs peers and explain your rationale in README.
2. `markdown name=README.md` — comprehensive guide covering:
   - Overview and motivation.
   - Exact list of included plugins (names + npm scopes, matching the import list order).
   - Installation instructions with npm, pnpm, and yarn commands that install the config plus every peer dependency in one line.
   - Usage examples for `.eslintrc.cjs/js`, `package.json#eslintConfig`, TypeScript projects (with `parserOptions.project`), MDX, HTML, JSON/JSONC, YAML, TOML overrides, and how to enable the `all` preset.
   - Prettier integration strategy and ordering (why `eslint-config-prettier` must be last, how to opt-in to `eslint-plugin-prettier`).
   - Special handling per plugin (e.g., ones requiring environment variables, tsconfig paths, runtime constraints, or optional peer deps).
   - Conflict resolution notes (where `fixupPluginRules` or overrides are applied).
   - Import resolver guidance using `createTypeScriptImportResolver` and TypeScript path mapping instructions.
   - Publishing steps to npm (`npm version`, `npm publish`, tagging releases) and troubleshooting tips (parser errors, missing peers, MDX parser issues, etc.).
3. `name=index.js` (or `.cjs`) — export `{ configs: { recommended, all } }` so consumers can extend via `"eslint-config-<name>/recommended"` or `/all`. Wire the configs by requiring the files under `lib/configs/`.
4. `name=lib/configs/recommended.js` — curated base config enabling appropriate recommended/essential rule sets from each plugin, using overrides per file type (JS/JSX/TS/TSX/MDX/MD/HTML/JSON/JSONC/YAML/TOML). Integrate `eslint-config-prettier` at the end, rely on `fixupPluginRules` where helpful, and add comments for non-obvious rule decisions.
5. `name=lib/configs/all.js` — strict superset of `recommended` turning on aggressive rules across plugins (document hyper-strict choices and suppressions). Ensure it still composes cleanly with `recommended` (e.g., spread and extend).
6. `name=.eslintrc.example.js` — demonstrates consuming the preset for both JavaScript- and TypeScript-first projects, including parser settings, `parserOptions.project`, `settings['import/resolver']` with `createTypeScriptImportResolver`, and overrides for MDX/HTML/etc.
7. `markdown name=docs/USAGE.md` — quickstart with install command, sample `.eslintrc.js`, enabling TypeScript + MDX + HTML overrides, and an example `package.json` `"eslintConfig"` block.
8. `markdown name=CHANGELOG.md` — initial release entry (e.g., `0.1.0`) summarizing what’s included.
9. `markdown name=LICENSE` — MIT license text with placeholders (year, author).
10. `name=.npmignore` _or_ specify a `files` array in `package.json` to exclude test fixtures/docs you don’t want published (retain configs/docs needed by consumers).
11. `name=.github/workflows/ci.yml` — GitHub Actions workflow (Node LTS matrix or single LTS) that:
    - uses `actions/setup-node` with npm cache,
    - runs `npm ci`,
    - runs `npm run lint` (recommended preset) and fails on any errors,
    - runs the strict preset (e.g., `npm run lint:all`) and reports its exit code without blocking the workflow if you intentionally allow warnings/failures (capture output for logs),
    - executes a smoke test `node -e "console.log(require('./').configs.recommended ? 'OK' : 'MISSING')"`,
    - runs `eslint --print-config tests/fixtures/example.tsx` and greps for several plugin names (spell out which ones, e.g., `eslint-plugin-react`, `eslint-plugin-import-x`, `eslint-plugin-mdx`, `eslint-plugin-unicorn`, `@typescript-eslint`),
    - runs `npm test`.
12. `name=tests/fixtures/example.js`, `example.jsx`, `example.ts`, `example.tsx`, `example.mdx`, `example.md`, `example.html`, `example.json`, `example.jsonc`, `example.yaml`, `example.yml`, `example.toml`, and `name=tests/fixtures/tsconfig.json` — minimal-but-valid content for each file type to exercise all parsers/plugins (TS fixtures should compile with the tsconfig). Ensure fixtures pass `recommended` but may trigger `all`-level warnings/errors.
13. Any helper scripts under `tests/` (e.g., utilities for plugin coverage checks) as needed.

## Implementation Details & Constraints

- **Use every plugin** listed below in the configs and dependency lists; do not delete or rename imports. If a plugin can’t be automatically enabled, leave a clarifying comment and document manual steps.
- Configure parsers:
  - `@typescript-eslint/parser` with `parserOptions.project` pointing to `tests/fixtures/tsconfig.json`.
  - `jsonc-eslint-parser` for JSON/JSONC overrides.
  - `@html-eslint/parser` with the HTML plugin for HTML files.
  - `yaml-eslint-parser` for YAML.
  - `toml-eslint-parser` for TOML.
  - `eslint-mdx` / `eslint-plugin-mdx` for MDX; ensure parser + plugins are wired correctly.
- Provide `overrides` for each file type to attach the right parser, parserOptions, plugins, and extends.
- Include `globals` support where relevant (use the `globals` package).
- Apply `fixupPluginRules` from `@eslint/compat` or direct rule overrides to resolve conflicts (document in code/README why you disable or adjust any rules).
- Integrate `eslint-config-prettier` last in the extends chain. Offer an option to enable `eslint-plugin-prettier` (ex: extra config or documented toggle).
- Configure `settings['import/resolver']` with `createTypeScriptImportResolver({ alwaysTryTypes: true, project: [...] })` and explain how consumers adapt it for custom path aliases.
- Explain and, where feasible, provide sample rules for specialized plugins (e.g., `eslint-plugin-better-tailwindcss`, `eslint-plugin-implicit-dependencies`, security plugins).
- Ensure scripts & configs work on Windows, macOS, Linux (no `bash`-only syntax; prefer Node/JS scripts or cross-shell commands).
- Add a `prepare` script (even if it just runs `npm run lint`) so `npm publish` works smoothly.

## Testing & QA Requirements

- `npm run lint` must lint fixtures with the `recommended` config and exit 0.
- `npm run lint:all` (or similar) must run ESLint with the `all` config. You may allow it to exit non-zero but log results; describe the behavior in README.
- `npm test` must:
  1. Run `npm run lint`.
  2. Run the strict preset.
  3. Execute `eslint --print-config` for at least one TSX file and assert (via a Node script) that **every plugin from the list** is mentioned in the resulting config object (check presence of plugin keys or rule namespaces). Fail if any plugin is missing.
- Provide any additional helper scripts necessary to implement the above.
- Document how to run tests locally (`npm run lint`, `npm run lint:all`, `npm test`) in README and `docs/USAGE.md`.

## Output Formatting

- For JavaScript/JSON/YAML/TOML/etc., use `name=path/to/file.ext` fenced blocks.
- For Markdown, use the 4-backtick header form: `markdown name=README.md``` ... `.
- Do not include extra commentary outside the required files.
- The README must clearly indicate which dependencies are pinned versus `"latest"`.
- The final response must end with:
  1. An acceptance checklist (e.g., `- [x] package.json includes all plugins` ...).
  2. Instructions to run CI locally.
  3. Instructions to publish to npm.
- Do not emit anything beyond the files plus that final checklist/instruction section.

If you cannot finish the entire task in one response, ask me to continue, and you will pick up where you left off.

## Plugin Import List (use exactly as provided)

Plugin import list (the agent must use this exact list; do not remove or alter):

```typescript
import pluginUseMemo2 from "@arthurgeron/eslint-plugin-react-usememo";
import pluginDocusaurus from "@docusaurus/eslint-plugin";
import pluginComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslintReact from "@eslint-react/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import html from "@html-eslint/eslint-plugin";
import * as htmlParser from "@html-eslint/parser";
import implicitDependencies from "@jcoreio/eslint-plugin-implicit-dependencies";
import * as pluginDesignTokens from "@metamask/eslint-plugin-design-tokens";
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";
import rushStackSecurity from "@rushstack/eslint-plugin-security";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import vitest from "@vitest/eslint-plugin";
import gitignore from "eslint-config-flat-gitignore";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import * as eslintMdx from "eslint-mdx";
import antfu from "eslint-plugin-antfu";
import arrayFunc from "eslint-plugin-array-func";
import pluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import pluginBoundaries from "eslint-plugin-boundaries";
import pluginCanonical from "eslint-plugin-canonical";
import * as pluginCleanCode from "eslint-plugin-clean-code";
import pluginCleanTimer from "eslint-plugin-clean-timer";
import eslintPluginCommentLength from "eslint-plugin-comment-length";
import pluginCompat from "eslint-plugin-compat";
import * as pluginCssModules from "eslint-plugin-css-modules";
import depend from "eslint-plugin-depend";
import pluginDeprecation from "eslint-plugin-deprecation";
import etc from "eslint-plugin-etc";
import { plugin as ex } from "eslint-plugin-exception-handling";
import progress from "eslint-plugin-file-progress";
import pluginFilenameExport from "eslint-plugin-filename-export";
import pluginFormatSQL from "eslint-plugin-format-sql";
import * as pluginFunctionNames from "eslint-plugin-function-name";
import pluginFunctional from "eslint-plugin-functional";
import pluginGoodEffects from "eslint-plugin-goodeffects";
import pluginGranular from "eslint-plugin-granular-selectors";
import { importX } from "eslint-plugin-import-x";
// Zod Tree Shaking Plugin https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831
import importZod from "eslint-plugin-import-zod";
import istanbul from "eslint-plugin-istanbul";
import eslintPluginJsonSchemaValidator from "eslint-plugin-json-schema-validator";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginJsxPlus from "eslint-plugin-jsx-plus";
import listeners from "eslint-plugin-listeners";
import pluginLoadableImports from "eslint-plugin-loadable-imports";
import eslintPluginMath from "eslint-plugin-math";
import * as mdx from "eslint-plugin-mdx";
import moduleInterop from "eslint-plugin-module-interop";
import nodePlugin from "eslint-plugin-n";
import pluginNeverThrow from "eslint-plugin-neverthrow";
import nitpick from "eslint-plugin-nitpick";
import noBarrelFiles from "eslint-plugin-no-barrel-files";
import pluginNoConstructBind from "eslint-plugin-no-constructor-bind";
import pluginNoExplicitTypeExports from "eslint-plugin-no-explicit-type-exports";
import * as pluginNFDAR from "eslint-plugin-no-function-declare-after-return";
import pluginNoHardcoded from "eslint-plugin-no-hardcoded-strings";
import pluginRegexLook from "eslint-plugin-no-lookahead-lookbehind-regexp";
import pluginNoOnly from "eslint-plugin-no-only-tests";
import noSecrets from "eslint-plugin-no-secrets";
import pluginNoUnary from "eslint-plugin-no-unary-plus";
import pluginNoUnwaited from "eslint-plugin-no-unawaited-dot-catch-throw";
import nounsanitized from "eslint-plugin-no-unsanitized";
import eslintPluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
import observers from "eslint-plugin-observers";
import packageJson from "eslint-plugin-package-json";
import paths from "eslint-plugin-paths";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import playwright from "eslint-plugin-playwright";
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginPrettier from "eslint-plugin-prettier";
import pluginPromise from "eslint-plugin-promise";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintReactDom from "eslint-plugin-react-dom";
import * as pluginReactFormFields from "eslint-plugin-react-form-fields";
import pluginReactHookForm from "eslint-plugin-react-hook-form";
import reactHooks from "eslint-plugin-react-hooks";
import reactHooksAddons from "eslint-plugin-react-hooks-addons";
import eslintReactHooksExtra from "eslint-plugin-react-hooks-extra";
import eslintReactNamingConvention from "eslint-plugin-react-naming-convention";
import reactPerfPlugin from "eslint-plugin-react-perf";
import preferFunctionComponent from "eslint-plugin-react-prefer-function-component";
import reactRefresh from "eslint-plugin-react-refresh";
import pluginReactTest from "eslint-plugin-react-require-testid";
import reactUseEffect from "eslint-plugin-react-useeffect";
import eslintReactWeb from "eslint-plugin-react-web-api";
import pluginRedos from "eslint-plugin-redos";
import pluginRegexp from "eslint-plugin-regexp";
import * as pluginJSDoc from "eslint-plugin-require-jsdoc";
import pluginSafeJSX from "eslint-plugin-safe-jsx";
import pluginSecurity from "eslint-plugin-security";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginSortClassMembers from "eslint-plugin-sort-class-members";
import pluginSortDestructure from "eslint-plugin-sort-destructure-keys";
import pluginSortKeysFix from "eslint-plugin-sort-keys-fix";
import pluginSortReactDependency from "eslint-plugin-sort-react-dependency-arrays";
import sqlTemplate from "eslint-plugin-sql-template";
import pluginSSR from "eslint-plugin-ssr-friendly";
import storybook from "eslint-plugin-storybook";
import styledA11y from "eslint-plugin-styled-components-a11y";
import pluginSwitchCase from "eslint-plugin-switch-case";
import tailwind from "eslint-plugin-tailwindcss";
import pluginTestingLibrary from "eslint-plugin-testing-library";
import eslintPluginToml from "eslint-plugin-toml";
import pluginTopLevel from "eslint-plugin-toplevel";
import pluginTotalFunctions from "eslint-plugin-total-functions";
import pluginTsdoc from "eslint-plugin-tsdoc";
import pluginUndefinedCss from "eslint-plugin-undefined-css-classes";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginUseMemo from "eslint-plugin-usememo-recommendations";
import pluginValidateJSX from "eslint-plugin-validate-jsx-nesting";
import pluginWriteGood from "eslint-plugin-write-good-comments";
import xss from "eslint-plugin-xss";
import eslintPluginYml from "eslint-plugin-yml";
import zod from "eslint-plugin-zod";
import globals from "globals";
import jsoncEslintParser from "jsonc-eslint-parser";
import path from "node:path";
import tomlEslintParser from "toml-eslint-parser";
import yamlEslintParser from "yaml-eslint-parser";
```
