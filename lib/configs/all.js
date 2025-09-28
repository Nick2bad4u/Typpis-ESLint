// @ts-nocheck - generated strict config enriches heterogeneous plugin metadata.
"use strict";

const loadSharedModules = require("./shared-modules.js");
const {
  gatherStrictPluginConfig,
  mergeLanguageOptions,
  deepMerge,
  extractConfigEntries,
  mergeConfigEntries,
} = require("./utils.js");

const createParserMap = (modules) => ({
  "@typescript-eslint/parser": modules.tseslintParser,
  "jsonc-eslint-parser": modules.jsoncEslintParser,
  "yaml-eslint-parser": modules.yamlEslintParser,
  "toml-eslint-parser": modules.tomlEslintParser,
  "@html-eslint/parser": modules.htmlParser,
});

const TYPE_ONLY_STRICT_PLUGINS = new Set([
  "@typescript-eslint",
  "deprecation",
  "functional",
  "neverthrow",
  "total-functions",
  "etc",
]);

module.exports = (async () => {
  const recommended = await require("./recommended.js");
  const modules = await loadSharedModules();
  const parserMap = createParserMap(modules);

  const strictAggregate = { rules: {}, settings: {}, languageOptions: {} };
  const strictTypeAggregate = { rules: {}, settings: {}, languageOptions: {} };

  const prefixPluginRules = (pluginName, pluginValue, rules = {}) => {
    if (!pluginName) {
      return { ...rules };
    }

    const normalized = {};
    const definedRules = new Set(
      Object.keys(pluginValue?.rules || {}).map((ruleKey) =>
        ruleKey.includes("/") ? ruleKey : `${pluginName}/${ruleKey}`,
      ),
    );

    for (const [ruleName, ruleValue] of Object.entries(rules)) {
      if (!ruleName) {
        continue;
      }

      if (ruleName.includes("/")) {
        normalized[ruleName] = ruleValue;
        continue;
      }

      if (
        definedRules.has(`${pluginName}/${ruleName}`) ||
        definedRules.has(ruleName)
      ) {
        normalized[`${pluginName}/${ruleName}`] = ruleValue;
      } else {
        normalized[ruleName] = ruleValue;
      }
    }

    return normalized;
  };

  for (const [pluginName, rawPlugin] of modules.__pluginEntries) {
    const resolved = rawPlugin?.default ?? rawPlugin;
    if (!resolved || !resolved.rules) {
      continue;
    }

    if (pluginName === "perfectionist") {
      continue;
    }

    const strictConfig = gatherStrictPluginConfig(
      pluginName,
      resolved,
      parserMap,
    );
    if (!strictConfig) {
      continue;
    }

    const targetAggregate = TYPE_ONLY_STRICT_PLUGINS.has(pluginName)
      ? strictTypeAggregate
      : strictAggregate;

    Object.assign(
      targetAggregate.rules,
      prefixPluginRules(pluginName, resolved, strictConfig.rules),
    );
    targetAggregate.settings = deepMerge(
      targetAggregate.settings,
      strictConfig.settings,
    );
    targetAggregate.languageOptions = mergeLanguageOptions(
      targetAggregate.languageOptions,
      strictConfig.languageOptions,
    );
  }

  const mergeConfigObject = (configObject) => {
    const entries = extractConfigEntries(configObject, parserMap, []);
    if (!entries.length) {
      return;
    }

    const merged = mergeConfigEntries(entries, parserMap);
    Object.assign(strictAggregate.rules, merged.rules);
    strictAggregate.settings = deepMerge(
      strictAggregate.settings,
      merged.settings,
    );
    strictAggregate.languageOptions = mergeLanguageOptions(
      strictAggregate.languageOptions,
      merged.languageOptions,
    );
  };

  mergeConfigObject(modules.js.configs.all);

  delete strictAggregate.languageOptions.parser;
  if (strictAggregate.languageOptions.parserOptions) {
    delete strictAggregate.languageOptions.parserOptions.project;
    delete strictAggregate.languageOptions.parserOptions.tsconfigRootDir;
  }

  delete strictTypeAggregate.languageOptions.parser;
  if (strictTypeAggregate.languageOptions.parserOptions) {
    delete strictTypeAggregate.languageOptions.parserOptions.project;
    delete strictTypeAggregate.languageOptions.parserOptions.tsconfigRootDir;
  }

  const manualStrictRules = {
    "no-console": "error",
    "no-debugger": "error",
    "no-warning-comments": [
      "warn",
      { terms: ["todo", "fixme"], location: "anywhere" },
    ],
    "unicorn/no-null": "error",
    "unicorn/prevent-abbreviations": [
      "warn",
      {
        replacements: {
          props: false,
          ref: false,
          params: false,
        },
      },
    ],
    "unicorn/require-array-join-separator": "error",
    "unicorn/no-array-for-each": "warn",
    "promise/catch-or-return": "error",
    "promise/no-return-wrap": "error",
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-fs-filename": "warn",
    "sonarjs/cognitive-complexity": ["warn", 15],
    "no-magic-numbers": "off",
    "perfectionist/sort-objects": [
      "warn",
      {
        partitionByComment: true,
        type: "natural",
      },
    ],
    "perfectionist/sort-interfaces": ["warn", { type: "natural" }],
    "perfectionist/sort-heritage-clauses": "off",
    "perfectionist/sort-decorators": "off",
    "perfectionist/sort-modules": "off",
    "perfectionist/sort-imports": "off",
    "perfectionist/sort-exports": "off",
    "perfectionist/sort-named-imports": "off",
    "antfu/no-top-level-await": "error",
    "one-var": "off",
    "sort-imports": "off",
    "func-style": "off",
    "unused-imports/no-unused-vars": "error",
    "react-perf/jsx-no-new-function-as-prop": "error",
    "react-perf/jsx-no-new-object-as-prop": "warn",
    "react-hooks/exhaustive-deps": [
      "error",
      { additionalHooks: "use(Callback|Memo|Effect|LayoutEffect)" },
    ],
  };

  Object.assign(strictAggregate.rules, manualStrictRules);

  const allConfig = recommended.map((entry) => {
    if (!entry || typeof entry !== "object") {
      return entry;
    }

    if (entry.name === "typpis/base") {
      return {
        ...entry,
        rules: {
          ...entry.rules,
          ...strictAggregate.rules,
        },
        settings: deepMerge(entry.settings || {}, strictAggregate.settings),
        languageOptions: mergeLanguageOptions(
          entry.languageOptions || {},
          strictAggregate.languageOptions,
        ),
      };
    }

    if (entry.name === "typpis/typescript") {
      return {
        ...entry,
        rules: {
          ...entry.rules,
          ...strictTypeAggregate.rules,
          "@typescript-eslint/consistent-type-definitions": [
            "error",
            "interface",
          ],
          "@typescript-eslint/explicit-function-return-type": [
            "warn",
            { allowExpressions: true, allowTypedFunctionExpressions: true },
          ],
          "@typescript-eslint/prefer-readonly": "warn",
          "@typescript-eslint/no-explicit-any": "error",
          "@typescript-eslint/no-floating-promises": "error",
          "@typescript-eslint/no-confusing-void-expression": "error",
          "@typescript-eslint/no-unsafe-assignment": "error",
        },
        settings: deepMerge(entry.settings || {}, strictTypeAggregate.settings),
        languageOptions: mergeLanguageOptions(
          entry.languageOptions || {},
          strictTypeAggregate.languageOptions,
        ),
      };
    }

    if (entry.name === "typpis/testing-library") {
      return {
        ...entry,
        rules: {
          ...entry.rules,
          "testing-library/no-wait-for-empty-callback": "error",
        },
      };
    }

    if (entry.name === "typpis/playwright") {
      return {
        ...entry,
        rules: {
          ...entry.rules,
          "playwright/no-networkidle": "warn",
          "playwright/prefer-locator": "error",
        },
      };
    }

    return entry;
  });

  const prettierIndex = allConfig.findIndex(
    (config) => config === modules.eslintConfigPrettier,
  );
  if (prettierIndex !== -1) {
    const prettierConfig = allConfig.splice(prettierIndex, 1)[0];
    allConfig.push(prettierConfig);
  }

  allConfig.strictNotes = {
    inherits: "recommended",
    manualPluginConfiguration: recommended.manualPlugins,
  };

  return allConfig;
})();
