/**
 * @file fx.js
 * @description Comprehensive FX class for managing resources with a sync-like API
 */
import { ErrorHandler } from './fx/ErrorHandler.js';
import { Resource, createResourceFactory } from './fx/resources.js';
import initialManifest from './manifest.js';

console.log('Current NODE_ENV:', process.env.NODE_ENV);
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
         * @description Flag indicating whether a task is currently being executed.
         */
        this.isExecuting = false;

        /**
         * @type {Promise<void>}
         * @description Promise representing the current execution state.
         */
        this.executionPromise = Promise.resolve();

        /**
         * @type {number}
         * @description Counter for logging purposes.
         */
        this.logCount = 0;

        /**
         * @type {number}
         * @description Maximum time (in milliseconds) to wait for all tasks to complete.
         */
        this.maxWaitTime = 5000;

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

        console.log('ExecutionContext instance created');
    }

    /**
     * @method log
     * @description Logs a message with an incremental count.
     * @param {any} message - The message to be logged.
     */
    log(message) {
        console.log(`${++this.logCount}`, "ExecutionContext:", { message });
    }

    /**
     * @method waitForAll
     * @description Waits for all tasks to finish
     * @param {number} [timeout=5000] - Maximum time to wait in milliseconds
     * @returns {Promise<void>}
     * @throws {Error} If the timeout is reached before all tasks complete
     */
    async waitForAll(timeout = this.maxWaitTime) {
        console.log(`waitForAll called with timeout: ${timeout}ms`);
        const startTime = Date.now();

        while (this.taskQueue.length > 0 || this.isExecuting) {
            console.log(`Waiting. Tasks: ${this.taskQueue.length}, IsExecuting: ${this.isExecuting}`);
            if (Date.now() - startTime > timeout) {
                console.warn(`Timeout reached after ${timeout}ms. Tasks remaining: ${this.taskQueue.length}`);
                throw new Error(`ExecutionContext.waitForAll timed out after ${timeout}ms`);
            }
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        console.log('All tasks completed successfully');
    }

    /**
     * @method enqueue
     * @description Adds a task to the queue and starts execution if not already running.
     * @param {Function} task - The task to be added to the queue.
     */
    enqueue(task) {
        console.log(`Task enqueued. Queue length: ${this.taskQueue.length + 1}`);
        this.taskQueue.push(task);
        this.executeNext();
    }

    /**
     * @method executeNext
     * @description Executes the next task in the queue.
     * @private
     */
    async executeNext() {
        if (this.taskQueue.length === 0 || this.isExecuting) {
            console.log('No tasks to execute or execution in progress');
            return;
        }

        this.isExecuting = true;
        const task = this.taskQueue.shift();
        console.log(`Executing task. Remaining tasks: ${this.taskQueue.length}`);

        try {
            await task();
            console.log('Task completed successfully');
        } catch (error) {
            console.error('Task execution error:', error);
        } finally {
            this.isExecuting = false;
            this.executeNext();
        }
    }

    /**
     * @method await
     * @description Waits for a promise to resolve in a sync-like manner
     * @param {Promise} promise - The promise to await
     * @returns {Promise<any>} The resolved value of the promise
     * @throws {Error} If the promise rejects
     */
    await(promiseOrValue) {
        return Promise.resolve(promiseOrValue).catch(error => {
            console.error('Error in ExecutionContext.await:', error);
            throw error;
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
     * @throws {Error} If all retry attempts fail
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
                    if (attempt === (retry || 0)) {
                        console.error(`All retry attempts failed for sequence ${sq}:`, error);
                        throw error;
                    }
                    console.log(`Retry attempt ${attempt + 1} for sequence ${sq}`);
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
 * @class FX
 * @description Core class for managing resources with a composition-based approach
 */
class FX {
    /**
     * @type {FX}
     * @private
     * @description The singleton instance of FX
     */
    static #instance = null;

    /**
     * @constructor
     * @description Initializes the FX instance with all necessary components
     * @throws {Error} If attempting to create a new instance when one already exists
     */
    constructor() {
        if (FX.#instance) {
            throw new Error("FX is a singleton. Use FX.getInstance() instead of new FX().");
        }

        /**
         * @type {boolean}
         * @description Flag to enable debug mode
         */
        this.debug = false;

        /**
         * @type {Object}
         * @description Object to store the manifest
         */
        this.manifestObj = {};

        /**
         * @type {Object}
         * @description Object to store resource instances
         */
        this.resources = {};

        /**
         * @type {Object}
         * @description Object to store resource load promises
         */
        this.resourceLoadPromises = {};

        /**
         * @type {Map<string, any>}
         * @description Map to store dynamic properties
         */
        this.dynamicProperties = new Map();

        /**
         * @type {ErrorHandler}
         * @description Instance of ErrorHandler for handling errors
         */
        this.errorHandler = new ErrorHandler();

        /**
         * @type {ExecutionContext}
         * @description Instance of ExecutionContext for managing asynchronous tasks
         */
        this.context = new ExecutionContext();

        /**
         * @type {Promise<IDBDatabase>|null}
         * @description Promise that resolves to the IndexedDB instance, or null if not in a browser environment
         */
        this.dbPromise = this.initIndexedDB();

        /**
         * @type {WeakMap}
         * @description WeakMap to store proxy instances
         */
        this.proxyCache = new WeakMap();

        /**
         * @type {number}
         * @description Maximum recursion depth for nested property access
         */
        this.maxRecursionDepth = 10;

        /**
         * @type {number}
         * @description Default sequence number for async operations
         */
        this.defaultSequence = 0;

        /**
         * @type {Map<string, any>}
         * @description Map to store cached values
         */
        this.cache = new Map();

        /**
         * @type {Function}
         * @description Factory function for creating resource instances
         */
        this.resourceFactory = createResourceFactory();
        
        
         /**
         * @type {boolean}
         * @description True if FX is running in a browser
         */
        this.isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

        if (this.debug) console.log(`Running in ${this.isBrowser ? 'browser' : 'server'} environment`);



        // Enqueue the initial manifest loading task
        this.context.enqueue(async () => {
            try {
                if (this.debug) console.log('Executing initial FX task: Loading manifest');
                await this.loadManifest(initialManifest);
                if (this.debug) console.log('Initial FX task completed: Manifest loaded');
            } catch (error) {
                console.error('Error loading initial manifest:', error);
            }
        });

        const coreProperties = ['errorHandler', 'context', 'manifestObj', 'resources', 'dynamicProperties', 'dbPromise', 'resourceFactory'];
        const coreMethods = ['loadManifest', 'createResource', 'handleGet', 'handleSet', 'initIndexedDB', 'manifest', 'load', 'set', 'get', 'data', 'fx'];

        if (this.debug) console.log('FX instance created');

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (coreProperties.includes(prop) || coreMethods.includes(prop) || typeof target[prop] === 'function') {
                    return Reflect.get(target, prop, receiver);
                }
                return this.handleGet(target, prop, [], receiver);
            },
            set: (target, prop, value) => {
                if (coreProperties.includes(prop)) {
                    return Reflect.set(target, prop, value);
                }
                return this.handleSet(target, prop, value, []);
            }
        });
    }

    /**
     * @method getInstance
     * @static
     * @description Get the singleton instance of FX
     * @returns {FX} The singleton FX instance
     */
    static getInstance() {
        if (!FX.#instance) {
            console.log('Creating new FX instance');
            FX.#instance = new FX();
        } else {
            console.log('Returning existing FX instance');
        }
        return FX.#instance;
    }

    /**
     * @method getResource
     * @param {string} [type] - The type of resource to invalidate (optional)
     * @param {Object} config - Configuration for the operation
     * @returns 
     */
    getResource(type, config) {
        return this.context.runAsync(async () => {
            const ResourceClass = await this.resourceFactory(type);
            if (!ResourceClass) {
                throw new Error(`Unknown resource type: ${type}`);
            }
            return new ResourceClass(config, this.context);
        });
    }

    /**
     * @method cacheResources
     * @description Serialize and cache the current state of resources
     */
    cacheResources() {
        const cache = JSON.stringify(this.resources);
        localStorage.setItem('fx_resources_cache', cache);
        if (this.debug) console.log('Resources cached');
    }

    /**
     * @method invalidateResourceCache
     * @description Invalidate the cache for a specific resource or all resources
     * @param {string} [type] - The type of resource to invalidate (optional)
     */
    invalidateResourceCache(type) {
        if (type) {
            delete this.resources[type];
        } else {
            this.resources = {};
        }
        if (this.debug) console.log(`Cache invalidated${type ? ` for ${type}` : ''}`);
    }

    /**
     * @method loadCachedResources
     * @description Load resources from cache
     */
    loadCachedResources() {
        const cache = localStorage.getItem('fx_resources_cache');
        if (cache) {
            this.resources = JSON.parse(cache);
            if (this.debug) console.log('Resources loaded from cache');
        }
    }

    /**
     * @method loadManifest
     * @description Load the manifest and create resource instances using ExecutionContext
     * @param {Object} manifestObj - The manifest object
     * @param {string} [prefix=''] - The current prefix for nested objects
     * @returns {Promise<void>}
     */
    async loadManifest(manifestObj, prefix = '') {
        if (this.debug) console.log('FX.loadManifest called');
        
        const loadEntry = async (key, value) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (this.debug) console.log(`Processing manifest entry: ${fullKey}`);

            if (typeof value === 'function') {
                const loadedValue = await this.context.await(value());
                await this.loadManifest(loadedValue, fullKey);
            } else if (typeof value === 'object' && value !== null && !value.type) {
                let current = this.manifestObj;
                const parts = fullKey.split('.');
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        current[part] = value;
                    } else {
                        current[part] = current[part] || {};
                        current = current[part];
                    }
                }
                await this.loadManifest(value, fullKey);
            } else {
                let current = this.manifestObj;
                const parts = fullKey.split('.');
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        current[part] = value;
                    } else {
                        current[part] = current[part] || {};
                        current = current[part];
                    }
                }
                if (this.debug) console.log(`Added to manifestObj: ${fullKey}`);
                const resource = await this.createResource(value, fullKey);
                if (resource !== null) {
                    this.resources[fullKey] = resource;
                }
            }
        };

        const entries = Object.entries(manifestObj);
        const loadPromises = entries.map(([key, value]) => 
            this.context.runAsync(() => loadEntry(key, value), { sq: `load_manifest_${key}` })
        );

        await this.context.await(Promise.all(loadPromises));

        if (this.debug) console.log('FX.loadManifest completed');
    }


    /**
     * @method waitForAll
     * @description Waits for all pending tasks to complete
     * @param {number} [timeout=5000] - Maximum time to wait in milliseconds
     * @returns {Promise<void>}
     */
    async waitForAll(timeout = 5000) {
        if (this.debug) console.log(`FX.waitForAll called with timeout: ${timeout}ms`);
        await this.context.waitForAll(timeout);
        if (this.debug) console.log('FX.waitForAll completed');
    }

   /**
     * @method handleGet
     * @description Handles property access on the FX proxy
     * @param {Object} target - The target object
     * @param {string} prop - The property being accessed
     * @param {Array<string>} path - The current property path
     * @param {Object} receiver - The proxy or object the property is being accessed on
     * @param {Object} config - Configuration for the operation
     * @returns {*} The requested property or a new proxy for chaining
     */
    handleGet(target, prop, path, receiver, config = {}) {
        const fullPath = [...path, prop].join('.');
        if (this.debug) console.log(`Accessing: ${fullPath}, Depth: ${path.length}`);

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
        if (fullPath in this.resources) {
            const resource = this.resources[fullPath];
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
            this.resources[fullPath] = resource;
            if (typeof resource === 'function') {
                return (...args) => this.context.runAsync(() => resource(...args), config);
            }
            return resource;
        } else if (typeof value === 'object' && value !== null) {
            return new Proxy(value, {
                get: (nestedTarget, nestedProp) => this.handleGet(nestedTarget, nestedProp, [...path, prop], receiver, config),
                set: (nestedTarget, nestedProp, nestedValue) => this.handleSet(nestedTarget, nestedProp, nestedValue, [...path, prop])
            });
        }

        return value;
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
        if (this.debug) console.log(`Setting: ${fullPath}`, value);

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
     * @method fx
     * @description Creates a new proxy with the specified configuration
     * @param {Object} config - Configuration for the proxy
     * @returns {Proxy} A new proxy with the specified configuration
     */
    fx(config = {}) {
        if (this.debug) console.log('FX.fx method called with config:', config);
        const processedConfig = this.processConfig(config);
        
        const handler = {
            get: (target, prop) => {
                if (prop === 'set') {
                    return (key, value) => this.set(key, value);
                }
                if (prop in this) {
                    const value = this[prop];
                    if (typeof value === 'function') {
                        return (...args) => this.context.runAsync(() => value.apply(this, args), processedConfig);
                    }
                    return value;
                }
                return this.handleGet(this, prop, [], this, processedConfig);
            },
            set: (target, prop, value) => {
                return this.handleSet(this, prop, value, []);
            }
        };

        return new Proxy({}, handler);
    }

    /**
     * @method processConfig
     * @description Processes the configuration object for the fx method
     * @param {Object|string|number} config - The configuration object or sequence identifier
     * @returns {Object} The processed configuration object
     */
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

    /**
     * @method createResource
     * @description Create a resource instance based on its type
     * @param {Object} config - The resource configuration
     * @param {String} fullKey - The full resource key
     * @returns {Promise<Resource>} A promise that resolves to the created resource instance
     */
    createResource(config, fullKey) {
        return this.context.await(async () => {
            if (this.debug) console.log("Creating resource:", fullKey, config);
            if (typeof config !== 'object' || config === null || !config.type) {
                console.warn("Invalid resource configuration");
                return null;
            }

            try {
                const ResourceClass = await this.resourceFactory(config.type);
                if (!ResourceClass) {
                    console.error(`Resource class not found for type: ${config.type}`);
                    return null;
                }

                if (this.debug) console.log(`Creating instance of ${ResourceClass.name}`);
                return new ResourceClass(config, this.context);
            } catch (error) {
                console.error(`Error creating resource for ${fullKey}:`, error);
                return null;
            }
        });
    }

    /**
     * @method getNestedValue
     * @description Safely retrieves a nested value from an object
     * @param {Object} obj - The object to retrieve from
     * @param {string} path - The path to the desired value
     * @param {boolean} [debug=false] - Whether to log debug information
     * @returns {*} The value at the specified path, or undefined if not found
     */
    getNestedValue(obj, path) {
        if (this.debug) console.log(`Getting nested value for path: ${path}`);
        return path.split('.').reduce((current, key) => {
            if (this.debug)  console.log(`Accessing key: ${key}, Current value:`, current);
            return current && Object.prototype.hasOwnProperty.call(current, key) ? current[key] : undefined;
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
        if (this.debug) console.log("Setting:", fullPath, value);

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
     * @description Initializes the IndexedDB database if in browser environment
     * @returns {Promise<IDBDatabase>|null} A promise that resolves to the opened database or null if not in browser
     */
    initIndexedDB() {
        if (!this.isBrowser) {
            if (this.debug) console.log("IndexedDB is not available in this environment");
            return null;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FxDB', 1);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.errorCode);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                if (this.debug) console.log("IndexedDB opened successfully");
                resolve(db);
            };

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
            this.resources[path] = this.createResource(config);
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
        if (this.debug) console.log(`Loading sub-manifest from ${path}`);
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
const fx = FX.getInstance();
export { fx, FX };
export default fx;