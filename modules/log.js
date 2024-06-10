// public/modules/log.js
export default class Log {
    static #debug = true;

    static log(...args) {
        if (!this.#debug) return;

        const stack = new Error().stack;
        const callerLine = stack.split('\n')[2].trim();
        const [, caller] = callerLine.match(/at (\S+)/);

        console.log(`[${caller}]`, ...args);
    }

    static setDebug(value) {
        this.#debug = value;
    }
}

export const log = Log.log;
export const setDebug = Log.setDebug;

/* usage

import { log, setDebug } from './Log.js';

function foo() {
  log('Hello from foo!');
}

function bar() {
  log('Hello from bar!');
}

foo();
bar();

setDebug(false);

foo();
bar();
*/