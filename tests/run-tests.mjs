#!/usr/bin/env node
// @ts-nocheck

import { inspect } from 'node:util';

const die = (message) => {
    console.error(message);
    process.exitCode = 1;
};

try {
    const recommendedModule = await import('../lib/configs/recommended.js');
    const allModule = await import('../lib/configs/all.js');

    const recommended = await (recommendedModule.default ?? recommendedModule);
    const all = await (allModule.default ?? allModule);

    if (!Array.isArray(recommended) || recommended.length === 0) {
        die('Recommended config did not resolve to a non-empty array.');
    }

    if (!Array.isArray(all) || all.length === 0) {
        die('All config did not resolve to a non-empty array.');
    }

    const recommendedNames = recommended
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry) => entry.name)
        .filter(Boolean);

    const allNames = all
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry) => entry.name)
        .filter(Boolean);

    console.log('Recommended entries:', inspect(recommendedNames, { compact: true }));
    console.log('Strict entries:', inspect(allNames, { compact: true }));
    console.log('Config smoke tests finished.');
} catch (error) {
    die(error instanceof Error ? error.message : inspect(error));
}
