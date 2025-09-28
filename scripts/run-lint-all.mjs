#!/usr/bin/env node
// @ts-nocheck

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const ESLINT_CLI = resolve(ROOT, "../node_modules/eslint/bin/eslint.js");

const targets = [
  {
    label: "recommended",
    args: [
      "--max-warnings=0",
      "--no-error-on-unmatched-pattern",
      "--config",
      "lib/configs/recommended.js",
      "tests/fixtures/**/*",
    ],
  },
  {
    label: "all",
    args: [
      "--max-warnings=0",
      "--no-error-on-unmatched-pattern",
      "--config",
      "lib/configs/all.js",
      "tests/fixtures/**/*",
    ],
  },
];

const run = (label, args) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [ESLINT_CLI, ...args], {
      cwd: resolve(ROOT, ".."),
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(
          new Error(`eslint ${label} run failed with exit code ${code}`),
        );
      }
    });
    child.on("error", rejectPromise);
  });

for (const target of targets) {
  /* eslint-disable no-await-in-loop */
  await run(target.label, target.args);
  /* eslint-enable no-await-in-loop */
}
