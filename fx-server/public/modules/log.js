// public/modules/log.js
/**
 * @typedef {Object} LogEntry
 * @property {string} message - The log message.
 * @property {string} caller - The caller function.
 * @property {number} timestamp - The timestamp of the log entry.
 */

/**
 * Class representing a logging utility with a console overlay.
 */
export class Log {
    debug = true;
    #logEntries = [];

    constructor() {
        this.#createConsoleOverlay();
    }

    /**
     * Logs a message to the console.
     * @param {...any} args - The arguments to log.
     */
    log(...args) {
        if (!this.debug) return;

        const stack = new Error().stack;
        const callerLine = stack.split('\n')[2].trim();
        const [, caller] = callerLine.match(/at (\S+)/);

        const logEntry = {
            message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '),
            caller,
            timestamp: Date.now()
        };

        this.#logEntries.push(logEntry);
        console.log(`[${caller}]`, ...args);

        this.#saveLogs();
    }

    /**
     * Recursively logs an object and its children with the specified depth.
     * @param {*} obj - The object to log.
     * @param {number} [depth=0] - The current depth of the object.
     * @param {number} [maxDepth=3] - The maximum depth to log (default is 3).
     */
    logObject(obj, depth = 0, maxDepth = 3) {
        if (depth > maxDepth) {
            this.log(`Maximum depth reached (${maxDepth})`);
            return;
        }

        const indent = '  '.repeat(depth);

        // Use the custom toString implementation if available
        if (obj && typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString) {
            this.log(`${indent}${obj.toString()}`);
        } else if (typeof obj === 'object' && obj !== null) {
            const isArray = Array.isArray(obj);
            const prefix = isArray ? '[' : '{';
            const suffix = isArray ? ']' : '}';

            this.log(`${indent}${prefix}`);

            Object.entries(obj).forEach(([key, value]) => {
                const valueType = typeof value;
                const displayValue =
                    valueType === 'string' ?
                    `"${value}"` :
                    valueType === 'object' && value !== null ?
                    `[${value.constructor.name}]` :
                    value;

                this.log(`${indent}  ${key}: ${displayValue}`);

                if (valueType === 'object' && value !== null) {
                    this.logObject(value, depth + 1, maxDepth);
                }
            });

            this.log(`${indent}${suffix}`);
        } else {
            this.log(`${indent}${obj}`);
        }
    }

    /**
     * Sets the debug mode.
     * @param {boolean} value - The debug mode value.
     */
    setDebug(value) {
        this.debug = value;
    }

    /**
     * Toggles the console overlay.
     */
    toggleConsole() {
        if (!this.consoleOverlay) {
            this.#createConsoleOverlay();
        } else {
            this.consoleOverlay.classList.toggle('hidden');
        }
    }

    /**
     * Copies the current log entries to the clipboard.
     */
    copyLogs() {
        const logText = this.#logEntries.map(entry => `[${entry.caller}] ${entry.message}`).join('\n');
        navigator.clipboard.writeText(logText).then(() => {
            alert('Logs copied to clipboard!');
        });
    }

    /**
     * Loads all saved logs and appends them to the console.
     */
    async loadAllLogs() {
        const db = await this.#openDB();
        const transaction = db.transaction('logs', 'readonly');
        const store = transaction.objectStore('logs');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const allLogs = getAllRequest.result;
            const logText = allLogs.map(entry => `[${entry.caller}] ${entry.message}`).join('\n');
            this.consoleContent.insertAdjacentText('afterbegin', logText + '\n\n');
        };
    }

    /**
     * Creates the console overlay.
     */
    #createConsoleOverlay() {
        const consoleOverlayHTML = `
            <style>
                .console-overlay {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 200px;
                    background-color: #1c2128;
                    color: #9da5b4;
                    padding: 10px;
                    font-family: monospace;
                    font-size: 14px;
                    transition: transform 0.3s ease-in-out;
                    transform: translateY(100%);
                    box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.2);
                }

                .console-overlay.hidden {
                    transform: translateY(0);
                }

                .console-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .console-title {
                    font-weight: bold;
                }

                .console-button {
                    background-color: #3b4252;
                    color: #d8dee9;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .console-content {
                    height: 170px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                }
            </style>
            <div class="console-overlay hidden">
                <div class="console-header">
                    <div class="console-title">Console</div>
                    <div class="console-buttons">
                        <button class="console-button copy-button">Copy Logs</button>
                        <button class="console-button load-all-button">Load All Logs</button>
                    </div>
                </div>
                <div class="console-content"></div>
            </div>
        `;

        const consoleOverlayContainer = document.createElement('div');
        consoleOverlayContainer.innerHTML = consoleOverlayHTML;
        document.body.appendChild(consoleOverlayContainer);
        this.consoleOverlay = consoleOverlayContainer.querySelector('.console-overlay');
        this.consoleContent = this.consoleOverlay.querySelector('.console-content');
        this.copyButton = this.consoleOverlay.querySelector('.copy-button');
        this.loadAllButton = this.consoleOverlay.querySelector('.load-all-button');

        if (this.copyButton && this.loadAllButton) {
            this.copyButton.addEventListener('click', () => this.copyLogs());
            this.loadAllButton.addEventListener('click', () => this.loadAllLogs());
        } else {
            console.error('Failed to find copy or load all buttons in the console overlay.');
        }

        document.addEventListener('keydown', event => {
            if (event.ctrlKey && event.key === '`') {
                this.toggleConsole();
            }
        });

        this.#displayLogs();
    }

    /**
     * Displays the current log entries in the console.
     */
    #displayLogs() {
        const logText = this.#logEntries.map(entry => `[${entry.caller}] ${entry.message}`).join('\n');
        this.consoleContent.textContent = logText;
    }

    /**
     * Saves the log entries to IndexedDB.
     */
    async #saveLogs() {
        const db = await this.#openDB();
        const transaction = db.transaction('logs', 'readwrite');
        const store = transaction.objectStore('logs');

        for (const entry of this.#logEntries) {
            store.add(entry);
        }

        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
            const allLogs = getAllRequest.result;
            if (allLogs.length > 200) {
                const oldestLogKey = allLogs[0].timestamp;
                store.delete(oldestLogKey);
            }
        };
    }

    /**
     * Opens the IndexedDB database.
     * @returns {Promise<IDBDatabase>} A promise that resolves to the database instance.
     */
    async #openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ConsoleLogDB', 1);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                db.createObjectStore('logs', {
                    keyPath: 'timestamp'
                });
            };

            request.onsuccess = event => {
                resolve(event.target.result);
            };

            request.onerror = event => {
                reject(event.target.error);
            };
        });
    }
}
const Logger = new Log();
export const log = Logger.log.bind(Logger);
export const setDebug = Logger.setDebug.bind(Logger);
export const toggleConsole = Logger.toggleConsole.bind(Logger);
export const logObject = Logger.logObject.bind(Logger);