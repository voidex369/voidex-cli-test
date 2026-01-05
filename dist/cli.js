#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import { render } from 'ink';
import meow from 'meow';
import App from './ui/App.js';
const cli = meow(`
	Usage
	  $ voidex

	Options
		--name  Your name

	Examples
	  $ voidex --name=VoidEx
	  Hello, VoidEx
`, {
    importMeta: import.meta,
    flags: {
        name: {
            type: 'string',
        },
    },
});
render(_jsx(App, {}), { exitOnCtrlC: false });
