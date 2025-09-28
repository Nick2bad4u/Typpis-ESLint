'use strict';

const recommended = require('./lib/configs/recommended.js');
const all = require('./lib/configs/all.js');
const createTyppisConfig = require('./lib/create-config.js');

module.exports = {
    configs: {
        recommended,
        all
    },
    createConfig: createTyppisConfig,
    createTyppisConfig
};
