/**
 * @class Console
 * @description A class for managing the console overlay and log storage.
 */
export class Console {
    /**
     * @constructor
     * @description Initializes a new instance of the Console class.
     */
    constructor() {
        /**
         * @private
         * @type {Array<Object>}
         * @description An array to store log entries temporarily.
         */
        this.logBuffer = [];

        /**
         * @private
         * @type {HTMLDivElement|null}
         * @description The console overlay element.
         */
        this.consoleOverlay = null;

        /**
         * @private
         * @type {HTMLDivElement|null}
         * @description The console content element.
         */
        this.consoleContent = null;

        /**
         * @private
         * @type {HTMLButtonElement|null}
         * @description The copy logs button element.
         */
        this.copyButton = null;

        /**
         * @private
         * @type {HTMLButtonElement|null}
         * @description The load all logs button element.
         */
        this.loadAllButton = null;

        /**
         * @private
         * @type {HTMLSelectElement|null}
         * @description The log filter dropdown element.
         */
        this.logFilterDropdown = null;

        /**
         * @private
         * @type {HTMLInputElement|null}
         * @description The log search input element.
         */
        this.logSearchInput = null;

        /**
         * @private
         * @type {HTMLSelectElement|null}
         * @description The run filter dropdown element.
         */
        this.runFilterDropdown = null;

        /**
         * @private
         * @type {HTMLSpanElement|null}
         * @description The log count element.
         */
        this.logCountElement = null;

        /**
         * @private
         * @type {HTMLButtonElement|null}
         * @description The reset logs button element.
         */
        this.resetLogsButton = null;

        /**
         * @private
         * @type {string}
         * @description A unique hash for the current run of the code.
         */
        this.runHash = this.generateRunHash();

        // Monitor the console for log entries and errors
        this.monitorConsole();

        // Create the console overlay after the window has finished loading
        window.onload = () => {
            this.createConsoleOverlay();
            this.saveLogBufferToIndexedDB().then(() => {
                this.displayLogsFromIndexedDB();
            });
        };

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            const errorMessage = `Error: ${event.error.message}\n${event.error.stack}`;
            this.logBuffer.push({
                message: errorMessage,
                isError: true,
                timestamp: Date.now(),
                runHash: this.runHash
            });
            this.displayLogEntries();
        });
    }

    /**
     * @method generateRunHash
     * @private
     * @description Generates a unique hash for the current run of the code.
     * @returns {string} A unique hash string.
     */
    generateRunHash() {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${randomString}`;
    }

    /**
     * @method monitorConsole
     * @private
     * @description Monitors the console for log entries and errors, and stores them in the logBuffer.
     */
    monitorConsole() {
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;
        const originalConsoleInfo = console.info;

        console.log = (...args) => {
            originalConsoleLog.apply(console, args);
            this.logBuffer.push({
                message: args.join(' '),
                isError: false,
                isWarning: false,
                isInfo: false,
                timestamp: Date.now(),
                runHash: this.runHash
            });
            this.displayLogEntries();
        };

        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            this.logBuffer.push({
                message: args.join(' '),
                isError: true,
                isWarning: false,
                isInfo: false,
                timestamp: Date.now(),
                runHash: this.runHash
            });
            this.displayLogEntries();
        };

        console.warn = (...args) => {
            originalConsoleWarn.apply(console, args);
            this.logBuffer.push({
                message: args.join(' '),
                isError: false,
                isWarning: true,
                isInfo: false,
                timestamp: Date.now(),
                runHash: this.runHash
            });
            this.displayLogEntries();
        };

        console.info = (...args) => {
            originalConsoleInfo.apply(console, args);
            this.logBuffer.push({
                message: args.join(' '),
                isError: false,
                isWarning: false,
                isInfo: true,
                timestamp: Date.now(),
                runHash: this.runHash
            });
            this.displayLogEntries();
        };
    }

    /**
     * Displays the log entries in the console overlay based on the current filter settings.
     * @private
     * @returns {void}
     */
    displayLogEntries() {
        if (this.consoleContent) {
            const searchValue = this.logSearchInput.value.toLowerCase();
            const runValue = this.runFilterDropdown.value;

            const filteredLogs = this.logBuffer.filter((entry) => {
                if (runValue !== 'all' && entry.runHash !== runValue) {
                    return false;
                }
                if (searchValue && !entry.message.toLowerCase().includes(searchValue)) {
                    return false;
                }
                return true;
            });

            const logText = filteredLogs.map((entry, index) => {
                const timestampString = new Date(entry.timestamp).toLocaleTimeString([], {
                    hour12: false
                });
                const logType = entry.isError ? 'Error' : entry.isWarning ? 'Warning' : entry.isInfo ? 'Info' : 'Log';
                const logMessage = typeof entry.message === 'object' ? JSON.stringify(entry.message, null, 2) : entry.message;

                const borderStyle = entry.isError || entry.isWarning || entry.isInfo ?
                    'border-top: 1px solid; border-bottom: 1px solid;' :
                    (index < filteredLogs.length - 1 ? 'border-bottom: 1px solid #1c2128;' : '');

                const logStyle = `
          background-color: ${entry.isError ? '#ffb3b3' : entry.isWarning ? '#ffd9b3' : entry.isInfo ? '#b3d1ff' : 'transparent'};
          color: ${entry.isError ? '#8b0000' : entry.isWarning ? '#ff8c00' : entry.isInfo ? '#00008b' : 'inherit'};
          padding: 2px 4px;
          font-family: monospace;
          font-size: 11px;
          ${borderStyle}
        `;

                return `<div style="${logStyle}">[${logType}] [${timestampString}] ${logMessage}</div>`;
            }).join('');

            this.consoleContent.innerHTML = logText;
        }
    }

    /**
     * Populates the run filter dropdown with distinct run hashes.
     * @returns {Promise<void>} A promise that resolves when the dropdown is populated.
     */
    async populateRunFilterDropdown() {
        try {
            const db = await this.openIndexedDB();
            const transaction = db.transaction('logs', 'readonly');
            const store = transaction.objectStore('logs');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                const allLogs = getAllRequest.result;
                const distinctRunHashes = Array.from(new Set(allLogs.map(entry => entry.runHash)));
                const validRunHashes = distinctRunHashes.filter(hash => hash);

                this.runFilterDropdown.innerHTML = `
            <option value="all">All Runs</option>
            ${validRunHashes.map(hash => {
          const [timestamp, randomString] = hash.split('-');
          const date = timestamp ? new Date(parseInt(timestamp, 10)) : new Date();
          return `<option value="${hash}">${hash} (${date.toLocaleString()})</option>`;
        }).join('')}
          `;
            };

            getAllRequest.onerror = (event) => {
                console.error('Error retrieving logs from IndexedDB:', event.target.error);
            };
        } catch (error) {
            console.error('Error opening IndexedDB:', error);
        }
    }

    /**
     * Creates the console overlay and sets up event listeners.
     * This method initializes the console overlay, sets up resizing functionality,
     * and restores previously saved settings.
     * @private
     * @returns {void}
     */
    createConsoleOverlay() {
        const currentUrl = window.location.href;
        const startTime = Date.now();
        const reloadCount = parseInt(localStorage.getItem('reloadCount') || '0', 10);
        localStorage.setItem('reloadCount', (reloadCount + 1).toString());

        // Remove any existing console overlay
        const existingOverlay = document.querySelector('.console-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const consoleOverlayHTML = `
      <style>
        .console-overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 300px;
          background-color: #1c2128;
          color: #9da5b4;
          padding: 5px;
          font-family: monospace;
          font-size: 11px;
          transition: transform 0.3s ease-in-out;
          transform: translateY(100%);
          box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.2);
          z-index: 9999;
        }
        
        .console-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .console-title {
          font-weight: bold;
        }
        
        .console-button {
          background-color: #3b4252;
          color: #d8dee9;
          border: none;
          padding: 3px 6px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .console-content {
          height: calc(100% - 80px);
          overflow-y: auto;
          white-space: pre-wrap;
          margin-bottom: 5px;
          background-color: #121212;
        }
        
        .console-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .console-resize-handle {
          height: 3px;
          background-color: #121212;
          cursor: ns-resize;
        }
      </style>
      <div class="console-overlay hidden">
        <div class="console-resize-handle"></div>
        <div class="console-header">
          <div class="console-title">FX Console: ${currentUrl} - <span class="console-time">0</span>s, ${reloadCount} times reloaded</div>
          <div class="console-buttons">
            <button class="console-button copy-button">Copy Logs</button>
            <button class="console-button load-all-button">Load All Logs</button>
            <button class="console-button reset-logs-button">Reset Logs</button>
          </div>
        </div>
        <div class="console-content"></div>
        <div class="console-filters">
          <input type="text" class="console-search-input" placeholder="Search logs...">
          <select class="console-run-filter-dropdown">
            <option value="all">All Runs</option>
          </select>
          <span class="console-log-count">0 Logs</span>
        </div>
      </div>
    `;

        const consoleOverlayContainer = document.createElement('div');
        consoleOverlayContainer.innerHTML = consoleOverlayHTML;
        document.body.appendChild(consoleOverlayContainer);

        this.consoleOverlay = consoleOverlayContainer.querySelector('.console-overlay');
        this.consoleContent = this.consoleOverlay.querySelector('.console-content');
        this.copyButton = this.consoleOverlay.querySelector('.copy-button');
        this.loadAllButton = this.consoleOverlay.querySelector('.load-all-button');
        this.runFilterDropdown = this.consoleOverlay.querySelector('.console-run-filter-dropdown');
        this.logCountElement = this.consoleOverlay.querySelector('.console-log-count');
        this.resetLogsButton = this.consoleOverlay.querySelector('.reset-logs-button');
        this.logSearchInput = this.consoleOverlay.querySelector('.console-search-input');
        this.consoleTimeElement = this.consoleOverlay.querySelector('.console-time');
        this.consoleResizeHandle = this.consoleOverlay.querySelector('.console-resize-handle');

        if (
            this.consoleOverlay &&
            this.consoleContent &&
            this.copyButton &&
            this.loadAllButton &&
            this.runFilterDropdown &&
            this.logCountElement &&
            this.resetLogsButton &&
            this.logSearchInput &&
            this.consoleTimeElement &&
            this.consoleResizeHandle
        ) {
            if (this.copyButton && this.loadAllButton && this.resetLogsButton) {
                this.copyButton.addEventListener('click', () => this.copyLogs());
                this.loadAllButton.addEventListener('click', () => this.loadAllLogs());
                this.resetLogsButton.addEventListener('click', () => this.resetLogs());
            }

            this.logSearchInput.addEventListener('input', () => {
                this.displayLogEntries();
                localStorage.setItem('consoleFilterValue', this.logSearchInput.value);
            });

            this.runFilterDropdown.addEventListener('change', () => this.displayLogEntries());

            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.key === '`') {
                    this.toggleConsoleOverlay();
                }
            });

            this.populateRunFilterDropdown();

            const savedFilterValue = localStorage.getItem('consoleFilterValue');
            if (savedFilterValue) {
                this.logSearchInput.value = savedFilterValue;
                this.displayLogEntries();
            }

            let isResizing = false;
            let startY = 0;
            const minHeight = 100;
            const maxHeight = window.innerHeight - 20;
            let animationFrameId = null;

            const startResizing = (event) => {
                isResizing = true;
                startY = event.clientY;
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResizing);
                event.preventDefault();
            };

            const resize = (event) => {
                if (!isResizing) return;

                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }

                animationFrameId = requestAnimationFrame(() => {
                    const currentY = event.clientY;
                    const deltaY = startY - currentY;
                    const currentHeight = this.consoleOverlay.offsetHeight;
                    const newHeight = Math.min(Math.max(currentHeight + deltaY, minHeight), maxHeight);

                    this.consoleOverlay.style.height = `${newHeight}px`;
                    startY = currentY;
                });
            };

            const stopResizing = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResizing);
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                localStorage.setItem('consoleHeight', this.consoleOverlay.style.height);
            };

            this.consoleResizeHandle.addEventListener('mousedown', startResizing);

            const savedHeight = localStorage.getItem('consoleHeight');
            if (savedHeight) {
                const parsedHeight = parseInt(savedHeight, 10);
                if (parsedHeight > maxHeight) {
                    this.consoleOverlay.style.height = '300px';
                    localStorage.setItem('consoleHeight', '300px');
                } else {
                    this.consoleOverlay.style.height = savedHeight;
                }
            }

            const updateTime = () => {
                const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                this.consoleTimeElement.textContent = elapsedTime;
            };


            setInterval(updateTime, 1000);
        } else {
            console.error('Failed to find elements in the console overlay.');
        }
    }

    /**
     * @method toggleConsoleOverlay
     * @private
     * @description Toggles the visibility of the console overlay.
     */
    toggleConsoleOverlay() {
        if (this.consoleOverlay) {
            this.consoleOverlay.classList.toggle('hidden');
        }
    }

    /**
     * @method copyLogs
     * @private
     * @description Copies the current log entries to the clipboard.
     */
    copyLogs() {
        const logText = this.logBuffer.map(entry => `[${entry.isError ? 'Error' : entry.isWarning ? 'Warning' : entry.isInfo ? 'Info' : 'Log'}] [${new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}] ${entry.message}`).join('\n');
        navigator.clipboard.writeText(logText).then(() => {
            alert('Logs copied to clipboard!');
        });
    }

    /**
     * @method loadAllLogs
     * @private
     * @description Loads all saved logs from IndexedDB and appends them to the console.
     */
    async loadAllLogs() {
        const db = await this.openIndexedDB();
        const transaction = db.transaction('logs', 'readonly');
        const store = transaction.objectStore('logs');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const allLogs = getAllRequest.result;
            this.logBuffer = allLogs;
            this.displayLogEntries();
            this.updateLogCount();
        };
    }

    /**
     * @method saveLogBufferToIndexedDB
     * @private
     * @description Saves the log entries from the logBuffer to IndexedDB.
     * @returns {Promise<void>} A promise that resolves when the log entries are saved.
     */
    async saveLogBufferToIndexedDB() {
        const db = await this.openIndexedDB();
        const transaction = db.transaction('logs', 'readwrite');
        const store = transaction.objectStore('logs');

        for (const entry of this.logBuffer) {
            store.add(entry);
        }

        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
            this.logBuffer = []; // Clear the logBuffer after saving
            this.updateLogCount();
        };
    }
    /**
     * @method displayLogsFromIndexedDB
     * @private
     * @description Retrieves log entries from IndexedDB and displays them in the console overlay.
     */
    async displayLogsFromIndexedDB() {
        const db = await this.openIndexedDB();
        const transaction = db.transaction('logs', 'readonly');
        const store = transaction.objectStore('logs');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const allLogs = getAllRequest.result;
            this.logBuffer = allLogs;
            this.displayLogEntries();
            this.updateLogCount();
        };
    }

    /**
     * @method resetLogs
     * @private
     * @description Resets the logs by deleting all entries from IndexedDB.
     */
    async resetLogs() {
        const db = await this.openIndexedDB();
        const transaction = db.transaction('logs', 'readwrite');
        const store = transaction.objectStore('logs');
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            this.logBuffer = [];
            this.displayLogEntries();
            this.updateLogCount();
        };
    }

    /**
     * @method updateLogCount
     * @private
     * @description Updates the log count element with the current number of logs.
     */
    updateLogCount() {
        if (this.logCountElement) {
            this.logCountElement.textContent = `${this.logBuffer.length} Logs`;
        }
    }

    /**
     * @method openIndexedDB
     * @private
     * @description Opens the IndexedDB database.
     * @returns {Promise<IDBDatabase>} A promise that resolves to the opened database instance.
     */
    async openIndexedDB() {
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
/**
@description Creates a new instance of the Console class and exports it.
@type {Console}
*/
const ConsoleManager = new Console();
export default ConsoleManager;