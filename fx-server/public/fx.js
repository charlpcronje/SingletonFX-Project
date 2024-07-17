/**
 * @file fx.js
 * @description Comprehensive FX class for managing resources with a sync-like API
 */

import initialManifest from './manifest.js';

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
    await (promise) {
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
        const {
            sq,
            cache,
            retry,
            cb,
            sqcb
        } = config;

        if (!this.sequences.has(sq)) {
            this.sequences.set(sq, Promise.resolve());
        }

        const sequence = this.sequences.get(sq).then(async () => {
            const cacheKey = JSON.stringify({
                fn: fn.toString(),
                config
            });
            if (cache && cache !== 1 && this.cache.has(cacheKey)) {
                const {
                    value,
                    timestamp
                } = this.cache.get(cacheKey);
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
                this.cache.set(cacheKey, {
                    value: result,
                    timestamp: Date.now()
                });
            }

            if (cb) cb(result);

            if (sqcb !== undefined) {
                this.sequences.get(sqcb) ?.then(() => {
                    this.runAsync(() => {}, {
                        sq: sqcb
                    });
                });
            }

            return result;
        });

        this.sequences.set(sq, sequence);
        return sequence;
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
                if (typeof target === 'function') {
                    return returnReflect.apply(target, thisArg, argumentsList); // Call the original function
                }
                return this.fx(...args);
            }
        });
    }

    async initialize(createManifest) {
        const manifest = createManifest(this);
        await this.loadManifest(manifest);
    }

    fx(config = {}) {
        const processedConfig = this.processConfig(config);
        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof target[prop] === 'function') {
                    return (...args) => this.context.runAsync(() => target[prop](...args), processedConfig);
                }
                if (typeof target[prop] === 'object' && target[prop] !== null) {
                    return new Proxy(target[prop], {
                        get: (t, p) => {
                            if (typeof t[p] === 'function') {
                                return (...a) => this.context.runAsync(() => t[p](...a), processedConfig);
                            }
                            return t[p];
                        }
                    });
                }
                return target[prop];
            },
            set: (target, prop, value) => {
                target[prop] = value;
                return true;
            }
        });
    }

    processConfig(config) {
        if (typeof config !== 'object' || config === null) {
            config = {
                sq: config
            };
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
                    return new Proxy(target[prop], {
                        get: (t, p) => {
                            if (typeof t[p] === 'function') {
                                return (...a) => this.context.runAsync(() => t[p](...a), processedConfig);
                            }
                            return t[p];
                        }
                    });
                }
                return target[prop];
            },
            set: (target, prop, value) => {
                target[prop] = value;
                return true;
            }
        });
    }
    
    /**
     * @method loadManifest
     * @description Load the manifest and create resource instances
     * @param {Object} manifestObj - The manifest object
     * @param {string} [prefix=''] - The current prefix for nested objects
     */
    async loadManifest(manifestObj, prefix = '') {
        console.log("Loading manifest:", manifestObj);
        for (const [key, value] of Object.entries(manifestObj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            console.log(`Processing manifest entry: ${fullKey}`);

            if (typeof value === 'function') {
                // This is a loader function from our new manifest structure
                const loadedValue = await value();
                await this.loadManifest(loadedValue, fullKey);
            } else if (typeof value === 'object' && value !== null && !value.type) {
                // Create the nested structure
                let current = this.manifestObj;
                fullKey.split('.').forEach((part, index, array) => {
                    if (!current[part]) {
                        current[part] = index === array.length - 1 ? value : {};
                    }
                    current = current[part];
                });
                await this.loadManifest(value, fullKey);
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
        }
    }

    /**
     * @method createResource
     * @description Create a resource instance based on its type
     * @param {Object} config - The resource configuration
     * @param {String} fullKey - The full resource key
     * @returns {Resource} The created resource instance
     */
    createResource(config, fullKey) {
        console.log("Creating resource:", fullKey, config);
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

        if (typeof target[prop] === 'function') {
            // Directly return the function if it's not a resource
            return target[prop];
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

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.errorCode);
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                console.log("IndexedDB opened successfully");
            }
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
        if (config.type === 'object' && config.path) {
            return this.loadSubManifest(config.path);
        }
        const resource = this.createResource(config);
        return resource ? resource.load() : null;
    }

    /**
     * @method loadSubManifest
     * @description loads sub manifest
     * @param {string} path - The path for the manifest entry
     */
    async loadSubManifest(path) {
        console.log(`Loading sub-manifest from ${path}`);
        const module = await import(path);
        return module.default || module;
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