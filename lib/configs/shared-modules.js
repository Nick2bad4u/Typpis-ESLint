// @ts-nocheck - this helper dynamically imports the prescribed plugin list across mixed module formats.
'use strict';

let cached;

const moduleSpecs = [
    { name: 'pluginUseMemo2', specifier: '@arthurgeron/eslint-plugin-react-usememo', type: 'default' },
    { name: 'pluginDocusaurus', specifier: '@docusaurus/eslint-plugin', type: 'default' },
    { name: 'pluginComments', specifier: '@eslint-community/eslint-plugin-eslint-comments/configs', type: 'default' },
    { name: 'eslintReact', specifier: '@eslint-react/eslint-plugin', type: 'default' },
    { name: 'fixupPluginRules', specifier: '@eslint/compat', type: 'named', importName: 'fixupPluginRules' },
    { name: 'css', specifier: '@eslint/css', type: 'default' },
    { name: 'js', specifier: '@eslint/js', type: 'default' },
    { name: 'json', specifier: '@eslint/json', type: 'default' },
    { name: 'markdown', specifier: '@eslint/markdown', type: 'default' },
    { name: 'html', specifier: '@html-eslint/eslint-plugin', type: 'default' },
    { name: 'htmlParser', specifier: '@html-eslint/parser', type: 'namespace' },
    { name: 'implicitDependencies', specifier: '@jcoreio/eslint-plugin-implicit-dependencies', type: 'default' },
    { name: 'pluginDesignTokens', specifier: '@metamask/eslint-plugin-design-tokens', type: 'namespace' },
    { name: 'pluginMicrosoftSdl', specifier: '@microsoft/eslint-plugin-sdl', type: 'default' },
    { name: 'rushStackSecurity', specifier: '@rushstack/eslint-plugin-security', type: 'default' },
    { name: 'tseslint', specifier: '@typescript-eslint/eslint-plugin', type: 'default' },
    { name: 'tseslintParser', specifier: '@typescript-eslint/parser', type: 'default' },
    { name: 'vitest', specifier: '@vitest/eslint-plugin', type: 'default' },
    { name: 'gitignore', specifier: 'eslint-config-flat-gitignore', type: 'default' },
    { name: 'eslintConfigPrettier', specifier: 'eslint-config-prettier', type: 'default' },
    { name: 'createTypeScriptImportResolver', specifier: 'eslint-import-resolver-typescript', type: 'named', importName: 'createTypeScriptImportResolver' },
    { name: 'eslintMdx', specifier: 'eslint-mdx', type: 'namespace' },
    { name: 'antfu', specifier: 'eslint-plugin-antfu', type: 'default' },
    { name: 'arrayFunc', specifier: 'eslint-plugin-array-func', type: 'default' },
    { name: 'pluginBetterTailwindcss', specifier: 'eslint-plugin-better-tailwindcss', type: 'default' },
    { name: 'pluginBoundaries', specifier: 'eslint-plugin-boundaries', type: 'default' },
    { name: 'pluginCanonical', specifier: 'eslint-plugin-canonical', type: 'default' },
    { name: 'pluginCleanCode', specifier: 'eslint-plugin-clean-code', type: 'namespace' },
    { name: 'pluginCleanTimer', specifier: 'eslint-plugin-clean-timer', type: 'default' },
    { name: 'eslintPluginCommentLength', specifier: 'eslint-plugin-comment-length', type: 'default' },
    { name: 'pluginCompat', specifier: 'eslint-plugin-compat', type: 'default' },
    { name: 'pluginCssModules', specifier: 'eslint-plugin-css-modules', type: 'namespace' },
    { name: 'depend', specifier: 'eslint-plugin-depend', type: 'default' },
    { name: 'pluginDeprecation', specifier: 'eslint-plugin-deprecation', type: 'default' },
    { name: 'etc', specifier: 'eslint-plugin-etc', type: 'default' },
    { name: 'ex', specifier: 'eslint-plugin-exception-handling', type: 'named', importName: 'plugin' },
    { name: 'progress', specifier: 'eslint-plugin-file-progress', type: 'default' },
    { name: 'pluginFilenameExport', specifier: 'eslint-plugin-filename-export', type: 'default' },
    { name: 'pluginFormatSQL', specifier: 'eslint-plugin-format-sql', type: 'default' },
    { name: 'pluginFunctionNames', specifier: 'eslint-plugin-function-name', type: 'namespace' },
    { name: 'pluginFunctional', specifier: 'eslint-plugin-functional', type: 'default' },
    { name: 'pluginGoodEffects', specifier: 'eslint-plugin-goodeffects', type: 'default' },
    { name: 'pluginGranular', specifier: 'eslint-plugin-granular-selectors', type: 'default' },
    { name: 'importX', specifier: 'eslint-plugin-import-x', type: 'named', importName: 'importX' },
    { name: 'importZod', specifier: 'eslint-plugin-import-zod', type: 'default' },
    { name: 'istanbul', specifier: 'eslint-plugin-istanbul', type: 'default' },
    { name: 'eslintPluginJsonSchemaValidator', specifier: 'eslint-plugin-json-schema-validator', type: 'default' },
    { name: 'eslintPluginJsonc', specifier: 'eslint-plugin-jsonc', type: 'default' },
    { name: 'jsxA11y', specifier: 'eslint-plugin-jsx-a11y', type: 'default' },
    { name: 'pluginJsxPlus', specifier: 'eslint-plugin-jsx-plus', type: 'default' },
    { name: 'listeners', specifier: 'eslint-plugin-listeners', type: 'default' },
    { name: 'pluginLoadableImports', specifier: 'eslint-plugin-loadable-imports', type: 'default' },
    { name: 'eslintPluginMath', specifier: 'eslint-plugin-math', type: 'default' },
    { name: 'mdx', specifier: 'eslint-plugin-mdx', type: 'namespace' },
    { name: 'moduleInterop', specifier: 'eslint-plugin-module-interop', type: 'default' },
    { name: 'nodePlugin', specifier: 'eslint-plugin-n', type: 'default' },
    { name: 'pluginNeverThrow', specifier: 'eslint-plugin-neverthrow', type: 'default' },
    { name: 'nitpick', specifier: 'eslint-plugin-nitpick', type: 'default' },
    { name: 'noBarrelFiles', specifier: 'eslint-plugin-no-barrel-files', type: 'default' },
    { name: 'pluginNoConstructBind', specifier: 'eslint-plugin-no-constructor-bind', type: 'default' },
    { name: 'pluginNoExplicitTypeExports', specifier: 'eslint-plugin-no-explicit-type-exports', type: 'default' },
    { name: 'pluginNFDAR', specifier: 'eslint-plugin-no-function-declare-after-return', type: 'namespace' },
    { name: 'pluginNoHardcoded', specifier: 'eslint-plugin-no-hardcoded-strings', type: 'default' },
    { name: 'pluginRegexLook', specifier: 'eslint-plugin-no-lookahead-lookbehind-regexp', type: 'default' },
    { name: 'pluginNoOnly', specifier: 'eslint-plugin-no-only-tests', type: 'default' },
    { name: 'noSecrets', specifier: 'eslint-plugin-no-secrets', type: 'default' },
    { name: 'pluginNoUnary', specifier: 'eslint-plugin-no-unary-plus', type: 'default' },
    { name: 'pluginNoUnwaited', specifier: 'eslint-plugin-no-unawaited-dot-catch-throw', type: 'default' },
    { name: 'nounsanitized', specifier: 'eslint-plugin-no-unsanitized', type: 'default' },
    { name: 'eslintPluginNoUseExtendNative', specifier: 'eslint-plugin-no-use-extend-native', type: 'default' },
    { name: 'observers', specifier: 'eslint-plugin-observers', type: 'default' },
    { name: 'packageJson', specifier: 'eslint-plugin-package-json', type: 'default' },
    { name: 'paths', specifier: 'eslint-plugin-paths', type: 'default' },
    { name: 'pluginPerfectionist', specifier: 'eslint-plugin-perfectionist', type: 'default' },
    { name: 'playwright', specifier: 'eslint-plugin-playwright', type: 'default' },
    { name: 'pluginPreferArrow', specifier: 'eslint-plugin-prefer-arrow', type: 'default' },
    { name: 'pluginPrettier', specifier: 'eslint-plugin-prettier', type: 'default' },
    { name: 'pluginPromise', specifier: 'eslint-plugin-promise', type: 'default' },
    { name: 'pluginReact', specifier: 'eslint-plugin-react', type: 'default' },
    { name: 'reactCompiler', specifier: 'eslint-plugin-react-compiler', type: 'default' },
    { name: 'eslintReactDom', specifier: 'eslint-plugin-react-dom', type: 'default' },
    { name: 'pluginReactFormFields', specifier: 'eslint-plugin-react-form-fields', type: 'namespace' },
    { name: 'pluginReactHookForm', specifier: 'eslint-plugin-react-hook-form', type: 'default' },
    { name: 'reactHooks', specifier: 'eslint-plugin-react-hooks', type: 'default' },
    { name: 'reactHooksAddons', specifier: 'eslint-plugin-react-hooks-addons', type: 'default' },
    { name: 'eslintReactHooksExtra', specifier: 'eslint-plugin-react-hooks-extra', type: 'default' },
    { name: 'eslintReactNamingConvention', specifier: 'eslint-plugin-react-naming-convention', type: 'default' },
    { name: 'reactPerfPlugin', specifier: 'eslint-plugin-react-perf', type: 'default' },
    { name: 'preferFunctionComponent', specifier: 'eslint-plugin-react-prefer-function-component', type: 'default' },
    { name: 'reactRefresh', specifier: 'eslint-plugin-react-refresh', type: 'default' },
    { name: 'pluginReactTest', specifier: 'eslint-plugin-react-require-testid', type: 'default' },
    { name: 'reactUseEffect', specifier: 'eslint-plugin-react-useeffect', type: 'default' },
    { name: 'eslintReactWeb', specifier: 'eslint-plugin-react-web-api', type: 'default' },
    { name: 'pluginRedos', specifier: 'eslint-plugin-redos', type: 'default' },
    { name: 'pluginRegexp', specifier: 'eslint-plugin-regexp', type: 'default' },
    { name: 'pluginJSDoc', specifier: 'eslint-plugin-require-jsdoc', type: 'namespace' },
    { name: 'pluginSafeJSX', specifier: 'eslint-plugin-safe-jsx', type: 'default' },
    { name: 'pluginSecurity', specifier: 'eslint-plugin-security', type: 'default' },
    { name: 'pluginSonarjs', specifier: 'eslint-plugin-sonarjs', type: 'default' },
    { name: 'pluginSortClassMembers', specifier: 'eslint-plugin-sort-class-members', type: 'default' },
    { name: 'pluginSortDestructure', specifier: 'eslint-plugin-sort-destructure-keys', type: 'default' },
    { name: 'pluginSortKeysFix', specifier: 'eslint-plugin-sort-keys-fix', type: 'default' },
    { name: 'pluginSortReactDependency', specifier: 'eslint-plugin-sort-react-dependency-arrays', type: 'default' },
    { name: 'sqlTemplate', specifier: 'eslint-plugin-sql-template', type: 'default' },
    { name: 'pluginSSR', specifier: 'eslint-plugin-ssr-friendly', type: 'default' },
    { name: 'styledA11y', specifier: 'eslint-plugin-styled-components-a11y', type: 'default' },
    { name: 'pluginSwitchCase', specifier: 'eslint-plugin-switch-case', type: 'default' },
    { name: 'tailwind', specifier: 'eslint-plugin-tailwindcss', type: 'default' },
    { name: 'pluginTestingLibrary', specifier: 'eslint-plugin-testing-library', type: 'default' },
    { name: 'eslintPluginToml', specifier: 'eslint-plugin-toml', type: 'default' },
    { name: 'pluginTopLevel', specifier: 'eslint-plugin-toplevel', type: 'default' },
    { name: 'pluginTotalFunctions', specifier: 'eslint-plugin-total-functions', type: 'default' },
    { name: 'pluginTsdoc', specifier: 'eslint-plugin-tsdoc', type: 'default' },
    { name: 'pluginUndefinedCss', specifier: 'eslint-plugin-undefined-css-classes', type: 'default' },
    { name: 'pluginUnicorn', specifier: 'eslint-plugin-unicorn', type: 'default' },
    { name: 'pluginUnusedImports', specifier: 'eslint-plugin-unused-imports', type: 'default' },
    { name: 'pluginUseMemo', specifier: 'eslint-plugin-usememo-recommendations', type: 'default' },
    { name: 'pluginValidateJSX', specifier: 'eslint-plugin-validate-jsx-nesting', type: 'default' },
    { name: 'pluginWriteGood', specifier: 'eslint-plugin-write-good-comments', type: 'default' },
    { name: 'xss', specifier: 'eslint-plugin-xss', type: 'default' },
    { name: 'eslintPluginYml', specifier: 'eslint-plugin-yml', type: 'default' },
    { name: 'zod', specifier: 'eslint-plugin-zod', type: 'default' },
    { name: 'globals', specifier: 'globals', type: 'default' },
    { name: 'jsoncEslintParser', specifier: 'jsonc-eslint-parser', type: 'default' },
    { name: 'path', specifier: 'node:path', type: 'default' },
    { name: 'tomlEslintParser', specifier: 'toml-eslint-parser', type: 'default' },
    { name: 'yamlEslintParser', specifier: 'yaml-eslint-parser', type: 'default' }
];

const resolveValue = (mod, spec) => {
    if (spec.type === 'namespace') {
        return mod;
    }

    if (spec.type === 'named') {
        return mod[spec.importName];
    }

    return mod?.default ?? mod;
};

const derivePluginName = (specifier) => {
    const scopedMatch = specifier.match(/^(@[^/]+)\/eslint-plugin(?:-)?([^/]*)/);
    if (scopedMatch) {
        const [, scope, rest] = scopedMatch;
        const trimmed = rest || '';
        const primary = trimmed ? `${scope}/${trimmed}` : scope;
        const aliases = [];
        const packageAlias = trimmed ? `${scope}/eslint-plugin-${trimmed}` : `${scope}/eslint-plugin`;
        if (packageAlias !== primary) {
            aliases.push(packageAlias);
        }

        return { primary, aliases };
    }

    const unscopedMatch = specifier.match(/^eslint-plugin(?:-)?([^/]*)/);
    if (unscopedMatch) {
        const rest = unscopedMatch[1] || '';
        const primary = rest || 'eslint-plugin';
        const aliases = [];
        const packageAlias = rest ? `eslint-plugin-${rest}` : 'eslint-plugin';
        if (!aliases.includes(packageAlias)) {
            aliases.push(packageAlias);
        }

        return { primary, aliases };
    }

    return null;
};

module.exports = async function loadSharedModules() {
    if (cached) {
        return cached;
    }

    const entries = await Promise.all(
        moduleSpecs.map(async (spec) => {
            const mod = await import(spec.specifier);
            return [spec.name, resolveValue(mod, spec)];
        })
    );

    cached = Object.fromEntries(entries);
    const aliasLookup = new Map();
    cached.__pluginEntries = moduleSpecs
        .map((spec) => {
            const descriptor = derivePluginName(spec.specifier);
            if (!descriptor) {
                return null;
            }

            if (descriptor.aliases.length) {
                aliasLookup.set(descriptor.primary, descriptor.aliases);
            }

            return [descriptor.primary, cached[spec.name]];
        })
        .filter(Boolean);
    cached.__pluginAliasLookup = aliasLookup;
    cached.__moduleSpecs = moduleSpecs;
    return cached;
};
