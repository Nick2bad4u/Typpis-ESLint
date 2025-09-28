import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import createTyppisConfig from "eslint-config-Typpis-ESLint/create-config";

const rootDir = dirname(fileURLToPath(import.meta.url));

/**
 * Example Typpis ESLint configuration.
 * Adjust the tsconfigPath list and ignores array to match your workspace layout.
 */
export default await createTyppisConfig({
    preset: process.env.TYPPIS_STRICT === "true" ? "all" : "recommended",
    tsconfigRootDir: rootDir,
    tsconfigPath: ["tsconfig.json", "packages/*/tsconfig.json"],
    ignores: ["**/dist/**", "**/coverage/**", "**/.next/**"],
    transform(config) {
        config.push({
            name: "local/overrides",
            rules: {
                "no-console": "off",
            },
        });
    },
});
