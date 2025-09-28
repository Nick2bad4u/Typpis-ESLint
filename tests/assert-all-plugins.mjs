#!/usr/bin/env node
// @ts-nocheck

const sharedModulesModule = await import("../lib/configs/shared-modules.js");
const loadSharedModules = sharedModulesModule.default ?? sharedModulesModule;

(async () => {
  const modules = await loadSharedModules();
  const missing = [];

  for (const [pluginName, rawPlugin] of modules.__pluginEntries) {
    const resolved = rawPlugin?.default ?? rawPlugin;
    if (!resolved || typeof resolved !== "object") {
      missing.push(pluginName);
    }
  }

  if (missing.length > 0) {
    console.error("Plugins failed to load:", missing.join(", "));
    process.exitCode = 1;
    return;
  }

  console.log("All plugin modules loaded successfully.");
})();
