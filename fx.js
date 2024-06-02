// **fx.js**
import {
    manifest
} from './manifest.js';

class FX {
    constructor() {
        if (FX.instance) {
            return FX.instance;
        }

        this.modules = {};
        FX.instance = this;

        this.initializeInvalidation();

        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                } else {
                    return this.lazyLoadModule(prop);
                }
            }
        });
    }

    async initializeInvalidation() {
        const response = await fetch('/path/to/generate_hashes.php'); // Update with the actual URL
        const invalidatedModules = await response.json();
        await this.invalidateCache(invalidatedModules);
    }

    async invalidateCache(invalidatedModules) {
        const db = await this.openDB();
        const transaction = db.transaction('modules', 'readwrite');
        const store = transaction.objectStore('modules');

        for (const moduleName of invalidatedModules) {
            store.delete(moduleName);
        }
    }

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
                get: async (target, prop) => {
                    if (!target[prop]) {
                        const moduleInstance = await modulePromise;
                        if (moduleInstance) {
                            Object.assign(target, moduleInstance);
                        } else {
                            console.error(`Failed to load module ${moduleName}.`);
                            return undefined;
                        }
                    }
                    return target[prop];
                }
            });

            return this.modules[moduleName];
        }
        return this.modules[moduleName];
    }

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

    async loadScriptFromNetwork(moduleName, path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch script from ${path}`);
        }
        const scriptContent = await response.text();
        await this.cacheScript(moduleName, scriptContent);
        return this.executeScript(scriptContent);
    }

    async loadScriptFromCache(scriptContent) {
        return this.executeScript(scriptContent);
    }

    executeScript(scriptContent) {
        const blob = new Blob([scriptContent], {
            type: 'application/javascript'
        });
        const url = URL.createObjectURL(blob);
        return import(url);
    }

    async cacheScript(moduleName, scriptContent) {
        const db = await this.openDB();
        const transaction = db.transaction('modules', 'readwrite');
        const store = transaction.objectStore('modules');

        store.put({
            moduleName,
            scriptContent
        });
    }

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
}

export const fx = new FX();