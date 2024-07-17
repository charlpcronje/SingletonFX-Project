// **fx.js**
import {
    manifest
} from './manifest.js';

/**
 * Class FX handles dynamic module loading, invalidation, and property setting with dot notation.
 */
class FX {
    constructor() {
        if (FX.instance) {
            return FX.instance;
        }

        // Initialize module storage and store for dynamic properties
        this.modules = {};
        this.store = {};
        FX.instance = this;

        // Initialize cache invalidation process
        this.initializeInvalidation();

        // Return a proxy to handle dynamic property access and setting
        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                } else {
                    if (manifest[prop]) {
                        return this.lazyLoadModule(prop);
                    }
                    return undefined;
                }
            },
            set: (target, prop, value) => {
                if (typeof value === 'object' && value !== null) {
                    target[prop] = new Proxy(value, this._createProxyHandler(prop));
                } else {
                    this.data(prop, value);
                }
                return true;
            }
        });
    }

    /**
     * Creates a proxy handler for nested objects.
     * @param {string} root - The root path for nested properties.
     * @returns {ProxyHandler} - A proxy handler for get and set operations.
     */
    _createProxyHandler(root) {
        return {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                } else {
                    const fullPath = `${root}.${prop}`;
                    if (manifest[fullPath]) {
                        return this.lazyLoadModule(fullPath);
                    }
                    return undefined;
                }
            },
            set: (target, prop, value) => {
                const fullPath = `${root}.${prop}`;
                if (typeof value === 'object' && value !== null) {
                    target[prop] = new Proxy(value, this._createProxyHandler(fullPath));
                } else {
                    this.data(fullPath, value);
                }
                return true;
            }
        };
    }

    /**
     * Initializes the invalidation process for cached modules.
     * @returns {Promise<void>}
     */
    async initializeInvalidation() {
        const response = await fetch('/path/to/generate_hashes.php'); // Update with the actual URL
        const invalidatedModules = await response.json();
        await this.invalidateCache(invalidatedModules);
    }

    /**
     * Invalidates cache for specific modules.
     * @param {Array<string>} invalidatedModules - List of module names to invalidate.
     * @returns {Promise<void>}
     */
    async invalidateCache(invalidatedModules) {
        const db = await this.openDB();
        const transaction = db.transaction('modules', 'readwrite');
        const store = transaction.objectStore('modules');

        for (const moduleName of invalidatedModules) {
            store.delete(moduleName);
        }
    }

    /**
     * Opens the IndexedDB for storing cached modules.
     * @returns {Promise<IDBDatabase>}
     */
    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FXDB', 1);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('modules')) {
                    db.createObjectStore('modules', {
                        keyPath: 'moduleName'
                    });
                }
            };

            request.onsuccess = event => {
                resolve(event.target.result);
            };

            request.onerror = event => {
                reject(event.target.error);
            };
        });
    }

    /**
     * Lazy loads a module if it's defined in the manifest.
     * @param {string} moduleName - The name of the module to load.
     * @returns {Proxy} - A proxy that handles the module's properties.
     */
    lazyLoadModule(moduleName) {
        if (!this.modules[moduleName]) {
            const moduleMeta = manifest[moduleName];
            if (!moduleMeta) {
                console.error(`Module ${moduleName} not found in manifest.`);
                return undefined;
            }

            const {
                path,
                type,
                mainExport
            } = moduleMeta;
            const modulePromise = this.loadAndInstantiateModule(moduleName, path, type, mainExport);

            this.modules[moduleName] = new Proxy({}, {
                get: (target, prop) => {
                    return modulePromise.then(moduleInstance => {
                        if (moduleInstance && prop in moduleInstance) {
                            return moduleInstance[prop];
                        } else {
                            console.error(`Failed to load property ${prop} from module ${moduleName}.`);
                            return undefined;
                        }
                    });
                }
            });

            return this.modules[moduleName];
        }
        return this.modules[moduleName];
    }

    /**
     * Loads and instantiates a module.
     * @param {string} moduleName - The name of the module to load.
     * @param {string} path - The path to the module file.
     * @param {string} type - The type of module (class, instance, or function).
     * @param {string} mainExport - The main export of the module.
     * @returns {Promise<Object>} - The loaded module instance.
     */
    async loadAndInstantiateModule(moduleName, path, type, mainExport) {
        try {
            const cachedScript = await this.getCachedScript(moduleName);
            let module;
            if (cachedScript) {
                module = await this.loadScriptFromCache(cachedScript);
            } else {
                module = await this.loadScriptFromNetwork(moduleName, path);
            }

            const exportValue = module[mainExport];
            switch (type) {
                case 'class':
                    return {
                        [mainExport]: exportValue
                    };
                case 'instance':
                    return {
                        [mainExport]: new exportValue()
                    };
                case 'function':
                    return {
                        [mainExport]: exportValue
                    };
                default:
                    console.error(`Unknown type for module: ${type}`);
                    return undefined;
            }
        } catch (error) {
            console.error(`Failed to load module from ${path}:`, error);
            return undefined;
        }
    }

    /**
     * Loads a script from the network.
     * @param {string} moduleName - The name of the module.
     * @param {string} path - The path to the script file.
     * @returns {Promise<Object>} - The loaded script.
     */
    async loadScriptFromNetwork(moduleName, path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch script from ${path}`);
        }
        const scriptContent = await response.text();
        await this.cacheScript(moduleName, scriptContent);
        return this.executeScript(scriptContent);
    }

    /**
     * Loads a script from the cache.
     * @param {string} scriptContent - The content of the script.
     * @returns {Promise<Object>} - The loaded script.
     */
    async loadScriptFromCache(scriptContent) {
        return this.executeScript(scriptContent);
    }

    /**
     * Executes a script by creating a blob URL and importing it.
     * @param {string} scriptContent - The content of the script.
     * @returns {Promise<Object>} - The executed script.
     */
    executeScript(scriptContent) {
        const blob = new Blob([scriptContent], {
            type: 'application/javascript'
        });
        const url = URL.createObjectURL(blob);
        return import(url);
    }

    /**
     * Caches a script in the IndexedDB.
     * @param {string} moduleName - The name of the module.
     * @param {string} scriptContent - The content of the script.
     * @returns {Promise<void>}
     */
    async cacheScript(moduleName, scriptContent) {
        const db = await this.openDB();
        const transaction = db.transaction('modules', 'readwrite');
        const store = transaction.objectStore('modules');

        store.put({
            moduleName,
            scriptContent
        });
    }

    /**
     * Retrieves a cached script from the IndexedDB.
     * @param {string} moduleName - The name of the module.
     * @returns {Promise<string|null>} - The cached script content or null if not found.
     */
    async getCachedScript(moduleName) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('modules', 'readonly');
            const store = transaction.objectStore('modules');
            const request = store.get(moduleName);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.scriptContent);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Sets a value in the store using dot notation.
     * @param {string} path - The path to the property (e.g., "user.name").
     * @param {any} value - The value to set.
     */
    set(path, value) {
        const keys = path.split('.');
        let obj = this.store;

        while (keys.length > 1) {
            const key = keys.shift();
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }

        obj[keys[0]] = value;
    }

    /**
     * Gets a value from the store using dot notation.
     * @param {string} path - The path to the property (e.g., "user.name").
     * @param {any} [defaultValue] - The default value to return if the property is not found.
     * @returns {any} - The value of the property or the default value.
     */
    get(path, defaultValue = undefined) {
        const keys = path.split('.');
        let obj = this.store;

        for (const key of keys) {
            if (!(key in obj)) {
                return defaultValue;
            }
            obj = obj[key];
        }

        return obj;
    }

    /**
     * Gets or sets a value in the store depending on the number of arguments.
     * @param {string} path - The path to the property (e.g., "user.name").
     * @param {any} [value] - The value to set.
     * @param {any} [defaultValue] - The default value to return if the property is not found.
     * @returns {any} - The value of the property if getting, otherwise undefined.
     */
    data(path, value, defaultValue = undefined) {
        if (arguments.length === 1) {
            return this.get(path);
        } else if (arguments.length === 2) {
            if (value === null || value === undefined) {
                return this.get(path, defaultValue);
            } else {
                this.set(path, value);
            }
        } else if (arguments.length === 3) {
            if (value === null || value === undefined) {
                const existingValue = this.get(path, defaultValue);
                this.set(path, existingValue);
            } else {
                this.set(path, value);
            }
        }
    }
}

export const fx = new FX(); 