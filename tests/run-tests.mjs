#!/usr/bin/env node
// @ts-nocheck

import { inspect } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const die = (message) => {
  console.error(message);
  process.exitCode = 1;
};

try {
  const recommendedModule = await import("../lib/configs/recommended.js");
  const allModule = await import("../lib/configs/all.js");
  const createConfigModule = await import("../lib/create-config.js");

  const recommended = await (recommendedModule.default ?? recommendedModule);
  const all = await (allModule.default ?? allModule);
  const createTyppisConfig =
    createConfigModule.default ??
    createConfigModule.createTyppisConfig ??
    createConfigModule;

  if (!Array.isArray(recommended) || recommended.length === 0) {
    die("Recommended config did not resolve to a non-empty array.");
  }

  if (!Array.isArray(all) || all.length === 0) {
    die("All config did not resolve to a non-empty array.");
  }

  const recommendedNames = recommended
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => entry.name)
    .filter(Boolean);

  const allNames = all
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => entry.name)
    .filter(Boolean);

  const fixturesRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "fixtures",
  );
  const generated = await createTyppisConfig({
    tsconfigRootDir: fixturesRoot,
    tsconfigPath: ["tsconfig.json"],
    ignores: ["**/generated/**"],
  });

  if (!Array.isArray(generated) || generated.length === 0) {
    die("createTyppisConfig did not return a populated config array.");
  }

  if (generated[0]?.name !== "typpis/custom-ignores") {
    die("Custom ignores entry was not prepended by createTyppisConfig.");
  }

  const typescriptEntry = generated.find(
    (entry) => entry && entry.name === "typpis/typescript",
  );
  const parserOptions = typescriptEntry?.languageOptions?.parserOptions;
  if (!parserOptions) {
    die(
      "TypeScript entry is missing languageOptions.parserOptions after createTyppisConfig.",
    );
  }

  if (parserOptions.tsconfigRootDir !== fixturesRoot) {
    die("createTyppisConfig did not propagate tsconfigRootDir.");
  }

  if (
    !Array.isArray(parserOptions.project) ||
    parserOptions.project[0] !== "tsconfig.json"
  ) {
    die("createTyppisConfig did not propagate tsconfigPath.");
  }

  const baseEntry = generated.find(
    (entry) => entry && entry.name === "typpis/base",
  );
  const resolverProject =
    baseEntry?.settings?.["import/resolver"]?.typescript?.project;
  if (
    !Array.isArray(resolverProject) ||
    resolverProject[0] !== "tsconfig.json"
  ) {
    die("TypeScript import resolver project list was not synchronised.");
  }

  console.log(
    "Recommended entries:",
    inspect(recommendedNames, { compact: true }),
  );
  console.log("Strict entries:", inspect(allNames, { compact: true }));
  console.log(
    "Config factory entries:",
    inspect(generated.map((entry) => entry && entry.name).filter(Boolean), {
      compact: true,
    }),
  );
  console.log("Config smoke tests finished.");
} catch (error) {
  die(error instanceof Error ? error.message : inspect(error));
}
