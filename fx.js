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
export class FX {
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