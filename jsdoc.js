#!/usr/bin/env node
/* global require: true */

// initialize the environment for Node.js
(() => {
    const fs = require('fs');
    const path = require('path');

    let env;
    let jsdocPath = __dirname;
    const pwd = process.cwd();

    // Create a custom require method that adds `lib/jsdoc` and `node_modules` to the module
    // lookup path. This makes it possible to `require('jsdoc/foo')` from external templates and
    // plugins, and within JSDoc itself. It also allows external templates and plugins to
    // require JSDoc's module dependencies without installing them locally.
    require = require('requizzle')({
        requirePaths: {
            before: [path.join(__dirname, 'lib')],
            after: [path.join(__dirname, 'node_modules')]
        },
        infect: true
    });

    // resolve the path if it's a symlink
    if (fs.statSync(jsdocPath).isSymbolicLink()) {
        jsdocPath = path.resolve( path.dirname(jsdocPath), fs.readlinkSync(jsdocPath) );
    }

    env = require('./lib/jsdoc/env');
    env.dirname = jsdocPath;
    env.pwd = pwd;
    env.args = process.argv.slice(2);
})();

/**
 * Data about the environment in which JSDoc is running, including the configuration settings that
 * were used to run JSDoc.
 *
 * @deprecated As of JSDoc 3.4.0. Use `require('jsdoc/env')` to access the `env` object. The global
 * `env` object will be removed in a future release.
 * @namespace
 * @name env
 */
global.env = (() => require('./lib/jsdoc/env'))();

(() => {
    const cli = require('./cli');

    function cb(errorCode) {
        cli.logFinish();
        cli.exit(errorCode || 0);
    }

    cli.setVersionInfo()
        .loadConfig()
        .configureLogger();

    cli.logStart();

    cli.runCommand(cb);
})();
