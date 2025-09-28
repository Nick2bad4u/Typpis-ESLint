// @ts-nocheck - utility helpers operate on heterogeneous plugin metadata.
'use strict';

const KEY_PRIORITY = [
    'flat/recommended-type-checked',
    'flat/recommended',
    'flat/react',
    'flat/dom',
    'flat/csf',
    'flat/all',
    'recommended-type-checked',
    'recommended-requiring-type-checking',
    'recommended-latest',
    'recommended-modern',
    'recommended-error',
    'recommended-warn',
    'recommended-alphabetical',
    'recommended-line-length',
    'recommended-natural',
    'recommended-custom',
    'recommended',
    'react',
    'dom',
    'vue',
    'angular',
    'svelte',
    'marko',
    'csf',
    'all',
    'base'
];

const PLUGIN_PREFERENCES = new Map([
    ['@typescript-eslint', ['flat/recommended', 'flat/recommended-type-checked']],
    ['@eslint-react', ['recommended-type-checked', 'recommended']],
    ['react', ['flat', 'recommended']],
    ['react-hooks', ['recommended']],
    ['@vitest', ['flat/recommended', 'recommended']],
    ['storybook', ['flat/recommended', 'recommended']],
    ['unicorn', ['flat/recommended', 'recommended']],
    ['playwright', ['recommended']],
    ['tailwindcss', ['recommended']],
    ['testing-library', ['flat/react', 'react', 'dom']],
    ['perfectionist', ['recommended-alphabetical', 'recommended']],
    ['react-perf', ['recommended']],
    ['react-refresh', ['recommended']],
    ['react-dom', ['recommended']],
    ['react-hook-form', ['recommended']],
    ['react-hooks-addons', ['recommended']],
    ['react-hooks-extra', ['recommended']],
    ['react-naming-convention', ['recommended']],
    ['react-web-api', ['recommended']],
    ['react-compiler', ['recommended']],
    ['react-useeffect', ['recommended']],
    ['react-require-testid', ['recommended']],
    ['@rushstack/security', ['recommended']],
    ['@arthurgeron/react-usememo', ['flat/recommended', 'recommended']],
    ['@docusaurus', ['recommended']],
    ['prefer-function-component', ['recommended']],
    ['react-hook-form', ['recommended']],
    ['jsx-a11y', ['strict', 'recommended']],
    ['progress', ['recommended']],
    ['sonarjs', ['recommended']],
    ['security', ['recommended']],
    ['promise', ['recommended']],
    ['compat', ['recommended']],
    ['node', ['recommended-module', 'recommended']],
    ['n', ['recommended-module', 'recommended']],
    ['markdown', ['recommended']],
    ['json', ['recommended']],
    ['yml', ['recommended']],
    ['toml', ['recommended']],
    ['mdx', ['recommended']],
    ['jsdoc', ['recommended']]
]);

const STRICT_PLUGIN_PREFERENCES = new Map([
    ['@typescript-eslint', ['flat/strict-type-checked', 'flat/all']],
    ['react', ['flat/all', 'all']],
    ['unicorn', ['flat/all', 'all']],
    ['perfectionist', ['recommended-custom', 'recommended-line-length']],
    ['tailwindcss', ['recommended-error']],
    ['testing-library', ['flat/react', 'react']],
    ['jsx-a11y', ['strict', 'recommended']],
    ['sonarjs', ['recommended']],
    ['security', ['recommended']],
    ['playwright', ['recommended']],
    ['storybook', ['flat/csf', 'flat/recommended']],
    ['react-hooks', ['recommended']],
    ['react-hooks-extra', ['recommended']],
    ['react-hooks-addons', ['recommended']],
    ['react-perf', ['recommended']],
    ['react-refresh', ['recommended']],
    ['react-useeffect', ['recommended']],
    ['react-require-testid', ['recommended']],
    ['react-web-api', ['recommended']],
    ['react-compiler', ['recommended']],
    ['react-dom', ['recommended']],
    ['progress', ['recommended']],
    ['promise', ['recommended']],
    ['compat', ['recommended']],
    ['markdown', ['recommended']],
    ['json', ['recommended']],
    ['yml', ['recommended']],
    ['toml', ['recommended']],
    ['mdx', ['recommended']],
    ['jsdoc', ['recommended']]
]);

const arrayify = (value) => {
    if (!value) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
};

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const isRuleSeverity = (value) => {
    if (typeof value === 'string' || typeof value === 'number') {
        return true;
    }

    if (Array.isArray(value) && value.length > 0) {
        const [severity] = value;
        return typeof severity === 'string' || typeof severity === 'number';
    }

    return false;
};

const deepMerge = (target = {}, source = {}) => {
    const output = { ...target };

    for (const [key, value] of Object.entries(source)) {
        if (isPlainObject(value) && isPlainObject(output[key])) {
            output[key] = deepMerge(output[key], value);
        } else if (Array.isArray(value)) {
            output[key] = value.slice();
        } else if (value !== undefined) {
            output[key] = value;
        }
    }

    return output;
};

const mergeLanguageOptions = (base = {}, addition = {}) => {
    const merged = { ...base };
    if (addition.ecmaVersion && addition.ecmaVersion > (base.ecmaVersion || 0)) {
        merged.ecmaVersion = addition.ecmaVersion;
    } else if (base.ecmaVersion && merged.ecmaVersion === undefined) {
        merged.ecmaVersion = base.ecmaVersion;
    }

    if (addition.sourceType) {
        merged.sourceType = addition.sourceType;
    } else if (base.sourceType && !merged.sourceType) {
        merged.sourceType = base.sourceType;
    }

    if (addition.parser) {
        merged.parser = addition.parser;
    }

    merged.globals = { ...(base.globals || {}), ...(addition.globals || {}) };
    merged.parserOptions = deepMerge(base.parserOptions || {}, addition.parserOptions || {});
    merged.parserOptions.project = addition.parserOptions?.project || merged.parserOptions.project;
    merged.parserOptions.tsconfigRootDir = addition.parserOptions?.tsconfigRootDir || merged.parserOptions.tsconfigRootDir;

    return merged;
};

const normalizeParser = (parser, parserMap) => {
    if (typeof parser === 'string' && parserMap[parser]) {
        return parserMap[parser];
    }

    return parser;
};

const extractConfigEntries = (config, parserMap, results = []) => {
    if (!config) {
        return results;
    }

    if (Array.isArray(config)) {
        for (const item of config) {
            extractConfigEntries(item, parserMap, results);
        }
        return results;
    }

    if (typeof config !== 'object') {
        return results;
    }

    if (
        config.rules ||
        config.languageOptions ||
        config.settings ||
        config.plugins ||
        config.processor ||
        config.name ||
        config.ignores
    ) {
        if (config.rules && Object.keys(config.rules).length > 0) {
            const hasSeverityEntries = Object.values(config.rules).some(isRuleSeverity);
            if (!hasSeverityEntries) {
                return results;
            }
        }

        results.push(config);
        return results;
    }

    for (const key of KEY_PRIORITY) {
        if (config[key]) {
            extractConfigEntries(config[key], parserMap, results);
            if (results.length > 0) {
                return results;
            }
        }
    }

    for (const value of Object.values(config)) {
        extractConfigEntries(value, parserMap, results);
        if (results.length > 0) {
            return results;
        }
    }

    return results;
};

const normalizeConfigEntry = (entry, parserMap) => {
    const normalized = {
        rules: {},
        settings: {},
        languageOptions: {},
        plugins: {}
    };

    if (entry.rules) {
        Object.assign(normalized.rules, entry.rules);
    }

    if (entry.settings) {
        normalized.settings = deepMerge(normalized.settings, entry.settings);
    }

    if (entry.plugins) {
        const pluginEntries = entry.plugins;
        if (Array.isArray(pluginEntries)) {
            for (const pluginEntry of pluginEntries) {
                if (pluginEntry && typeof pluginEntry === 'object') {
                    Object.assign(normalized.plugins, pluginEntry);
                }
            }
        } else if (typeof pluginEntries === 'object') {
            Object.assign(normalized.plugins, pluginEntries);
        }
    }

    const languageOptions = entry.languageOptions ? { ...entry.languageOptions } : {};
    if (entry.globals) {
        languageOptions.globals = { ...(languageOptions.globals || {}), ...entry.globals };
    }

    if (entry.parserOptions) {
        languageOptions.parserOptions = { ...(languageOptions.parserOptions || {}), ...entry.parserOptions };
    }

    if (languageOptions.parser) {
        languageOptions.parser = normalizeParser(languageOptions.parser, parserMap);
    }

    normalized.languageOptions = mergeLanguageOptions(normalized.languageOptions, languageOptions);

    return normalized;
};

const mergeConfigEntries = (entries, parserMap) => {
    const merged = { rules: {}, settings: {}, languageOptions: {}, plugins: {} };

    for (const entry of entries) {
        const normalized = normalizeConfigEntry(entry, parserMap);
        Object.assign(merged.rules, normalized.rules);
        merged.settings = deepMerge(merged.settings, normalized.settings);
        merged.languageOptions = mergeLanguageOptions(merged.languageOptions, normalized.languageOptions);
        Object.assign(merged.plugins, normalized.plugins);
    }

    return merged;
};

const gatherPluginConfig = (pluginName, plugin, parserMap, preferences = []) => {
    const resolved = plugin?.default ?? plugin;
    if (!resolved) {
        return null;
    }

    const preferKeys = [
        ...(Array.isArray(preferences) ? preferences : []),
        ...(PLUGIN_PREFERENCES.get(pluginName) || [])
    ];

    const sources = [];
    if (resolved.flatConfigs) {
        sources.push(resolved.flatConfigs);
    }

    if (resolved.configs) {
        sources.push(resolved.configs);
    }

    if (resolved.config) {
        sources.push(resolved.config);
    }

    if (resolved.flatConfig) {
        sources.push(resolved.flatConfig);
    }

    for (const source of sources) {
        const entries = extractConfigEntries(source, parserMap, []);
        if (entries.length > 0) {
            return mergeConfigEntries(entries, parserMap);
        }

        for (const key of preferKeys.concat(KEY_PRIORITY)) {
            if (source && source[key]) {
                const nestedEntries = extractConfigEntries(source[key], parserMap, []);
                if (nestedEntries.length > 0) {
                    return mergeConfigEntries(nestedEntries, parserMap);
                }
            }
        }
    }

    return null;
};

const gatherStrictPluginConfig = (pluginName, plugin, parserMap) => {
    const resolved = plugin?.default ?? plugin;
    if (!resolved) {
        return null;
    }

    const preferKeys = STRICT_PLUGIN_PREFERENCES.get(pluginName);
    if (!preferKeys) {
        return null;
    }

    const sources = [];
    if (resolved.flatConfigs) {
        sources.push(resolved.flatConfigs);
    }

    if (resolved.configs) {
        sources.push(resolved.configs);
    }

    if (resolved.config) {
        sources.push(resolved.config);
    }

    if (resolved.flatConfig) {
        sources.push(resolved.flatConfig);
    }

    for (const source of sources) {
        for (const key of preferKeys.concat(KEY_PRIORITY)) {
            if (source && source[key]) {
                const entries = extractConfigEntries(source[key], parserMap, []);
                if (entries.length > 0) {
                    return mergeConfigEntries(entries, parserMap);
                }
            }
        }
    }

    return null;
};

module.exports = {
    KEY_PRIORITY,
    PLUGIN_PREFERENCES,
    STRICT_PLUGIN_PREFERENCES,
    arrayify,
    deepMerge,
    mergeLanguageOptions,
    normalizeParser,
    gatherPluginConfig,
    gatherStrictPluginConfig,
    extractConfigEntries,
    mergeConfigEntries
};
