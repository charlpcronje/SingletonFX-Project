## Analysis Report

| No. | File | Lines | Words | AI Tokens |
| --- | ---- | ----- | ----- | --------- |
| 1 | ./.htaccess | 23 | 79 | 143 |
| 2 | ./fx.js | 995 | 3482 | 6182 |
| 3 | ./index.html | 15 | 18 | 53 |
| 4 | ./user.json | 5 | 8 | 27 |
| 5 | ./convert_env_to_file.php | 101 | 428 | 788 |
| 6 | ./.env | 4 | 4 | 16 |
| 7 | ./hashes.json | 7 | 12 | 41 |
| 8 | ./manifest.php | 40 | 161 | 282 |
| 9 | ./manifest.json | 123 | 221 | 704 |
| 10 | ./manifest.js | 121 | 222 | 442 |
| 11 | ./config.json | 6 | 10 | 27 |
| 12 | ./main.js | 52 | 131 | 289 |
| 13 | ./help.html | 329 | 832 | 2075 |
| 14 | ./modules/product.js | 6 | 14 | 30 |
| 15 | ./modules/user.js | 15 | 24 | 49 |
| 16 | ./modules/utils.js | 9 | 20 | 38 |
| 17 | ./modules/multipleExports.js | 14 | 30 | 72 |
| 18 | ./modules/log.js | 281 | 790 | 1593 |
| 19 | ./modules/counter.js | 22 | 34 | 51 |
| 20 | ./modules/dynamic-module.js | 6 | 17 | 23 |
| 21 | ./modules/lazy-loaded-module.js | 8 | 20 | 27 |
| 22 | ./modules/help.js | 34 | 71 | 139 |
| 23 | ./templates/user-card.html | 6 | 13 | 48 |
| 24 | ./templates/user-profile.html | 13 | 31 | 115 |
| 25 | ./templates/product-card.html | 12 | 29 | 105 |
| 26 | ./data/localization.json | 38 | 99 | 264 |
| 27 | ./tests/api/users.php | 74 | 190 | 537 |
| 28 | ./tests/api/json_helper.php | 26 | 111 | 178 |
| 29 | ./tests/api/posts.php | 74 | 190 | 537 |
| 30 | ./tests/api/comments.php | 74 | 190 | 537 |
| 31 | ./tests/api/users.json | 20 | 38 | 118 |
| 32 | ./tests/api/comments.json | 23 | 54 | 158 |
|  | Total | 2576 | 7573 | 15688 |


## Total Counts Across All Files. Tokenizer Used: NLTK's Punkt Tokenizer
- Total Lines: 2576
- Total Words: 7573
- Total AI Tokens: 15688

## File: .htaccess
```
# .htaccess
RewriteEngine On

# Existing rules
RewriteRule ^generateHashes$ generate_hashes.php [L]
RewriteRule ^env\.json$ convert_env_to_file.php?ext=json [L]
RewriteRule ^env\.js$ convert_env_to_file.php?ext=js [L]
RewriteRule ^manifest$ manifest.php [L]

# New API routes
RewriteRule ^api/users$ tests/api/users.php [L]
RewriteRule ^api/users/([0-9]+)$ tests/api/users.php?id=$1 [L]
RewriteRule ^api/posts$ tests/api/posts.php [L]
RewriteRule ^api/posts/([0-9]+)$ tests/api/posts.php?id=$1 [L]
RewriteRule ^api/comments$ tests/api/comments.php [L]
RewriteRule ^api/comments/([0-9]+)$ tests/api/comments.php?id=$1 [L]

# Serve HTML files with the correct Content-Type header
AddType text/html .html

# Serve other file types with their respective Content-Type headers
AddType text/css .css
AddType application/javascript .js
```

## File: fx.js
```js
/**
 * @file fx.js
 * @description Comprehensive FX class for managing resources with a sync-like API
 */

import {
    manifest as initialManifest
} from './manifest.js';

/**
 * @class ExecutionContext
 * @description Manages the execution of asynchronous tasks in a synchronous-looking manner,
 * handling sequences, caching, and task queues.
 */
class ExecutionContext {
    /**
     * @constructor
     * @description Initializes the ExecutionContext with default values and data structures.
     */
    constructor() {
        /**
         * @type {Array<Function>}
         * @description Queue of tasks to be executed.
         */
        this.taskQueue = [];

        /**
         * @type {boolean}
         * @description Flag indicating whether tasks are currently being executed.
         */
        this.running = false;

        /**
         * @type {number}
         * @description Counter for logging purposes.
         */
        this.logCount = 0;

        /**
         * @type {number}
         * @description Maximum number of attempts to prevent infinite loops.
         */
        this.maxAttempts = 1000;

        /**
         * @type {number}
         * @description Delay in milliseconds between attempts.
         */
        this.delayBetweenAttempts = 1;

        /**
         * @type {Map<string|number, Promise>}
         * @description Map of sequences and their corresponding promises.
         */
        this.sequences = new Map();

        /**
         * @type {Map<string, {value: any, timestamp: number}>}
         * @description Cache for storing results of operations.
         */
        this.cache = new Map();
    }

    /**
     * @method log
     * @description Logs a message with an incremental count.
     * @param {string} message - The message to be logged.
     */
    log(message) {
        console.log(`${++this.logCount}. ExecutionContext: ${message}`);
    }

    /**
     * @method run
     * @description Executes tasks in the task queue.
     */
    run() {
        this.log('Running task queue');
        if (this.running) return;
        this.running = true;

        this.log(`Running task queue length: ${this.taskQueue.length}`);
        while (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift();
            task();
        }
        this.running = false;
        this.log('Finished running task queue');
    }

    /**
     * @method enqueue
     * @description Adds a task to the queue and starts execution if not already running.
     * @param {Function} task - The task to be added to the queue.
     */
    enqueue(task) {
        this.log('Task enqueued');
        this.taskQueue.push(task);
        if (!this.running) {
            this.log('Starting task queue');
            this.run();
        }
    }

    /**
     * @method await
     * @description Waits for a promise to resolve in a sync-like manner.
     * @param {Promise} promise - The promise to await.
     * @returns {any} The resolved value of the promise.
     */
    await(promise) {
        this.log('Await called');
        let result;
        let hasResult = false;
        let error;

        promise.then(
            (value) => {
                this.log('Promise resolved');
                result = value;
                hasResult = true;
            },
            (err) => {
                this.log('Promise rejected');
                error = err;
                hasResult = true;
            }
        );

        return this.waitForResult(() => hasResult, () => {
            if (error) {
                this.log('Throwing error');
                throw error;
            }
            this.log('Returning result');
            return result;
        });
    }

    /**
     * @method waitForResult
     * @description Waits for a condition to be true, with a maximum number of attempts.
     * @param {Function} condition - Function that returns true when the wait should end.
     * @param {Function} callback - Function to call when the condition is met.
     * @param {number} [attempt=0] - The current attempt number.
     * @returns {Promise<any>} The result of the callback function.
     */
    waitForResult(condition, callback, attempt = 0) {
        if (condition()) {
            return callback();
        }

        if (attempt >= this.maxAttempts) {
            throw new Error('Maximum wait attempts exceeded');
        }

        this.run();

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.waitForResult(condition, callback, attempt + 1));
            }, this.delayBetweenAttempts);
        });
    }

    /**
     * @method runAsync
     * @description Runs an asynchronous function within a specific sequence.
     * @param {Function} fn - The async function to run.
     * @param {Object} config - Configuration object for the execution.
     * @param {string|number} config.sq - The sequence identifier.
     * @param {number} [config.cache] - Cache duration in milliseconds.
     * @param {number} [config.retry] - Number of retry attempts.
     * @param {Function} [config.cb] - Callback function to run after execution.
     * @param {string|number} [config.sqcb] - Sequence to run after this execution.
     * @returns {Promise<any>} The result of the async function.
     */
    async runAsync(fn, config) {
        const { sq, cache, retry, cb, sqcb } = config;
        
        if (!this.sequences.has(sq)) {
            this.sequences.set(sq, Promise.resolve());
        }

        const sequence = this.sequences.get(sq).then(async () => {
            const cacheKey = JSON.stringify({ fn: fn.toString(), config });
            if (cache && cache !== 1 && this.cache.has(cacheKey)) {
                const { value, timestamp } = this.cache.get(cacheKey);
                if (cache === 0 || Date.now() - timestamp < cache) {
                    return value;
                }
            }

            let result;
            for (let attempt = 0; attempt <= (retry || 0); attempt++) {
                try {
                    result = await fn();
                    break;
                } catch (error) {
                    if (attempt === (retry || 0)) throw error;
                    this.log(`Retry attempt ${attempt + 1} for sequence ${sq}`);
                }
            }

            if (cache && cache !== 1) {
                this.cache.set(cacheKey, { value: result, timestamp: Date.now() });
            }

            if (cb) cb(result);

            if (sqcb !== undefined) {
                this.sequences.get(sqcb)?.then(() => {
                    this.runAsync(() => {}, { sq: sqcb });
                });
            }

            return result;
        });

        this.sequences.set(sq, sequence);
        return sequence;
    }
}

/**
 * @class Resource
 * @description Base class for all resource types
 */
class Resource {
    /**
     * @param {Object} config - Configuration for the resource
     * @param {ExecutionContext} context - The execution context
     */
    constructor(config, context) {
        this.config = config;
        this.context = context;
        this.loaded = false;
        this.value = null;
    }

    /**
     * @method load
     * @description Load the resource
     * @returns {any} The loaded resource value
     */
    load() {
        if (!this.loaded) {
            this.value = this.context.await(this._doLoad());
            this.loaded = true;
        }
        return this.value;
    }

    /**
     * @method _doLoad
     * @description Internal method to be overridden by subclasses
     * @returns {Promise<any>} The loaded resource value
     */
    async _doLoad() {
        throw new Error('_doLoad must be implemented by subclass');
    }
}

/**
 * @class APIResource
 * @extends Resource
 * @description Resource class for API endpoints
 */
class APIResource extends Resource {
    constructor(config, fx) {
        super(config, fx.context);
        this.fx = fx;
        this.baseUrl = config.baseUrl;
        this.methods = config.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        this.logCount = 0;

        this.methods.forEach(method => {
            this[method.toLowerCase()] = this.createMethod(method);
        });
    }

    log(message) {
        console.log(`${++this.logCount}. APIResource: ${message}`);
    }

    createMethod(method) {
        return (endpoint, options = {}) => {
            this.log(`Creating ${method} method for ${endpoint}`);
            this.log(`Calling API method: ${method.toUpperCase()} ${this.baseUrl}${endpoint}`);
            const fetchPromise = fetch(`${this.baseUrl}${endpoint}`, {
                    method: method.toUpperCase(),
                    ...options,
                    headers: {
                        ...this.config.headers,
                        ...options.headers
                    }
                })
                .then(response => {
                    this.log(`Received response for ${method} ${endpoint}`);
                    if (!response.ok) {
                        throw new Error(`API call failed: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.log(`Parsed JSON data for ${method} ${endpoint}`);
                    return data;
                })
                .catch(error => {
                    this.log(`Error in ${method} ${endpoint}: ${error.message}`);
                    throw error;
                });

            this.log(`Awaiting fetch promise for ${method} ${endpoint}`);
            return this.fx.context.await(fetchPromise);
        };
    }
}

/**
 * @class CSSResource
 * @extends Resource
 * @description Resource class for CSS files
 */
class CSSResource extends Resource {
    /**
     * @method _doLoad
     * @description Load and process the CSS file
     * @returns {Promise<Object>} An object with methods to manipulate the loaded CSS
     */
    async _doLoad() {
        const response = await fetch(this.config.path);
        let css = await response.text();

        if (this.config.transformations) {
            css = await this.applyTransformations(css, this.config.transformations);
        }

        if (this.config.scope && this.config.scope !== 'global') {
            css = this.scopeCSS(css, this.config.scope);
        }

        const style = document.createElement('style');
        style.textContent = css;
        if (this.config.media) {
            style.media = this.config.media;
        }
        document.head.appendChild(style);

        return {
            getCSS: () => css,
            setScope: (newScope) => {
                css = this.scopeCSS(css, newScope);
                style.textContent = css;
            },
            remove: () => {
                document.head.removeChild(style);
            }
        };
    }

    /**
     * @method applyTransformations
     * @description Apply transformations to CSS content
     * @param {string} css - The CSS content
     * @param {Array<string|Function>} transformations - Array of transformation names or functions
     * @returns {Promise<string>} The transformed CSS
     */
    async applyTransformations(css, transformations) {
        for (const transform of transformations) {
            if (typeof transform === 'function') {
                css = await transform(css);
            } else if (transform === 'autoprefixer') {
                css = await this.applyAutoprefixer(css);
            } else if (transform === 'minify') {
                css = this.minifyCSS(css);
            }
        }
        return css;
    }

    /**
     * @method applyAutoprefixer
     * @description Apply autoprefixer to CSS content
     * @param {string} css - The CSS content
     * @returns {Promise<string>} The auto prefixed CSS
     */
    async applyAutoprefixer(css) {
        // In a real implementation, you would use an actual autoprefixer library
        console.log('Applying autoprefixer...');
        return css;
    }

    /**
     * @method minifyCSS
     * @description Minify CSS content
     * @param {string} css - The CSS content
     * @returns {string} The minified CSS
     */
    minifyCSS(css) {
        return css.replace(/\s+/g, ' ')
            .replace(/\s*([{}:;,])\s*/g, '$1')
            .replace(/;}/g, '}')
            .trim();
    }

    /**
     * @method scopeCSS
     * @description Scope CSS rules to a specific selector
     * @param {string} css - The CSS content
     * @param {string} scope - The scope selector
     * @returns {string} The scoped CSS
     */
    scopeCSS(css, scope) {
        return css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector) => {
            if (selector.trim()[0] === '@') {
                return match;
            }
            return selector.split(',')
                .map(part => `${scope} ${part.trim()}`)
                .join(', ') + match.slice(selector.length);
        });
    }
}

/**
 * @class HTMLResource
 * @extends Resource
 * @description Resource class for HTML templates
 */
class HTMLResource extends Resource {
    /**
     * @method _doLoad
     * @description Load an HTML file and provide a query function
     * @returns {Promise<Function>} A function to query the loaded HTML
     */
    async _doLoad() {
        const response = await fetch(this.config.path);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return (selector) => {
            if (!selector) return html;
            const elements = doc.querySelectorAll(selector);
            return elements.length === 1 ? elements[0] : Array.from(elements);
        };
    }
}

/**
 * @class ModuleResource
 * @extends Resource
 * @description Resource class for JavaScript modules
 */
class ModuleResource extends Resource {
    /**
     * @method _doLoad
     * @description Load a JavaScript module
     * @returns {Promise<any>} The loaded module or its main export
     */
    async _doLoad() {
        const module = await import(this.config.path);
        if (this.config.mainExport) {
            const exportedItem = module[this.config.mainExport];
            if (this.config.type === 'class') {
                return exportedItem;
            } else if (this.config.type === 'instance') {
                return new exportedItem();
            } else {
                return exportedItem;
            }
        }
        return module;
    }
}

/**
 * @class DataResource
 * @extends Resource
 * @description Resource class for data files (JSON, XML, YML)
 */
class DataResource extends Resource {
    /**
     * @method _doLoad
     * @description Load and parse a data file
     * @returns {Promise<Object>} The parsed data
     */
    async _doLoad() {
        const response = await fetch(this.config.path);
        const contentType = response.headers.get('content-type');
        if (contentType.includes('application/json')) {
            return response.json();
        } else if (contentType.includes('application/xml')) {
            const text = await response.text();
            return new DOMParser().parseFromString(text, 'text/xml');
        } else if (contentType.includes('application/x-yaml')) {
            const text = await response.text();
            // In a real implementation, you would use a YAML parsing library
            console.log('YAML parsing not implemented');
            return text;
        } else {
            throw new Error(`Unsupported data type: ${contentType}`);
        }
    }
}

/**
 * @class RawResource
 * @extends Resource
 * @description Resource class for raw text files
 */
class RawResource extends Resource {
    /**
     * @method _doLoad
     * @description Load a raw text file
     * @returns {Promise<string>} The raw file content
     */
    async _doLoad() {
        const response = await fetch(this.config.path);
        return response.text();
    }
}

/**
 * @class FX
 * @description Core class for managing resources with a composition-based approach
 */
class FX {
    /**
     * @constructor
     * @description Initializes the FX instance with all necessary components
     */
    constructor() {
        this.manifestObj = {};
        this.resources = new Map();
        this.dynamicProperties = new Map();
        this.context = new ExecutionContext();
        this.dbPromise = this.initIndexedDB();
        this.proxyCache = new WeakMap();
        this.maxRecursionDepth = 10;
        this.defaultSequence = 0;
        this.cache = new Map();

        this.loadManifest(initialManifest);

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (prop === 'fx') {
                    return this.fx.bind(this);
                }
                return this.handleGet(target, prop, [], receiver);
            },
            set: (target, prop, value) => this.handleSet(target, prop, value, []),
            apply: (target, thisArg, args) => {
                return this.fx(...args);
            }
        });
    }

    fx(config = {}) {
        const processedConfig = this.processConfig(config);
        return this.createProxy(processedConfig);
    }

    createProxy(config = {}) {
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (prop === 'fx') {
                    return this.fx.bind(this);
                }
                return this.handleGet(target, prop, [], receiver, config);
            },
            set: (target, prop, value) => this.handleSet(target, prop, value, []),
        });
    }

    processConfig(config) {
        if (typeof config !== 'object' || config === null) {
            config = { sq: config };
        }
        return {
            sq: config.sq ?? this.defaultSequence,
            log: config.log ?? 0,
            retry: config.retry ?? 0,
            cb: config.cb,
            sqcb: config.sqcb,
            cache: config.cache ?? 1,
            ...config
        };
    }

    fx(config = {}) {
        const processedConfig = this.processConfig(config);
        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof target[prop] === 'function') {
                    return (...args) => this.context.runAsync(() => target[prop](...args), processedConfig);
                }
                if (typeof target[prop] === 'object' && target[prop] !== null) {
                    return this.fx(processedConfig)[prop];
                }
                return target[prop];
            }
        });
    }

    /**
     * @method loadManifest
     * @description Load the manifest and create resource instances
     * @param {Object} manifestObj - The manifest object
     * @param {string} [prefix=''] - The current prefix for nested objects
     */
    loadManifest(manifestObj, prefix = '') {
        console.log("Loading manifest:", manifestObj);
        Object.entries(manifestObj).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            console.log(`Processing manifest entry: ${fullKey}`);
            if (typeof value === 'object' && value !== null && !value.type) {
                // Create the nested structure
                let current = this.manifestObj;
                fullKey.split('.').forEach((part, index, array) => {
                    if (!current[part]) {
                        current[part] = index === array.length - 1 ? value : {};
                    }
                    current = current[part];
                });
                this.loadManifest(value, fullKey);
            } else {
                // Set the value for leaf nodes
                let current = this.manifestObj;
                const parts = fullKey.split('.');
                parts.forEach((part, index) => {
                    if (index === parts.length - 1) {
                        current[part] = value;
                    } else {
                        if (!current[part]) current[part] = {};
                        current = current[part];
                    }
                });
                console.log(`Added to manifestObj: ${fullKey}`);
                const resource = this.createResource(value, fullKey);
                if (resource !== null) {
                    this.resources.set(fullKey, resource);
                }
            }
        });
    }

    /**
     * @method createResource
     * @description Create a resource instance based on its type
     * @param {Object} config - The resource configuration
     * @returns {Resource} The created resource instance
     */
    createResource(config) {
        console.log("Creating resource:", config);
        if (typeof config !== 'object' || config === null || !config.type) {
            return null; // Return null for non-resource configurations
        }

        switch (config.type) {
            case 'api':
                return new APIResource(config, this);
            case 'css':
                return new CSSResource(config, this.context);
            case 'html':
                return new HTMLResource(config, this.context);
            case 'module':
            case 'class':
            case 'instance':
            case 'function':
                return new ModuleResource(config, this.context);
            case 'json':
            case 'xml':
            case 'yml':
                return new DataResource(config, this.context);
            case 'raw':
                return new RawResource(config, this.context);
            case 'object':
                return config; // Handle 'object' type explicitly
            default:
                throw new Error(`Unknown resource type: ${config.type}`);
        }
    }

    /**
     * @method handleGet
     * @description Handles property access on the FX proxy
     * @param {Object} target - The target object
     * @param {string} prop - The property being accessed
     * @param {Array<string>} path - The current property path
     * @param {number} [depth=0] - The current recursion depth
     * @returns {*} The requested property or a new proxy for chaining
     */
    handleGet(target, prop, path, receiver, config = {}) {
        const fullPath = [...path, prop].join('.');
        console.log(`Accessing: ${fullPath}, Depth: ${path.length}`);
    
        if (path.length > this.maxRecursionDepth) {
            console.warn(`Maximum recursion depth reached for path: ${fullPath}. Stopping recursion.`);
            return undefined;
        }
    
        // Check for special properties first
        if (prop === 'db') return this.handleDBAccess();
        if (prop === 'store') return this.handleStorageAccess('local');
        if (prop === 'session') return this.handleStorageAccess('session');
        if (prop === 'env') return this.handleEnvAccess();
    
        // Check for dynamic properties
        if (this.dynamicProperties.has(fullPath)) {
            return this.dynamicProperties.get(fullPath);
        }
    
        // Check for resources
        if (this.resources.has(fullPath)) {
            const resource = this.resources.get(fullPath);
            if (typeof resource === 'function') {
                return (...args) => this.context.runAsync(() => resource(...args), config);
            }
            return resource;
        }
    
        const value = this.getNestedValue(this.manifestObj, fullPath);
    
        if (value === undefined) {
            return undefined;
        }
    
        if (value && typeof value === 'object' && value.type) {
            const resource = this.createResource(value, fullPath);
            this.resources.set(fullPath, resource);
            if (typeof resource === 'function') {
                return (...args) => this.context.runAsync(() => resource(...args), config);
            }
            return resource;
        } else if (typeof value === 'object' && value !== null) {
            return new Proxy({}, {
                get: (nestedTarget, nestedProp) => this.handleGet(nestedTarget, nestedProp, [...path, prop], receiver, config),
                set: (nestedTarget, nestedProp, nestedValue) => this.handleSet(nestedTarget, nestedProp, nestedValue, [...path, prop])
            });
        }
    
        return value;
    }


    /**
     * @method getNestedValue
     * @description Safely retrieves a nested value from an object
     * @param {Object} obj - The object to retrieve from
     * @param {string} path - The path to the desired value
     * @returns {*} The value at the specified path, or undefined if not found
     */
    getNestedValue(obj, path) {
        console.log(`Getting nested value for path: ${path}`);
        return path.split('.').reduce((current, key) => {
            console.log(`Accessing key: ${key}, Current value:`, current);
            return current && current.hasOwnProperty(key) ? current[key] : undefined;
        }, obj);
    }

    /**
     * @method getNestedManifest
     * @description Get a nested path in the manifest
     * @param {Array<string>} path
     */
    getNestedManifest(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.manifestObj);
    }

    /**
     * @method handleSet
     * @description Handles property setting on the FX proxy
     * @param {Object} target - The target object
     * @param {string} prop - The property being set
     * @param {*} value - The value being set
     * @param {Array<string>} path - The current property path
     * @returns {boolean} True if the set was successful
     */
    handleSet(target, prop, value, path) {
        const fullPath = [...path, prop].join('.');
        console.log("Setting:", fullPath, value);

        // Handle special properties
        if (fullPath.startsWith('db.')) {
            return this.setToIndexedDB('fxStore', fullPath.slice(3), value);
        }
        if (fullPath.startsWith('store.')) {
            localStorage.setItem(fullPath.slice(6), JSON.stringify(value));
            return true;
        }
        if (fullPath.startsWith('session.')) {
            sessionStorage.setItem(fullPath.slice(8), JSON.stringify(value));
            return true;
        }

        // Set dynamic property
        this.dynamicProperties.set(fullPath, value);
        return true;
    }

    /**
     * @method handleDBAccess
     * @description Handles access to IndexedDB
     * @returns {Proxy} A proxy for IndexedDB operations
     */
    handleDBAccess() {
        return new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === 'symbol') return undefined;
                return this.getFromIndexedDB('fxStore', prop);
            },
            set: (target, prop, value) => {
                if (typeof prop === 'symbol') return false;
                this.setToIndexedDB('fxStore', prop, value);
                return true;
            }
        });
    }

    /**
     * @method getFromIndexedDB
     * @description Retrieves a value from IndexedDB
     * @param {string} storeName - The name of the object store
     * @param {string} key - The key to retrieve
     * @returns {*} The value associated with the key
     */
    getFromIndexedDB(storeName, key) {
        return this.context.await(async () => {
            const db = await this.dbPromise;
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            return await store.get(key);
        });
    }

    /**
     * @method setToIndexedDB
     * @description Sets a value in IndexedDB
     * @param {string} storeName - The name of the object store
     * @param {string} key - The key to set
     * @param {*} value - The value to store
     * @returns {boolean} True if the operation was successful
     */
    setToIndexedDB(storeName, key, value) {
        return this.context.await(async () => {
            const db = await this.dbPromise;
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            await store.put(value, key);
            return true;
        });
    }

    /**
     * @method handleStorageAccess
     * @description Handles access to localStorage or sessionStorage
     * @param {string} type - The type of storage ('local' or 'session')
     * @returns {Proxy} A proxy for storage operations
     */
    handleStorageAccess(type) {
        const storage = type === 'local' ? localStorage : sessionStorage;
        return new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === 'symbol') return undefined;
                const value = storage.getItem(prop);
                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            },
            set: (target, prop, value) => {
                if (typeof prop === 'symbol') return false;
                storage.setItem(prop, JSON.stringify(value));
                return true;
            }
        });
    }

    /**
     * @method handleEnvAccess
     * @description Handles access to environment variables
     * @returns {Proxy} A proxy for environment variable access
     */
    handleEnvAccess() {
        return new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === 'symbol') return undefined;
                return process.env[prop];
            }
        });
    }

    /**
     * @method initIndexedDB
     * @description Initializes the IndexedDB database
     * @returns {Promise<IDBDatabase>} A promise that resolves to the opened database
     */
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FxDB', 1);
            request.onerror = () => reject(new Error('Failed to open IndexedDB'));
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore('fxStore');
            };
        });
    }

    /**
     * @method manifest
     * @description Adds or updates a manifest entry
     * @param {string} path - The path for the manifest entry
     * @param {Object} config - The configuration for the manifest entry
     */
    manifest(path, config) {
        this.manifestObj[path] = {
            ...config,
            defer: config.defer !== false
        };
        if (!config.defer) {
            this.resources.set(path, this.createResource(config));
        }
    }

    /**
     * @method load
     * @description Loads a resource and optionally adds it to the manifest
     * @param {Object} config - The resource configuration
     * @param {string} [config.prop] - The property path for the resource
     * @param {boolean} [config.defer=false] - Whether to defer loading
     * @returns {*} The loaded resource or undefined if deferred
     */
    load(config) {
        const {
            prop,
            defer = false,
            ...resourceConfig
        } = config;
        if (prop) {
            this.manifest(prop, resourceConfig);
        }
        if (!defer) {
            const resource = this.createResource(resourceConfig);
            if (prop) {
                this.resources.set(prop, resource);
            }
            return resource.load();
        }
    }

    /**
     * @method set
     * @description Sets a value in the dynamic store
     * @param {string} key - The key to set
     * @param {*} value - The value to set
     * @returns {FX} The FX instance for chaining
     */
    set(key, value) {
        this.dynamicProperties.set(key, value);
        return this;
    }

    /**
     * @method get
     * @description Gets a value from the dynamic store
     * @param {string} key - The key to get
     * @param {*} [defaultValue] - The default value to return if the key is not found
     * @returns {*} The value associated with the key, or the default value
     */
    get(key, defaultValue) {
        return this.dynamicProperties.has(key) ? this.dynamicProperties.get(key) : defaultValue;
    }

    /**
     * @method data
     * @description Gets or sets a value in the dynamic store
     * @param {string} key - The key to get or set
     * @param {*} [value] - The value to set (if provided)
     * @returns {*} The value if getting, or the FX instance if setting
     */
    data(key, value) {
        if (arguments.length === 1) {
            return this.get(key);
        }
        return this.set(key, value);
    }
}

// Create and export the FX instance
const fx = new FX();
export default fx;
```

## File: index.html
```html
<!-- index.html -->
<!DOCTYPE html>
<html>

<head>
    <title>FX Class Test</title>
    <script type="module" src="main.js" defer></script>
</head>

<body>


</body>

</html>
```

## File: user.json
```json
{
    "name": "Charl",
    "surname": "Cronje",
    "email": "charl@cronje.me"
}
```

## File: convert_env_to_file.php
```php
<?php
/**
 * This script reads a .env file and converts it to either a .json or .js file based on the specified output file extension or URL parameter.
 * Adjust the $envFilePath and $outputFilePath to point to your directories.
 */

// Configuration: Path to the .env file and the output file
$envFilePath = __DIR__ . '/.env'; // Replace with the actual path to your .env file
$outputFilePath = __DIR__ . '/env.json'; // Default path for the output file (either .json or .js)

// Check for URL parameter to override the file extension
if (isset($_GET['ext'])) {
    $extension = $_GET['ext'];
    if ($extension === 'json') {
        $outputFilePath = __DIR__ . '/env.json';
    } elseif ($extension === 'js') {
        $outputFilePath = __DIR__ . '/env.js';
    } else {
        throw new Exception("Unsupported file extension: $extension");
    }
}

/**
 * Function to parse the .env file.
 *
 * @param string $filePath The path to the .env file.
 * @return array An associative array of environment variables.
 */
function parseEnvFile($filePath) {
    if (!file_exists($filePath)) {
        throw new Exception("File not found: $filePath");
    }

    $envVars = [];
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments and blank lines
        if (strpos(trim($line), '#') === 0 || trim($line) === '') {
            continue;
        }

        // Split line into name and value
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        // Remove surrounding quotes from the value
        if (preg_match('/^"(.*)"$/', $value, $matches)) {
            $value = $matches[1];
        } elseif (preg_match("/^'(.*)'$/", $value, $matches)) {
            $value = $matches[1];
        }

        // Expand variables
        $value = preg_replace_callback('/\${([^}]+)}/', function($matches) use ($envVars) {
            return isset($envVars[$matches[1]]) ? $envVars[$matches[1]] : '';
        }, $value);

        $envVars[$name] = $value;
    }

    return $envVars;
}

/**
 * Function to save the environment variables to a .json or .js file and output the content.
 *
 * @param array $envVars The associative array of environment variables.
 * @param string $filePath The path to the output file.
 */
function saveEnvToFile($envVars, $filePath) {
    $fileExtension = pathinfo($filePath, PATHINFO_EXTENSION);

    if ($fileExtension === 'json') {
        $content = json_encode($envVars, JSON_PRETTY_PRINT);
    } elseif ($fileExtension === 'js') {
        $jsonContent = json_encode($envVars, JSON_PRETTY_PRINT);
        $content = "export const env = $jsonContent;";
    } else {
        throw new Exception("Unsupported file extension: $fileExtension");
    }

    if (file_put_contents($filePath, $content) === false) {
        throw new Exception("Failed to write to file: $filePath");
    }

    // Output the content
    header('Content-Type: ' . ($fileExtension === 'json' ? 'application/json' : 'application/javascript'));
    echo $content;
}

try {
    // Parse the .env file
    $envVars = parseEnvFile($envFilePath);

    // Save the environment variables to the output file and display the content
    saveEnvToFile($envVars, $outputFilePath);
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}

```

## File: .env
```
API_KEY="your_api_key"
DB_HOST="localhost"
DB_PORT="3306"
DB_URL="localhost:3306"
```

## File: hashes.json
```json
{
    "user.js": "f939a495d4d1c2fcff49bf34766319c4",
    "product.js": "8abd2fb808835e0449d2b085f5435f16",
    "utils.js": "aa24b9f4d57e8f57cac8084582f8636d",
    "multipleExports.js": "5f0ec19d775bc3e68dead5d23edaa4dc",
    "log.js": "1c5dc136f93e297f0943cb5d915c39c2"
}
```

## File: manifest.php
```php
<?php
/**
 * This script reads the manifest.json file, converts it to manifest.js format, and echoes the content.
 */

$manifestJsonPath = 'manifest.json'; // Path to the manifest.json file
$manifestJsPath = 'manifest.js'; // Path to the manifest.js file

// Function to convert JSON to JS format
function convertJsonToJs($jsonContent) {
    $jsContent = "export const manifest = " . json_encode($jsonContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . ";\n";
    // Replace double quotes with single quotes for JS format
    $jsContent = str_replace('"', "'", $jsContent);
    // Fix colons and commas to follow JS object syntax
    $jsContent = preg_replace("/'(\\w+)':/", '$1:', $jsContent);
    return $jsContent;
}

// Read the JSON file
$jsonContent = file_get_contents($manifestJsonPath);
if ($jsonContent === false) {
    die("Error reading manifest.json file.");
}

// Decode the JSON content
$manifestArray = json_decode($jsonContent, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die("Error decoding JSON: " . json_last_error_msg());
}

// Convert JSON to JS format
$jsContent = convertJsonToJs($manifestArray);

// Save the JS content to manifest.js
file_put_contents($manifestJsPath, $jsContent);

// Echo the JS content
header('Content-Type: application/javascript');
echo $jsContent;

```

## File: manifest.json
```json
{
    "manifest": {
        "help": {
            "path": "modules/help.js",
            "type": "instance",
            "mainExport": "Help"
        },
        "user": {
            "path": "modules/user.js",
            "type": "instance",
            "mainExport": "User"
        },
        "product": {
            "path": "modules/product.js",
            "type": "class",
            "mainExport": "Product"
        },
        "utils": {
            "path": "modules/utils.js",
            "type": "function",
            "mainExport": "calculateTotal"
        },
        "multipleExports": {
            "path": "modules/multipleExports.js",
            "type": "instance",
            "mainExport": "Order",
            "additionalExports": {
                "cancelOrder": "cancelOrder"
            }
        },
        "log": {
            "path": "modules/log.js",
            "type": "function",
            "mainExport": "log"
        },
        "setDebug": {
            "path": "modules/log.js",
            "type": "function",
            "mainExport": "setDebug"
        },
        "env": {
            "path": "/env.js",
            "type": "object",
            "mainExport": "env"
        },
        "api": {
            "users": {
                "type": "api",
                "baseUrl": "https://api.example.com/users",
                "methods": ["GET", "POST", "PUT", "DELETE"]
            },
            "posts": {
                "type": "api",
                "baseUrl": "https://jsonplaceholder.typicode.com/posts",
                "methods": ["GET", "POST", "PUT", "DELETE"]
            }
        },
        "styles": {
            "main": {
                "type": "css",
                "path": "/styles/main.css",
                "scope": "global",
                "transformations": ["autoprefixer", "minify"]
            },
            "secondary": {
                "type": "css",
                "path": "/styles/secondary.css",
                "scope": "#app",
                "transformations": ["autoprefixer", "minify"]
            }
        },
        "templates": {
            "user": {
                "card": {
                    "type": "html",
                    "path": "/templates/user-card.html"
                },
                "profile": {
                    "type": "html",
                    "path": "/templates/user-profile.html"
                }
            },
            "product": {
                "card": {
                    "type": "html",
                    "path": "/templates/product-card.html"
                }
            }
        },
        "modules": {
            "user": {
                "type": "module",
                "path": "/modules/user.js",
                "mainExport": "User"
            },
            "counter": {
                "type": "class",
                "path": "/modules/counter.js",
                "mainExport": "Counter"
            }
        },
        "data": {
            "config": {
                "type": "json",
                "path": "/data/config.json"
            },
            "localization": {
                "type": "json",
                "path": "/data/localization.json"
            }
        },
        "raw": {
            "readme": {
                "type": "raw",
                "path": "/README.md"
            },
            "changelog": {
                "type": "raw",
                "path": "/CHANGELOG.md"
            }
        }
    }
}
```

## File: manifest.js
```js
export const manifest = {
    help: {
        path: 'modules/help.js',
        type: 'instance',
        mainExport: 'Help'
    },
    user: {
        path: 'modules/user.js',
        type: 'instance',
        mainExport: 'User'
    },
    product: {
        path: 'modules/product.js',
        type: 'class',
        mainExport: 'Product'
    },
    utils: {
        path: 'modules/utils.js',
        type: 'function',
        mainExport: 'calculateTotal'
    },
    multipleExports: {
        path: 'modules/multipleExports.js',
        type: 'instance',
        mainExport: 'Order',
        additionalExports: {
            cancelOrder: 'cancelOrder'
        }
    },
    log: {
        path: 'modules/log.js',
        type: 'function',
        mainExport: 'log'
    },
    setDebug: {
        path: 'modules/log.js',
        type: 'function',
        mainExport: 'setDebug'
    },
    env: {
        path: '/env.js',
        type: 'object',
        mainExport: 'env'
    },
    api: {
        users: {
            type: 'api',
            baseUrl: 'https://fx.webally.co.za/api',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        },
        posts: {
            type: 'api',
            baseUrl: 'https://jsonplaceholder.typicode.com/posts',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    },
    styles: {
        main: {
            type: 'css',
            path: '/styles/main.css',
            scope: 'global',
            transformations: ['autoprefixer', 'minify']
        },
        secondary: {
            type: 'css',
            path: '/styles/secondary.css',
            scope: '#app',
            transformations: ['autoprefixer', 'minify']
        }
    },
    templates: {
        user: {
            card: {
                type: 'html',
                path: '/templates/user-card.html'
            },
            profile: {
                type: 'html',
                path: '/templates/user-profile.html'
            }
        },
        product: {
            card: {
                type: 'html',
                path: '/templates/product-card.html'
            }
        }
    },
    modules: {
        user: {
            type: 'module',
            path: '/modules/user.js',
            mainExport: 'User'
        },
        counter: {
            type: 'class',
            path: '/modules/counter.js',
            mainExport: 'Counter'
        }
    },
    data: {
        config: {
            type: 'json',
            path: '/data/config.json'
        },
        localization: {
            type: 'json',
            path: '/data/localization.json'
        }
    },
    raw: {
        readme: {
            type: 'raw',
            path: '/README.md'
        },
        changelog: {
            type: 'raw',
            path: '/CHANGELOG.md'
        }
    }
};
```

## File: config.json
```json
{
    "apiKey": "your-api-key-here",
    "debug": true,
    "maxRetries": 3,
    "timeout": 5000
}
```

## File: main.js
```js
import fx from './fx.js';

console.log('Starting FX features test...');

try {
    console.log('Testing API access...');
    const users = fx.api.users.get('/users');
    console.log('API users:', users);

    console.log('Testing nested property access...');
    const userCardTemplate = fx.templates.user.card;
    console.log('User card template:', userCardTemplate);

    console.log('Testing resource creation...');
    const mainStyles = fx.styles.main;
    console.log('CSS resource:', mainStyles);

    console.log('Testing dynamic property...');
    fx.dynamicProp = {
        nested: {
            value: 42
        }
    };
    console.log('Dynamic property:', fx.dynamicProp.nested.value);

    console.log('Testing method call on API resource...');
    const newUser = fx.api.users.post('/users', {
        body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com'
        })
    });
    console.log('New user:', newUser);

    console.log('Testing environment variable access...');
    const apiKey = fx.env.API_KEY;
    console.log('API Key:', apiKey);

    console.log('Testing local storage access...');
    fx.store.testItem = 'Test Value';
    console.log('Local Storage Item:', fx.store.testItem);

    console.log('Testing IndexedDB access...');
    fx.db.testItem = {
        key: 'value'
    };
    console.log('IndexedDB Item:', fx.db.testItem);

    console.log('FX features test completed successfully.');
} catch (error) {
    console.error('Error during FX features test:', error);
}
```

## File: help.html
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FX Library Help</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal {
            background: white;
            padding: 20px;
            border-radius: 5px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }

        .close-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 24px;
            cursor: pointer;
        }

        h1,
        h2 {
            color: #333;
        }

        code {
            background-color: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
        }

        pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>

<body>
    <div class="overlay">
        <div class="modal">
            <span class="close-btn" onclick="closeHelp()">&times;</span>
            <h1>FX Library Features</h1>

            <h2>1. Dynamic Properties</h2>
            <p>Set and get dynamic properties easily:</p>
            <pre><code>// Setting properties
fx.user.name = "Peter";
fx.set("user.name", "Peter", "Default Value");
fx.data("user.name", "Peter");

// Getting properties
const userName1 = fx.user.name;
const userName2 = fx.get("user.name", "Default Value");
const userName3 = fx.data("user.name");</code></pre>

            <h2>2. Local/Session Storage</h2>
            <p>Easily interact with local and session storage:</p>
            <pre><code>// Local storage
fx.store.key = "Value";
const localValue = fx.store.key;

// Session storage
fx.session.key = "Value";
const sessionValue = fx.session.key;</code></pre>

            <h2>3. IndexedDB Integration</h2>
            <p>Work with IndexedDB seamlessly:</p>
            <pre><code>fx.db.users.add({id: 1, name: "Peter"});
const user = fx.db.users.get(1);</code></pre>

            <h2>4. Instance from Module</h2>
            <p>Load and use class instances from modules:</p>
            <pre><code>// Manifest
{
    user: {
        path: 'modules/user.js',
        type: 'instance',
        mainExport: 'User'
    }
}

// Usage
fx.user.addUser("Peter Piper");</code></pre>

            <h2>5. Class from Module</h2>
            <p>Load and use classes from modules:</p>
            <pre><code>// Manifest
{
    product: {
        path: 'modules/product.js',
        type: 'class',
        mainExport: 'Product'
    }
}

// Usage
const product = new fx.product();
</code>
</pre>

            <h2>6. Function from Module</h2>
            <p>Load and use functions from modules:</p>
            <pre><code>// Manifest
{
    utils: {
        calc: {
            total: {
                path: 'modules/utils.js',
                type: 'function',
                mainExport: 'calculateTotal'
            }
        }
    }
}

// Usage
const total = fx.utils.calc.total(30, 5);
</code>
</pre>

            <h2>7. Multiple Exports</h2>
            <p>Work with modules that have multiple exports:</p>
            <pre><code>// Manifest
{
    multipleExports: {
        path: 'modules/multipleExports.js',
        type: 'instance',
        mainExport: 'Order',
        additionalExports: {
            cancelOrder: 'cancelOrder'
        }
    }
}

// Usage
const order = fx.multipleExports;  // Instance of Order
order.placeOrder("Product A", 2);  // Method from main export
fx.multipleExports.cancelOrder("ORDER123");  // Additional export</code></pre>

            <h2>8. CSS Loading</h2>
            <p>Load and apply CSS dynamically:</p>
            <pre><code>// Manifest
{
    styles: {
        main: {
            type: 'css',
            path: '/styles/main.css',
            scope: 'global',
            transformations: ['autoprefixer', 'minify']
        }
    }
}

// Usage
console.log(fx.styles.main);</code></pre>

            <h2>9. HTML Templates</h2>
            <p>Load and use HTML templates:</p>
            <pre><code>// Manifest
{
    templates: {
        user: {
            card: {
                type: 'html',
                path: '/templates/user-card.html'
            }
        }
    }
}

// Usage
const userCardTemplate = fx.templates.user.card;
const userCardHtml = userCardTemplate({name: "John Doe", email: "john@example.com"});</code></pre>

            <h2>10. JSON Data</h2>
            <p>Load and use JSON data:</p>
            <pre><code>// Manifest
{
    data: {
        config: {
            type: 'json',
            path: '/data/config.json'
        }
    }
}

// Usage
const config = fx.data.config;
console.log(config.apiKey);</code></pre>

            <h2>11. Raw Files</h2>
            <p>Load raw file contents:</p>
            <pre><code>// Manifest
{
    raw: {
        readme: {
            type: 'raw',
            path: '/README.md'
        }
    }
}

// Usage
const readmeContent = fx.raw.readme;
console.log(readmeContent);</code></pre>


            <h2>12. Sync-like API for Asynchronous Operations</h2>
            <p>FX allows you to write asynchronous code in a synchronous style.</p>
            <pre><code>
const users = fx.api.users.get('/api/users');
console.log(users);  // This works without await!</code></pre>

            <h2>13. Sequence Control</h2>
            <p>Control the order of execution using sequence identifiers.</p>
            <pre><code>
fx(1).api.users.get('/api/users');
fx(1).api.posts.get('/api/posts');  // This runs after the previous call
fx(2).api.comments.get('/api/comments');  // This can run in parallel</code></pre>

            <h2>14. Automatic Retry</h2>
            <p>Automatically retry failed operations.</p>
            <pre><code>
fx({ retry: 3 }).api.users.get('/api/users');  // Will retry up to 3 times on failure</code></pre>

            <h2>15. Caching</h2>
            <p>Cache results for improved performance.</p>
            <pre><code>
fx({ cache: 5000 }).api.users.get('/api/users');  // Cache result for 5 seconds</code></pre>

            <h2>16. Logging</h2>
            <p>Log operations for debugging purposes.</p>
            <pre><code>
fx({ log: 3 }).api.users.get('/api/users');  // Log both call initiation and result</code></pre>

            <h2>17. Callback Support</h2>
            <p>Execute a callback function after an operation completes.</p>
            <pre><code>fx({ cb: (result) => console.log(result) }).api.users.get('/api/users');</code></pre>

            <h2>18. Sequence Callback</h2>
            <p>Trigger another sequence after the current one completes.</p>
            <pre><code>fx({ sq: 1, sqcb: 2 }).api.users.get('/api/users');
fx({ sq: 2 }).api.posts.get('/api/posts');  // This will run after the users API call</code></pre>

            <h2>19. Resource Loading</h2>
            <p>Load various types of resources easily.</p>
            <pre><code>
const template = fx.load({ type: "html", path: "/template.html" });
const styles = fx.load({ type: "css", path: "/styles.css" });
const config = fx.load({ type: "json", path: "/config.json" });</code></pre>

            <h2>20. IndexedDB Integration</h2>
            <p>Seamlessly work with IndexedDB for client-side storage.</p>
            <pre><code>
fx.db.users.add({ name: "John Doe" });
const user = fx.db.users.get(1);</code></pre>

            <h2>21. Environment Variable Access</h2>
            <p>Access environment variables easily.</p>
            <pre><code>const apiKey = fx.env.API_KEY;</code></pre>

            <h2>Unintentional Features</h2>

            <h3>1. Proxy-based Property Creation</h3>
            <p>Dynamically create properties that don't exist.</p>
            <pre><code>fx.nonExistentApi.someMethod();  // This creates a new API endpoint on the fly</code></pre>

            <h3>2. Infinite Chaining</h3>
            <p>Chain methods indefinitely without errors.</p>
            <pre><code>fx.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z();</code></pre>

            <h3>3. Mixed Sequence and Non-sequence Calls</h3>
            <p>Mix sequenced and non-sequenced calls in unexpected ways.</p>
            <pre><code>fx(1).api.users.get('/api/users');
fx.api.posts.get('/api/posts');
fx(1).api.comments.get('/api/comments');</code></pre>

            <h3>4. Recursive Configuration</h3>
            <p>Apply configurations recursively.</p>
            <pre><code>fx({ log: 3 }).fx({ retry: 2 }).fx({ cache: 5000 }).api.users.get('/api/users');</code></pre>

            <h3>5. Dynamic Resource Type Conversion</h3>
            <p>Attempt to convert between resource types on the fly.</p>
            <pre><code>const htmlAsJson = fx.load({ type: "json", path: "/template.html" });</code></pre>

            <p>Note: These unintentional features may not always work as expected and are not officially supported. Use them at your own risk!</p>
        </div>
    </div>

    <script>
        function closeHelp() {
            document.querySelector('.overlay').style.display = 'none';
        }
    </script>



</body>

</html>
```

## File: modules/product.js
```js
// **modules/product.js**
export class Product {
    static createProduct(name) {
        console.log(`Product ${name} created.`);
    }
}
```

## File: modules/user.js
```js
// **modules/user.js**
export default class User {

    constructor() {
        console.log('User instance created');
    }

    addUser() {
        console.log('User added');
    }

    getUsers() {
        console.log('Users retrieved');
    }
}
```

## File: modules/utils.js
```js
export class Utils {
    static calculateTotal(price, quantity) {
        return price * quantity;
    }

    static formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }
}
```

## File: modules/multipleExports.js
```js
// **modules/multipleExports.js**
export class Order {
    constructor() {
        console.log('Order instance created');
    }

    placeOrder(item, quantity) {
        console.log(`Order placed for ${quantity} ${item}(s)`);
    }
}

export function cancelOrder(orderId) {
    console.log(`Order ${orderId} canceled`);
}
```

## File: modules/log.js
```js
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
```

## File: modules/counter.js
```js
// /modules/counter.js
export class Counter {
    constructor(initialValue = 0) {
        this.value = initialValue;
    }

    increment() {
        this.value++;
    }

    decrement() {
        this.value--;
    }

    getValue() {
        return this.value;
    }

    reset() {
        this.value = 0;
    }
}
```

## File: modules/dynamic-module.js
```js
// /modules/dynamic-module.js
export class DynamicModule {
    static getMessage() {
        return "Hello from dynamically loaded module!";
    }
}
```

## File: modules/lazy-loaded-module.js
```js
// /modules/lazy-loaded-module.js
export class LazyLoadedModule {
    static getData() {
        return {
            message: "This module was lazy loaded!"
        };
    }
}
```

## File: modules/help.js
```js
// help.js
export class Help {
    constructor(fx) {
        this.fx = fx;
        this.helpContent = null;
    }

    async loadContent() {
        if (!this.helpContent) {
            this.helpContent = await this.fx.load({
                type: "html",
                path: "/help.html"
            });
        }
    }

    async show() {
        await this.loadContent();
        if (!document.getElementById('fx-help-container')) {
            const helpContainer = document.createElement('div');
            helpContainer.id = 'fx-help-container';
            document.body.appendChild(helpContainer);
        }
        document.getElementById('fx-help-container').innerHTML = this.helpContent;
        document.querySelector('.overlay').style.display = 'flex';
    }

    hide() {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}
```

## File: templates/user-card.html
```html
<!-- /templates/user-card.html -->
<div class="user-card">
    <h2 class="user-name"></h2>
    <p class="user-email"></p>
    <button class="user-action">View Profile</button>
</div>
```

## File: templates/user-profile.html
```html
<!-- /templates/user-profile.html -->
<div class="user-profile">
    <h2 class="user-name"></h2>
    <img class="user-avatar" src="" alt="User avatar">
    <p class="user-email"></p>
    <p class="user-bio"></p>
    <div class="user-stats">
        <span class="user-posts-count"></span> posts
        <span class="user-followers-count"></span> followers
        <span class="user-following-count"></span> following
    </div>
    <button class="btn-follow">Follow</button>
</div>
```

## File: templates/product-card.html
```html
<!-- /templates/product-card.html -->
<div class="product-card">
    <img class="product-image" src="" alt="Product image">
    <h3 class="product-name"></h3>
    <p class="product-description"></p>
    <div class="product-price"></div>
    <div class="product-rating">
        <span class="stars"></span>
        <span class="review-count"></span> reviews
    </div>
    <button class="btn-add-to-cart">Add to Cart</button>
</div>
```

## File: data/localization.json
```json
{
    "en": {
        "greeting": "Hello",
        "welcome": "Welcome to our website",
        "login": "Log in",
        "signup": "Sign up",
        "search": "Search",
        "menu": {
            "home": "Home",
            "products": "Products",
            "about": "About",
            "contact": "Contact"
        },
        "footer": {
            "copyright": "© 2023 Our Company. All rights reserved.",
            "terms": "Terms of Service",
            "privacy": "Privacy Policy"
        }
    },
    "es": {
        "greeting": "Hola",
        "welcome": "Bienvenido a nuestro sitio web",
        "login": "Iniciar sesión",
        "signup": "Registrarse",
        "search": "Buscar",
        "menu": {
            "home": "Inicio",
            "products": "Productos",
            "about": "Acerca de",
            "contact": "Contacto"
        },
        "footer": {
            "copyright": "© 2023 Nuestra Compañía. Todos los derechos reservados.",
            "terms": "Términos de Servicio",
            "privacy": "Política de Privacidad"
        }
    }
}
```

## File: tests/api/users.php
```php
<?php
// tests/api/users.php
header("Content-Type: application/json");
require_once 'json_helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = isset($_GET['id']) ? $_GET['id'] : null;
$usersFile = 'users.json';

switch ($method) {
    case 'GET':
        $users = readJsonFile($usersFile);
        if ($userId) {
            $user = isset($users[$userId]) ? $users[$userId] : null;
            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found"]);
            }
        } else {
            echo json_encode(array_values($users));
        }
        break;

    case 'POST':
        $users = readJsonFile($usersFile);
        $data = json_decode(file_get_contents("php://input"), true);
        $newId = (string)(count($users) + 1);
        $users[$newId] = $data + ['id' => $newId];
        writeJsonFile($usersFile, $users);
        echo json_encode($users[$newId]);
        break;

    case 'PUT':
        if ($userId) {
            $users = readJsonFile($usersFile);
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($users[$userId])) {
                $users[$userId] = $data + ['id' => $userId];
                writeJsonFile($usersFile, $users);
                echo json_encode($users[$userId]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
        }
        break;

    case 'DELETE':
        if ($userId) {
            $users = readJsonFile($usersFile);
            if (isset($users[$userId])) {
                unset($users[$userId]);
                writeJsonFile($usersFile, $users);
                echo json_encode(["message" => "User deleted"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
```

## File: tests/api/json_helper.php
```php
<?php
// tests/api/json_helper.php

/**
 * Reads a JSON file and returns its contents as an associative array.
 * If the file doesn't exist, it creates an empty JSON file.
 *
 * @param string $filename The name of the JSON file to read
 * @return array The contents of the JSON file as an associative array
 */
function readJsonFile($filename) {
    if (!file_exists($filename)) {
        file_put_contents($filename, json_encode([]));
    }
    return json_decode(file_get_contents($filename), true);
}

/**
 * Writes data to a JSON file.
 *
 * @param string $filename The name of the JSON file to write to
 * @param array $data The data to write to the file
 */
function writeJsonFile($filename, $data) {
    file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
}
```

## File: tests/api/posts.php
```php
<?php
// tests/api/posts.php
header("Content-Type: application/json");
require_once 'json_helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$postId = isset($_GET['id']) ? $_GET['id'] : null;
$postsFile = 'posts.json';

switch ($method) {
    case 'GET':
        $posts = readJsonFile($postsFile);
        if ($postId) {
            $post = isset($posts[$postId]) ? $posts[$postId] : null;
            if ($post) {
                echo json_encode($post);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
            }
        } else {
            echo json_encode(array_values($posts));
        }
        break;

    case 'POST':
        $posts = readJsonFile($postsFile);
        $data = json_decode(file_get_contents("php://input"), true);
        $newId = (string)(count($posts) + 1);
        $posts[$newId] = $data + ['id' => $newId];
        writeJsonFile($postsFile, $posts);
        echo json_encode($posts[$newId]);
        break;

    case 'PUT':
        if ($postId) {
            $posts = readJsonFile($postsFile);
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($posts[$postId])) {
                $posts[$postId] = $data + ['id' => $postId];
                writeJsonFile($postsFile, $posts);
                echo json_encode($posts[$postId]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Post ID is required"]);
        }
        break;

    case 'DELETE':
        if ($postId) {
            $posts = readJsonFile($postsFile);
            if (isset($posts[$postId])) {
                unset($posts[$postId]);
                writeJsonFile($postsFile, $posts);
                echo json_encode(["message" => "Post deleted"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Post ID is required"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
```

## File: tests/api/comments.php
```php
<?php
// tests/api/comments.php
header("Content-Type: application/json");
require_once 'json_helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$commentId = isset($_GET['id']) ? $_GET['id'] : null;
$commentsFile = 'comments.json';

switch ($method) {
    case 'GET':
        $comments = readJsonFile($commentsFile);
        if ($commentId) {
            $comment = isset($comments[$commentId]) ? $comments[$commentId] : null;
            if ($comment) {
                echo json_encode($comment);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Comment not found"]);
            }
        } else {
            echo json_encode(array_values($comments));
        }
        break;

    case 'POST':
        $comments = readJsonFile($commentsFile);
        $data = json_decode(file_get_contents("php://input"), true);
        $newId = (string)(count($comments) + 1);
        $comments[$newId] = $data + ['id' => $newId];
        writeJsonFile($commentsFile, $comments);
        echo json_encode($comments[$newId]);
        break;

    case 'PUT':
        if ($commentId) {
            $comments = readJsonFile($commentsFile);
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($comments[$commentId])) {
                $comments[$commentId] = $data + ['id' => $commentId];
                writeJsonFile($commentsFile, $comments);
                echo json_encode($comments[$commentId]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Comment not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Comment ID is required"]);
        }
        break;

    case 'DELETE':
        if ($commentId) {
            $comments = readJsonFile($commentsFile);
            if (isset($comments[$commentId])) {
                unset($comments[$commentId]);
                writeJsonFile($commentsFile, $comments);
                echo json_encode(["message" => "Comment deleted"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Comment not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Comment ID is required"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
```

## File: tests/api/users.json
```json
{
    "1": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30
    },
    "2": {
        "id": "2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "age": 28
    },
    "3": {
        "id": "3",
        "name": "Bob Johnson",
        "email": "bob@example.com",
        "age": 35
    }
}
```

## File: tests/api/comments.json
```json
{
    "1": {
        "id": "1",
        "postId": "1",
        "userId": "2",
        "content": "Great post! Thanks for sharing.",
        "createdAt": "2023-07-07T10:30:00Z"
    },
    "2": {
        "id": "2",
        "postId": "1",
        "userId": "3",
        "content": "I found this very informative.",
        "createdAt": "2023-07-07T11:15:00Z"
    },
    "3": {
        "id": "3",
        "postId": "2",
        "userId": "1",
        "content": "Interesting perspective. I'd like to add...",
        "createdAt": "2023-07-07T14:45:00Z"
    }
}
```



<p id="hidden_comment">
    This is a hidden comment. It explains that the following style tag is meant to 
    style HTML content if this Markdown is converted to HTML. This comment should 
    not be visible in most Markdown renderers.
</p>
<style>
    #hidden_comment {
        display: none;
    }
    table {
        width: 100%;
    }
    table tr:first-child {
        font-weight: bold;
    }
    table tr:last-child {
        font-style: italic;
    }
</style>
