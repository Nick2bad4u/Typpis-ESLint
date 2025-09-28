'use strict';

const path = require('node:path');
const recommendedPromise = require('./configs/recommended.js');
const allPromise = require('./configs/all.js');
const { deepMerge } = require('./configs/utils.js');

/**
 * @typedef {import('eslint').Linter.FlatConfig} FlatConfig
 * @typedef {Array<FlatConfig & { name?: string }>} FlatConfigList
 * @typedef {FlatConfigList & { manualPlugins?: string[], strictNotes?: Record<string, unknown> }} TyppisFlatConfigArray
 */

/**
 * @template T
 * @param {T | T[] | null | undefined} value
 * @returns {T[]}
 */
const arrayify = (value) => {
    if (value == null) {
        return [];
    }

    return Array.isArray(value) ? value.slice() : [value];
};

/**
 * @param {string | undefined} rootDir
 * @returns {string}
 */
const normalizeRootDir = (rootDir) => {
    if (!rootDir) {
        return process.cwd();
    }

    return path.resolve(rootDir);
};

/**
 * @param {FlatConfig & { name?: string }} entry
 * @returns {FlatConfig & { name?: string }}
 */
const cloneConfigEntry = (entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return entry;
    }

    const cloned = { ...entry };

    if (entry.rules) {
        cloned.rules = { ...entry.rules };
    }

    if (entry.settings) {
        cloned.settings = deepMerge({}, entry.settings);
    }

    if (entry.languageOptions) {
        cloned.languageOptions = { ...entry.languageOptions };
        if (entry.languageOptions.globals) {
            cloned.languageOptions.globals = { ...entry.languageOptions.globals };
        }

        if (entry.languageOptions.parserOptions) {
            cloned.languageOptions.parserOptions = {
                ...entry.languageOptions.parserOptions
            };
        }
    }

    if (entry.plugins) {
        cloned.plugins = { ...entry.plugins };
    }

    if (entry.linterOptions) {
        cloned.linterOptions = { ...entry.linterOptions };
    }

    if (entry.processor && typeof entry.processor === 'object') {
        cloned.processor = { ...entry.processor };
    }

    return cloned;
};

/**
 * @param {TyppisFlatConfigArray} configEntries
 * @param {string[]} projects
 * @param {string} rootDir
 * @returns {void}
 */
const applyTypeScriptProjects = (configEntries, projects, rootDir) => {
    const typescriptEntry = configEntries.find((entry) => entry?.name === 'typpis/typescript');
    if (!typescriptEntry || !typescriptEntry.languageOptions) {
        return;
    }

    const parserOptions = {
        ...typescriptEntry.languageOptions.parserOptions,
        project: projects,
        tsconfigRootDir: rootDir
    };

    typescriptEntry.languageOptions = {
        ...typescriptEntry.languageOptions,
        parserOptions
    };

    if (typescriptEntry.settings) {
        typescriptEntry.settings = deepMerge({}, typescriptEntry.settings);
    }
};

/**
 * @param {TyppisFlatConfigArray} configEntries
 * @param {string[]} projects
 * @param {string} rootDir
 * @returns {void}
 */
const applyImportResolverProjects = (configEntries, projects, rootDir) => {
    const baseEntry = configEntries.find((entry) => entry?.name === 'typpis/base');
    if (!baseEntry || !baseEntry.settings) {
        return;
    }

    const resolverSettings = /** @type {Record<string, unknown> | undefined} */ (baseEntry.settings['import/resolver']);
    if (!resolverSettings) {
        return;
    }

    const typescriptResolver = /** @type {Record<string, unknown> | undefined} */ (resolverSettings.typescript);
    if (!typescriptResolver) {
        return;
    }

    baseEntry.settings = deepMerge({}, baseEntry.settings);
    baseEntry.settings['import/resolver'] = {
        ...resolverSettings,
        typescript: {
            ...typescriptResolver,
            project: projects,
            tsconfigRootDir: rootDir
        }
    };
};

/**
 * @param {TyppisFlatConfigArray} configEntries
 * @param {string[]} ignores
 * @returns {void}
 */
const prependIgnores = (configEntries, ignores) => {
    if (!ignores || ignores.length === 0) {
        return;
    }

    configEntries.unshift({
        name: 'typpis/custom-ignores',
        ignores
    });
};

/**
 * @typedef {Object} TyppisConfigOptions
 * @property {'recommended' | 'all'} [preset='recommended'] - Selects the base preset to build from.
 * @property {string | string[]} [tsconfigPath='tsconfig.json'] - One or more tsconfig paths forwarded to the TypeScript parser.
 * @property {string} [tsconfigRootDir=process.cwd()] - Root directory used to resolve relative tsconfig paths.
 * @property {string | string[]} [ignores] - Optional glob patterns injected ahead of the Typpis ignores.
 * @property {(config: TyppisFlatConfigArray) => void} [transform] - Optional callback that can mutate the generated config before it is returned.
 */

/**
 * @public
 * @param {TyppisConfigOptions} [options]
 * @returns {Promise<TyppisFlatConfigArray>}
 */
const createTyppisConfig = async (options = {}) => {
    const {
        preset = 'recommended',
        tsconfigPath = 'tsconfig.json',
        tsconfigRootDir,
        ignores: ignorePatterns,
        transform
    } = options;

    const base = /** @type {TyppisFlatConfigArray} */ (
        await (preset === 'all' ? allPromise : recommendedPromise)
    );
    const rootDir = normalizeRootDir(tsconfigRootDir);
    const projects = arrayify(tsconfigPath);

    if (projects.length === 0) {
        throw new Error('Typpis config requires at least one tsconfigPath entry when using typed rules.');
    }

    const config = /** @type {TyppisFlatConfigArray} */ (base.map(cloneConfigEntry));

    if (Array.isArray(base.manualPlugins)) {
        config.manualPlugins = [...base.manualPlugins];
    }

    if (base.strictNotes) {
        config.strictNotes = { ...base.strictNotes };
    }

    const ignores = arrayify(ignorePatterns);
    prependIgnores(config, ignores);

    applyTypeScriptProjects(config, projects, rootDir);
    applyImportResolverProjects(config, projects, rootDir);

    if (typeof transform === 'function') {
        transform(config);
    }

    return config;
};

module.exports = createTyppisConfig;
module.exports.createTyppisConfig = createTyppisConfig;
module.exports.default = createTyppisConfig;
