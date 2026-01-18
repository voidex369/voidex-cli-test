#!/usr/bin/env node
// Polyfill window for Node.js
global.window = global;
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './ui/App.js';
const cli = meow(`
\tUsage
\t  $ voidex

\tOptions
\t\t--name  Your name

\tExamples
\t  $ voidex --name=VoidEx
\t  Hello, VoidEx
`, {
    importMeta: import.meta,
    flags: {
        name: {
            type: 'string',
        },
    },
});
render(React.createElement(App, {}), { exitOnCtrlC: false });
