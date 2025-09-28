// @ts-nocheck - generated config orchestrates heterogeneous plugin metadata.
'use strict';

const loadSharedModules = require('./shared-modules.js');
const {
    gatherPluginConfig,
    mergeLanguageOptions,
    deepMerge,
    extractConfigEntries,
    mergeConfigEntries
} = require('./utils.js');

const createParserMap = (modules) => ({
    '@typescript-eslint/parser': modules.tseslintParser,
    'jsonc-eslint-parser': modules.jsoncEslintParser,
    'yaml-eslint-parser': modules.yamlEslintParser,
    'toml-eslint-parser': modules.tomlEslintParser,
    '@html-eslint/parser': modules.htmlParser
});

const BASE_PLUGIN_EXCLUSIONS = new Set([
    '@typescript-eslint',
    'etc',
    'deprecation',
    'functional',
    'neverthrow',
    'total-functions',
    'exception-handling',
    'xss',
    '@vitest',
    'testing-library',
    'playwright',
    'storybook'
]);

const STORIES_GLOBS = ['**/*.stories.@(js|jsx|ts|tsx|mdx)', '**/.storybook/**/*.{js,ts}'];
const TEST_GLOBS = ['**/*.{test,spec}.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'];
const E2E_GLOBS = ['**/*.{e2e,playwright}.{js,ts}', '**/playwright/**/*.{js,ts}'];

module.exports = (async () => {
    const modules = await loadSharedModules();
    const parserMap = createParserMap(modules);

    const pluginMap = {};
    const baseAggregate = { rules: {}, settings: {}, languageOptions: {} };
    const manualPlugins = new Set();

    const registerPlugin = (pluginName, pluginValue) => {
        if (!pluginName || !pluginValue) {
            return;
        }

        if (!pluginMap[pluginName]) {
            pluginMap[pluginName] = modules.fixupPluginRules(pluginValue);
        }

        const aliasList = modules.__pluginAliasLookup?.get(pluginName) || [];
        for (const alias of aliasList) {
            if (!pluginMap[alias]) {
                pluginMap[alias] = pluginMap[pluginName];
            }
        }
    };

    const prefixPluginRules = (pluginName, pluginValue, rules = {}) => {
        if (!pluginName) {
            return { ...rules };
        }

        const normalized = {};
        const definedRules = new Set(
            Object.keys(pluginValue?.rules || {}).map((ruleKey) =>
                ruleKey.includes('/') ? ruleKey : `${pluginName}/${ruleKey}`
            )
        );

        for (const [ruleName, ruleValue] of Object.entries(rules || {})) {
            if (!ruleName) {
                continue;
            }

            if (ruleName.includes('/')) {
                normalized[ruleName] = ruleValue;
                continue;
            }

            if (definedRules.has(`${pluginName}/${ruleName}`) || definedRules.has(ruleName)) {
                normalized[`${pluginName}/${ruleName}`] = ruleValue;
            } else {
                normalized[ruleName] = ruleValue;
            }
        }

        return normalized;
    };

    const mergeExternalConfig = (configObject) => {
        if (!configObject) {
            return;
        }

        const entries = extractConfigEntries(configObject, parserMap, []);
        if (!entries.length) {
            return;
        }

        const merged = mergeConfigEntries(entries, parserMap);
        Object.assign(baseAggregate.rules, merged.rules);
        baseAggregate.settings = deepMerge(baseAggregate.settings, merged.settings);
        baseAggregate.languageOptions = mergeLanguageOptions(baseAggregate.languageOptions, merged.languageOptions);

        if (merged.plugins) {
            for (const [childName, childPlugin] of Object.entries(merged.plugins)) {
                registerPlugin(childName, childPlugin);
            }
        }
    };

    for (const [pluginName, rawPlugin] of modules.__pluginEntries) {
        const resolvedPlugin = rawPlugin?.default ?? rawPlugin;

        registerPlugin(pluginName, resolvedPlugin);

        if (!resolvedPlugin || !resolvedPlugin.rules || !Object.keys(resolvedPlugin.rules).length) {
            manualPlugins.add(pluginName);
            continue;
        }

        const pluginConfig = gatherPluginConfig(pluginName, resolvedPlugin, parserMap);
        if (!pluginConfig) {
            manualPlugins.add(pluginName);
            continue;
        }

        if (BASE_PLUGIN_EXCLUSIONS.has(pluginName)) {
            manualPlugins.add(pluginName);
            continue;
        }

        Object.assign(baseAggregate.rules, prefixPluginRules(pluginName, resolvedPlugin, pluginConfig.rules));
        baseAggregate.settings = deepMerge(baseAggregate.settings, pluginConfig.settings);
        baseAggregate.languageOptions = mergeLanguageOptions(baseAggregate.languageOptions, pluginConfig.languageOptions);

        if (pluginConfig.plugins) {
            for (const [childName, childPlugin] of Object.entries(pluginConfig.plugins)) {
                registerPlugin(childName, childPlugin);
            }
        }
    }

    if (modules.pluginComments?.recommended) {
        mergeExternalConfig(modules.pluginComments.recommended);
        manualPlugins.delete('@eslint-community/eslint-comments');
    }

    mergeExternalConfig(modules.js?.configs?.recommended);

    if (pluginMap.security && modules.pluginSecurity?.rules?.['detect-bidi-characters']) {
        pluginMap.security.rules = {
            ...pluginMap.security.rules,
            'detect-bidi-characters': modules.pluginSecurity.rules['detect-bidi-characters']
        };
    }

    if (
        pluginMap['@eslint-community/eslint-comments'] &&
        modules.pluginComments?.recommended?.plugins?.['@eslint-community/eslint-comments']
    ) {
        const sourcePlugin = modules.fixupPluginRules(
            modules.pluginComments.recommended.plugins['@eslint-community/eslint-comments']
        );
        pluginMap['@eslint-community/eslint-comments'].rules = {
            ...pluginMap['@eslint-community/eslint-comments'].rules,
            ...sourcePlugin.rules
        };
    }

    delete baseAggregate.languageOptions.parser;
    if (baseAggregate.languageOptions.parserOptions) {
        delete baseAggregate.languageOptions.parserOptions.project;
        delete baseAggregate.languageOptions.parserOptions.tsconfigRootDir;
    }

    const manualRuleAdditions = {
        '@jcoreio/implicit-dependencies/no-implicit': ['error', { dev: true, peer: true }],
        '@metamask/design-tokens/no-deprecated-classnames': 'error',
        '@metamask/design-tokens/color-no-hex': 'warn',
        '@metamask/design-tokens/prefer-theme-color-classnames': 'warn',
        '@docusaurus/string-literal-i18n-messages': 'off',
        '@rushstack/security/no-unsafe-regexp': 'error',
        '@eslint-react/no-unused-props': 'off',
        '@eslint-react/no-prop-types': 'off',
        'antfu/import-dedupe': 'error',
        'antfu/no-import-node-modules-by-path': 'error',
        'antfu/no-ts-export-equal': 'error',
        'antfu/consistent-list-newline': 'off',
        'canonical/import-specifier-newline': 'off',
        'clean-code/exception-handling': 'warn',
        'clean-code/feature-envy': 'warn',
        'clean-timer/assign-timer-id': 'error',
        'deprecation/deprecation': 'off',
        'filename-export/match-default-export': 'off',
        'filename-export/match-named-export': 'off',
        'format-sql/format': 'warn',
        'goodeffects/enforceNamedEffectCallbacks': 'warn',
        'loadable-imports/sort': 'warn',
        'no-barrel-files/no-barrel-files': 'warn',
        'no-constructor-bind/no-constructor-bind': 'error',
        'no-constructor-bind/no-constructor-state': 'error',
        'no-function-declare-after-return/no-function-declare-after-return': 'error',
        'no-hardcoded-strings/no-hardcoded-strings': 'off',
        'no-only-tests/no-only-tests': 'error',
        'no-secrets/no-secrets': 'error',
        'no-secrets/no-pattern-match': 'warn',
        'no-unary-plus/no-unary-plus': 'warn',
        'no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw': 'error',
        'prefer-arrow/prefer-arrow-functions': [
            'warn',
            {
                disallowPrototype: true,
                singleReturnOnly: true,
                classPropertiesAllowed: false
            }
        ],
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'lf'
            }
        ],
        'react-require-testid/testid-missing': 'warn',
        'react-useeffect/no-non-function-return': 'error',
        'require-jsdoc/require-jsdoc': 'off',
        'sort-destructure-keys/sort-destructure-keys': 'warn',
        'sort-keys-fix/sort-keys-fix': ['warn', 'asc', { natural: true, caseSensitive: false }],
        'sort-react-dependency-arrays/sort': 'warn',
        'sql-template/no-unsafe-query': 'error',
        'toplevel/no-toplevel-var': 'warn',
        'toplevel/no-toplevel-let': 'warn',
        'toplevel/no-toplevel-side-effect': 'off',
        'tsdoc/syntax': 'warn',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            {
                args: 'after-used',
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                ignoreRestSiblings: true
            }
        ],
        'usememo-recommendations/detect-heavy-operations': 'warn',
        'validate-jsx-nesting/no-invalid-jsx-nesting': 'error',
        'write-good-comments/write-good-comments': 'off',
        'zod/prefer-enum': 'warn',
        'zod/require-strict': 'warn'
    };

    const baseRules = {
        ...baseAggregate.rules,
        ...manualRuleAdditions,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
    };

    const typePluginEntries = [
        ['@typescript-eslint', modules.tseslint],
        ['etc', modules.etc],
        ['deprecation', modules.pluginDeprecation],
        ['functional', modules.pluginFunctional],
        ['neverthrow', modules.pluginNeverThrow],
        ['total-functions', modules.pluginTotalFunctions]
    ];

    const typeRules = {};
    let typeLanguageOptions = {};
    let typeSettings = {};

    for (const [pluginName, pluginValue] of typePluginEntries) {
        if (!pluginValue) {
            continue;
        }

        const pluginConfig = gatherPluginConfig(pluginName, pluginValue, parserMap);
        if (!pluginConfig) {
            manualPlugins.add(pluginName);
            continue;
        }

        Object.assign(typeRules, prefixPluginRules(pluginName, pluginValue, pluginConfig.rules));
        typeSettings = deepMerge(typeSettings, pluginConfig.settings);
        typeLanguageOptions = mergeLanguageOptions(typeLanguageOptions, pluginConfig.languageOptions);

        if (pluginConfig.plugins) {
            for (const [childName, childPlugin] of Object.entries(pluginConfig.plugins)) {
                registerPlugin(childName, childPlugin);
            }
        }

        manualPlugins.delete(pluginName);
    }

    typeRules['deprecation/deprecation'] = typeRules['deprecation/deprecation'] || 'warn';
    typeRules['@eslint-react/no-unused-props'] = 'warn';

    delete typeLanguageOptions.parserOptions?.project;
    delete typeLanguageOptions.parserOptions?.tsconfigRootDir;

    const baseLanguageOptions = mergeLanguageOptions(
        {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: {
                ...modules.globals.browser,
                ...modules.globals.node,
                ...modules.globals.es2024
            }
        },
        baseAggregate.languageOptions
    );

    baseLanguageOptions.sourceType = 'module';
    delete baseLanguageOptions.parser;
    if (baseLanguageOptions.parserOptions) {
        delete baseLanguageOptions.parserOptions.project;
        delete baseLanguageOptions.parserOptions.tsconfigRootDir;
    }

    const tsconfigPath = modules.path.resolve(__dirname, '../../tests/fixtures/tsconfig.json');

    const sharedSettings = deepMerge(baseAggregate.settings, {
        react: { version: 'detect' },
        'import/resolver': {
            node: {
                extensions: ['.js', '.cjs', '.mjs', '.jsx', '.ts', '.tsx']
            },
            typescript: {
                alwaysTryTypes: true,
                project: [tsconfigPath]
            }
        },
        'boundaries/elements': [
            { type: 'external', pattern: 'node_modules/**' },
            { type: 'config', pattern: '{config,configs,.*}/**' },
            { type: 'src', pattern: '{src,app}/**' },
            { type: 'tests', pattern: '{test,tests,stories}/**' }
        ],
        'boundaries/ignore': ['**/*.stories.*', '**/*.test.*', '**/*.spec.*']
    });

    const recommendedConfig = [
        modules.gitignore(),
        {
            name: 'typpis/base',
            files: ['**/*.{js,cjs,mjs,jsx,ts,tsx}'],
            plugins: pluginMap,
            languageOptions: baseLanguageOptions,
            settings: sharedSettings,
            rules: baseRules,
            linterOptions: {
                reportUnusedDisableDirectives: true
            }
        },
        {
            name: 'typpis/typescript',
            files: ['**/*.{ts,tsx}'],
            languageOptions: mergeLanguageOptions(baseLanguageOptions, {
                parser: modules.tseslintParser,
                parserOptions: {
                    project: [tsconfigPath],
                    tsconfigRootDir: modules.path.resolve(__dirname, '../../')
                }
            }),
            settings: deepMerge(sharedSettings, typeSettings),
            rules: {
                ...typeRules,
                '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
                'total-functions/require-strict-mode': 'off'
            }
        },
        {
            name: 'typpis/react-jsx',
            files: ['**/*.{jsx,tsx}'],
            rules: {
                'react/jsx-uses-react': 'off',
                'react/react-in-jsx-scope': 'off',
                'react-refresh/only-export-components': 'off'
            }
        },
        {
            name: 'typpis/vitest',
            files: TEST_GLOBS,
            languageOptions: mergeLanguageOptions(baseLanguageOptions, {
                globals: modules.globals.vitest
            }),
            rules: {
                'vitest/expect-expect': 'warn',
                'vitest/no-focused-tests': 'error'
            }
        },
        {
            name: 'typpis/testing-library',
            files: TEST_GLOBS,
            rules: {
                'testing-library/prefer-screen-queries': 'warn',
                'testing-library/no-node-access': 'error'
            }
        },
        {
            name: 'typpis/playwright',
            files: E2E_GLOBS,
            rules: {
                'playwright/no-focused-tests': 'error',
                'playwright/expect-expect': 'warn'
            }
        },
        {
            name: 'typpis/mdx',
            files: ['**/*.mdx'],
            plugins: {
                mdx: modules.mdx,
                markdown: modules.markdown
            },
            processor: modules.mdx.processors?.mdx,
            languageOptions: mergeLanguageOptions({}, { parser: modules.eslintMdx?.Parser ?? modules.eslintMdx }),
            rules: modules.mdx.configs?.recommended?.rules || {
                'mdx/no-jsx-html-comments': 'error'
            }
        },
        {
            name: 'typpis/markdown',
            files: ['**/*.md'],
            plugins: {
                markdown: modules.markdown
            },
            processor: modules.markdown.processors.markdown
        },
        {
            name: 'typpis/html',
            files: ['**/*.html'],
            languageOptions: mergeLanguageOptions({}, { parser: modules.htmlParser }),
            plugins: {
                '@html-eslint': modules.html
            },
            rules: modules.html.configs['flat/recommended']?.rules || modules.html.configs.recommended.rules
        },
        {
            name: 'typpis/json',
            files: ['**/*.json'],
            languageOptions: mergeLanguageOptions({}, { parser: modules.jsoncEslintParser }),
            plugins: {
                json: modules.json
            },
            rules: modules.json.configs.recommended.rules
        },
        {
            name: 'typpis/jsonc',
            files: ['**/*.jsonc'],
            languageOptions: mergeLanguageOptions({}, { parser: modules.jsoncEslintParser }),
            plugins: {
                jsonc: modules.eslintPluginJsonc
            },
            rules: modules.eslintPluginJsonc.configs?.recommended?.rules || {}
        },
        {
            name: 'typpis/yaml',
            files: ['**/*.{yaml,yml}'],
            languageOptions: mergeLanguageOptions({}, { parser: modules.yamlEslintParser }),
            plugins: {
                yml: modules.eslintPluginYml
            },
            rules: modules.eslintPluginYml.configs?.recommended?.rules || {}
        },
        {
            name: 'typpis/toml',
            files: ['**/*.toml'],
            languageOptions: mergeLanguageOptions({}, { parser: modules.tomlEslintParser }),
            plugins: {
                toml: modules.eslintPluginToml
            },
            rules: modules.eslintPluginToml.configs?.recommended?.rules || {}
        },
        modules.eslintConfigPrettier
    ];

    ['@typescript-eslint', 'etc', 'deprecation', 'functional', 'neverthrow', 'total-functions', '@vitest', 'testing-library', 'playwright'].forEach((
        handled
    ) => manualPlugins.delete(handled));

    recommendedConfig.manualPlugins = Array.from(manualPlugins).sort();

    return recommendedConfig;
})();
