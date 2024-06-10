# FX Singleton

This project demonstrates the use of a singleton pattern for dynamically loading and managing JavaScript modules using the `FX` script. The `FX` class is designed to handle dynamic module loading, module caching with IndexedDB, cache invalidation, and dynamic property setting and getting using dot notation. Additionally, it supports accessing environment variables, local storage data, and IndexedDB data. The project includes several example modules to illustrate different use cases, including class instances, static classes, functions, and dynamic property management.

## Features

1. **Singleton Pattern**: Ensures only one instance of the `FX` class is created and reused throughout the application.
2. **Dynamic Module Loading**: Modules are loaded on demand using a manifest that specifies their paths and types.
3. **Module Caching with IndexedDB**: Modules are cached in IndexedDB to reduce network requests and improve performance.
4. **Cache Invalidation**: Cached modules are invalidated and reloaded if they change.
5. **Dynamic Property Creation and Access**: Supports dynamic property creation and nested properties using dot notation.
6. **Storing and Accessing Various Data Types**: Supports storing and accessing functions, classes, modules, imports, closures, string literals, JSON objects, and regex patterns.
7. **Lazy Loading of Nested Modules**: Nested modules can be lazy loaded using the manifest.
8. **Accessing Environment Variables**: Allows accessing environment variables from a `.env` file.
9. **Accessing IndexedDB Data**: Allows accessing data stored in the browser's IndexedDB.
10. **Accessing Local Storage Data**: Allows accessing data stored in the browser's local storage.
11. **Logging with Custom Logger**: Uses a custom logging class for logging instead of `console.log`.
12. **Handling Async Functions**: Supports storing and handling async functions in the store.

## Project Structure

```sh
project-root/
├── modules/
│   ├── user.js
│   ├── product.js
│   ├── utils.js
│   ├── multipleExports.js
│   └── log.js
├── fx.js
├── manifest.js
├── main.js
├── generate_hashes.php
├── .env
└── create_files.sh
```

## Modules

### `user.js`

```js
// **modules/user.js**
export class User {
    constructor() {
        console.log('User instance created');
    }

    addUser(name) {
        console.log(`User ${name} added.`);
    }
}
```

### `product.js`

```js
// **modules/product.js**
export class Product {
    static createProduct(name) {
        console.log(`Product ${name} created.`);
    }
}
```

### `utils.js`

```js
// **modules/utils.js**
export function calculateTotal(price, quantity) {
    console.log(`Total is ${price * quantity}`);
}
```

### `multipleExports.js`

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

### `log.js`

```js
// **modules/log.js**
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
```

## Manifest

### `manifest.js`

```js
// **manifest.js**
export const manifest = {
    user: {
        path: 'modules/user.js',
        type: 'instance',
        mainExport: 'User',
    },
    product: {
        path: 'modules/product.js',
        type: 'class',
        mainExport: 'Product',
    },
    utils: {
        path: 'modules/utils.js',
        type: 'function',
        mainExport: 'calculateTotal',
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
        mainExport: 'log',
    },
    setDebug: {
        path: 'modules/log.js',
        type: 'function',
        mainExport: 'setDebug',
    },
};
```

## FX Script

### `fx.js`

```js
// **fx.js**
import { manifest } from './manifest.js';
import { log, setDebug } from './modules/log.js'; // Adjusted import path as needed
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Class FX handles dynamic module loading, invalidation, and property setting with dot notation.
 */
class FX {
    constructor() {
        log('FX constructor called');
        if (FX.instance) {
            log('FX instance already exists, returning existing instance');
            return FX.instance;
        }

        // Initialize module storage and store for dynamic properties
        this.modules = {};
        this.store = {};
        FX.instance = this;

        // Initialize cache invalidation process
        log('Initializing cache invalidation process');
        this.initializeInvalidation();

        // Return a proxy to handle dynamic property access and setting
        log('Creating proxy for dynamic property access and setting');
        return new Proxy(this, {
            get: (target, prop) => {
                log(`Proxy get called for property: ${prop}`);
                if (prop in target) {
                    return target[prop];
                } else if (prop === 'env') {
                    return this.createEnvProxy();
                } else if (prop === 'db') {
                    return this.createDBProxy();
                } else if (prop === 'store') {
                    return this.createStoreProxy();
                } else if (manifest[prop]) {
                    log(`Lazy loading module: ${prop}`);
                    return this.lazyLoadModule(prop);
                } else {
                    // Dynamically create property if it doesn't exist
                    target[prop] = new Proxy({}, this._createProxyHandler(prop));
                    return target[prop];
                }
            },
            set: (target, prop, value) => {
                log(`Proxy set called for property: ${prop}, value: ${value}`);
                this.set(prop, value);
                return true;
            }
        });
    }

    createEnvProxy() {
        return new Proxy({}, {
            get: (target, prop) => {
                log(`Accessing .env variable: ${prop}`);
                return process.env[prop];
            },
            set: () => {
                throw new Error('Cannot set .env variables dynamically');
            }
        });
    }

    createDBProxy() {
        return new Proxy({}, {
            get: (target, prop) => {
                return new Proxy({}, {
                    get: (target, subProp) => {
                        return new Proxy({}, {
                            get: (target, key) => {
                                log(`Getting IndexedDB data: ${prop}.${subProp}.${key}`);
                                return this.getIndexedDBData(prop, subProp, key);
                            },
                            set: (target, key, value) => {
                                log(`Setting IndexedDB data: ${prop}.${subProp}.${key} = ${value}`);
                                return this.setIndexedDBData(prop, subProp, key, value);
                            }
                        });
                    }
                });
            }
        });
    }

    createStoreProxy() {
        return new Proxy({}, {
            get: (target, prop) => {
                log(`Getting local storage data: ${prop}`);
                return localStorage.getItem(prop);
            },
            set: (target, prop, value) => {
                log(`Setting local storage data: ${prop} = ${value}`);
                localStorage.setItem(prop, value);
                return true;
            }
        });
    }

    /**
     * Function to get data from IndexedDB
     * @param {string} dbName
     * @param {string} storeName
     * @param {string} key
     * @returns {Promise<any>}
     */
    async getIndexedDBData(dbName, storeName, key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const getRequest = store.get(key);

                getRequest.onsuccess = () => {
                    resolve(getRequest.result);
                };

                getRequest.onerror = () => {
                    reject(getRequest.error);
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Function to set data in IndexedDB
     * @param {string} dbName
     * @param {string} storeName
     * @param {string} key
     * @param {any} value
     * @returns {Promise<boolean>}
     */
    async setIndexedDBData(dbName, storeName, key, value) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);

            request.onsuccess = (event) => {


                const db = event.target.result;
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const putRequest = store.put({ key, value });

                putRequest.onsuccess = () => {
                    resolve(true);
                };

                putRequest.onerror = () => {
                    reject(putRequest.error);
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Creates a proxy handler for nested objects.
     * @param {string} root - The root path for nested properties.
     * @returns {ProxyHandler} - A proxy handler for get and set operations.
     */
    _createProxyHandler(root) {
        log(`Creating proxy handler for root: ${root}`);
        return {
            get: (target, prop) => {
                log(`Proxy get called for nested property: ${root}.${prop}`);
                if (prop in target) {
                    return target[prop];
                } else {
                    const fullPath = `${root}.${prop}`;
                    if (manifest[fullPath]) {
                        log(`Lazy loading nested module: ${fullPath}`);
                        return this.lazyLoadModule(fullPath);
                    }
                    // Dynamically create property if it doesn't exist
                    target[prop] = new Proxy({}, this._createProxyHandler(fullPath));
                    return target[prop];
                }
            },
            set: (target, prop, value) => {
                const fullPath = `${root}.${prop}`;
                log(`Proxy set called for nested property: ${fullPath}, value: ${value}`);
                this.set(fullPath, value);
                return true;
            }
        };
    }

    /**
     * Initializes the invalidation process for cached modules.
     * @returns {Promise<void>}
     */
    async initializeInvalidation() {
        log('Initializing invalidation process');
        const response = await fetch('/path/to/generate_hashes.php'); // Update with the actual URL
        const invalidatedModules = await response.json();
        log('Invalidated modules:', invalidatedModules);
        await this.invalidateCache(invalidatedModules);
    }

    /**
     * Invalidates cache for specific modules.
     * @param {Array<string>} invalidatedModules - List of module names to invalidate.
     * @returns {Promise<void>}
     */
    async invalidateCache(invalidatedModules) {
        log('Invalidating cache for modules:', invalidatedModules);
        const db = await this.openDB();
        const transaction = db.transaction('modules', 'readwrite');
        const store = transaction.objectStore('modules');

        for (const moduleName of invalidatedModules) {
            log(`Deleting module from cache: ${moduleName}`);
            store.delete(moduleName);
        }
    }

    /**
     * Opens the IndexedDB for storing cached modules.
     * @returns {Promise<IDBDatabase>}
     */
    async openDB() {
        log('Opening IndexedDB');
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FXDB', 1);

            request.onupgradeneeded = event => {
                log('IndexedDB upgrade needed');
                const db = event.target.result;
                if (!db.objectStoreNames.contains('modules')) {
                    log('Creating object store: modules');
                    db.createObjectStore('modules', { keyPath: 'moduleName' });
                }
            };

            request.onsuccess = event => {
                log('IndexedDB opened successfully');
                resolve(event.target.result);
            };

            request.onerror = event => {
                log('Error opening IndexedDB:', event.target.error);
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
        log(`Lazy loading module: ${moduleName}`);
        if (!this.modules[moduleName]) {
            const moduleMeta = manifest[moduleName];
            if (!moduleMeta) {
                log(`Module ${moduleName} not found in manifest.`);
                return undefined;
            }

            const { path, type, mainExport } = moduleMeta;
            log(`Loading module: ${moduleName}, path: ${path}, type: ${type}, mainExport: ${mainExport}`);
            const modulePromise = this.loadAndInstantiateModule(moduleName, path, type, mainExport);

            this.modules[moduleName] = new Proxy({}, {
                get: (target, prop) => {
                    log(`Proxy get called for module property: ${moduleName}.${prop}`);
                    return modulePromise.then(moduleInstance => {
                        if (moduleInstance && prop in moduleInstance) {
                            return moduleInstance[prop];
                        } else {
                            log(`Failed to load property ${prop} from module ${moduleName}.`);
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
        log(`Loading and instantiating module: ${moduleName}`);
        try {
            const cachedScript = await this.getCachedScript(moduleName);
            let module;
            if (cachedScript) {
                log(`Loading module from cache: ${moduleName}`);
                module = await this.loadScriptFromCache(cachedScript);
            } else {
                log(`Loading module from network: ${moduleName}`);
                module = await this.loadScriptFromNetwork(moduleName, path);
            }

            const exportValue = module[mainExport];
            log(`Instantiating module: ${moduleName}, type: ${type}`);
            switch (type) {
                case 'class':
                    return { [mainExport]: exportValue };
                case 'instance':
                    return { [mainExport]: new exportValue() };
                case 'function':
                    return { [mainExport]: exportValue };
                default:
                    log(`Unknown type for module: ${type}`);
                    return undefined;
            }
        } catch (error) {
            log(`Failed to load module from ${path}:`, error);
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
        log(`Loading script from network: ${moduleName}`);
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch script from ${path}`);
        }
        const scriptContent = await response.text();
        log(`Caching script: ${moduleName}`);
        await this.cacheScript(moduleName, scriptContent);
        log(`Executing script: ${moduleName}`);
        return this.executeScript(scriptContent);
    }

    /**
     * Loads a script from the cache.
     * @param {string} scriptContent - The content of the script.
     * @returns {Promise<Object>} - The loaded script.
     */
    async loadScriptFromCache(scriptContent) {
        log('Loading script from cache');
        return this.executeScript(scriptContent);
    }

    /**
     * Executes a script by creating a blob URL and importing it.
     * @param {string} scriptContent - The content of the script.
     * @returns {Promise<Object>} - The executed script.
     */
    executeScript(scriptContent) {
        log('Executing script');
        const blob = new Blob([scriptContent], { type: 'application/javascript' });
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
        log(`Caching script: ${moduleName}`);
        const db = await this.openDB();
        const transaction = db.transaction('modules', 'readwrite');
        const store = transaction.objectStore('modules');
        store.put({ moduleName, scriptContent });
    }

    /**
     * Retrieves a cached script from the IndexedDB.
     * @param {string} moduleName - The name of the module.
     * @returns {Promise<string|null>} - The cached script content or null if not found.
     */
    async getCachedScript(moduleName) {
        log(`Retrieving cached script: ${moduleName}`);
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('modules', 'readonly');
            const store = transaction.objectStore('modules');
            const request = store.get(moduleName);

            request.onsuccess = () => {
                if (request.result) {
                    log(`Cached script found: ${moduleName}`);
                    resolve(request.result.scriptContent);
                } else {
                    log(`Cached script not found: ${moduleName}`);
                    resolve(null);
                }
            };

            request.onerror = () => {
                log(`Error retrieving cached script: ${moduleName}`, request.error);
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
        log(`Setting value for path: ${path}, value: ${value}`);
        const keys = path.split('.');
        let obj = this.store;

        while (keys.length > 1) {
            const key = keys.shift();
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }

        obj[keys[0]] = value; // Store the value, regardless of its type
    }

    /**
     * Gets a value from the store using dot notation.
     * @param {string} path - The path to the property (e.g., "user.name").
     * @param {any} [defaultValue] - The default value to return if the property is not found.
     * @returns {any} - The value of the property or the default value.
     */
    get(path, defaultValue = undefined) {
        log(`Getting value for path: ${path}`);
        const keys = path.split('.');
        let obj = this.store;

        for (const key of keys) {
            if (!(key in obj)) {
                log(`Path not found in store: ${path}, returning default value: ${defaultValue}`);
                return defaultValue;
            }
            obj = obj[key];
        }

        log(`Value found for path: ${path}, value: ${obj}`);
        return obj;
    }

    /**
     * Gets or sets a value in the store depending on the number of arguments.
     * @param {string} path - The path to the property (e.g., "user.name").
     * @param {any} [value] - The value to set.
     * @param {any} [defaultValue] - The default value to return if the property is not found.
     * @returns {any} - The value of the property if getting, otherwise undefined.
     */
    data(path, ...args) {
        log(`Data method called with path: ${path}, args: ${args}`);
        if (args.length === 0) {
            // If no arguments are provided, assume it's a get operation
            const result = this.get(path);
            
            // Check if the result is a class constructor
            if (typeof result === 'function' && /^\s*class\s+/.test(result.toString())) {
                return result; // Return the class constructor
            }

            if (typeof result === 'function') {
                // Execute the function if it's stored as a function
                return result();
            }
            
            return result;
        } else {
            // If arguments are provided, assume it's a set operation
            if (args[0] === null || args[0] === undefined) {
                return this.get(path, args[1]); // args[1] would be the default value
            } else {
                this.set(path, args[0]);
            }
        }
    }
}

export const fx = new FX();

// Example usage for different types of values

// 1. Storing and accessing a function
function greet(name) {
    return `Hello, ${name}`;
}
fx.set('greetFunction', greet);
console.log(fx.data('greetFunction')('John')); // Outputs: "Hello, John"

// 2. Storing and accessing a class
class User {
    constructor(name) {
        this.name = name;
    }
    greet() {
        return `Hello, ${this.name}`;
    }
}
fx.set('userClass', User);
const UserClass = fx.data('userClass');
const userInstance = new UserClass('John');
console.log(userInstance.greet()); // Outputs: "Hello, John"

// 3. Storing and accessing a module
const mathModule = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
};
fx.set('mathModule', mathModule);
console.log(fx.data('mathModule').add(2, 3)); // Outputs: 5

// 4. Storing and accessing an import
import * as MathModule from './math.js';
fx.set('mathImport', MathModule);
console.log(fx.data('mathImport').add(2, 3)); // Assuming math.js exports an add function

// 5. Storing and accessing a closure
const closure = (name) => {
    return `Hello, ${name}`;
};
fx.set('closure', closure);
console.log(fx.data('closure')('John')); // Outputs: "Hello, John"

// 6. Storing and accessing a string literal
fx.set('greeting', 'Hello, world!');
console.log(fx.data('greeting')); // Outputs: "Hello, world!"

// 7. Storing and accessing a JSON object
const user = { name: 'John', age: 30 };
fx.set('user', user);
console.log(fx.data('user')); // Outputs: { name: 'John', age: 30 }

// 8. Storing and accessing a REGEX
const regex = /hello/gi;
fx.set('regexPattern', regex);
console.log(fx.data('regexPattern').test('Hello')); // Outputs: true
```

## Main Script

### `main.js`

```js
import { fx, setDebug } from './fx.js';

// Setting a debug flag
setDebug(true);

// Using dynamic properties and API calls
(async () => {
    // Fetch user data from an API
    fx.set('fetchUserData', async function(userId) {
        const response = await fetch(`https://api.example.com/users/${userId}`);
        return response.json();
    });

    // Store user data in FX
    const userData = await fx.get('fetchUserData')(1);
    fx.set('userData', userData);

    // Access user data dynamically
    console.log(fx.userData.name); // Outputs user name from the API

    // Set and get environment variable
    fx.set('apiKey', process.env.API_KEY);
    console.log(fx.apiKey); // Outputs API key

    // Set and get local storage data
    localStorage.setItem('userToken', 'abc123');
    fx.set('userToken', localStorage.getItem('userToken'));
    console.log(fx.userToken); // Outputs: "abc123"

    // Set and get nested properties
    fx.set('settings.theme.color', 'blue');
    console.log(fx.settings.theme.color); // Outputs: "blue"

    // Use a regex pattern
    fx.set('regexPattern', /hello/gi);
    console.log(fx.regexPattern.test('Hello')); // Outputs: true
})();
```

## PHP Script for Hash Generation

### `generate_hashes.php`

```php
<?php
/**
 * This script generates MD5 hashes for files specified in the manifest and tracks changes.
 * Adjust the $modulesDirectory and $manifestPath to point to your directories.
 */

// Configuration: Path to the modules directory and manifest file
$modulesDirectory = '/path/to/your/modules'; // Replace with the actual path
$manifestPath = '/path/to/your/manifest.js'; // Replace with the actual path
$hashFilePath = 'hashes.json'; // Path to save the hashes

// Read the manifest file and parse it
function readManifest($manifestPath) {
    $manifestContent = file_get_contents($manifestPath);
    // Strip the export statement to get the JSON-like structure
    $jsonContent = preg_replace('/export\s+const\s+\w+\s+=\s+/', '', $manifestContent);
    $jsonContent = rtrim($jsonContent, ';');
    return json_decode($jsonContent, true);
}

/**
 * Function to generate MD5 hashes for specified files based on the manifest.
 *
 * @param string $directory The base directory where modules are located.
 * @param array $manifest The manifest array containing module paths.
 * @return array An associative array of relative paths and their MD5 hashes.
 */
function generateHashes($directory, $manifest) {
    $hashes = array();

    foreach ($manifest as $module) {
        if (isset($module['path'])) {
            $filePath = $directory . DIRECTORY_SEPARATOR . $module['path'];
            if (file_exists($filePath)) {
                $fileContent = file_get_contents($filePath);
                $hash = md5($fileContent);
                // Use relative path for the file key in the JSON
                $relativePath = str_replace($directory . DIRECTORY_SEPARATOR, '', $filePath);
                $hashes[$relativePath] = $hash;
            }
        }
    }

    return $hashes;
}

// Function to load the previous hashes from the file
function loadPreviousHashes($hashFilePath) {
    if (file_exists($hashFilePath)) {
        $hashesContent = file_get_contents($hashFilePath);
        return json_decode($hashesContent, true);
    }
    return array();
}

// Function to save the current hashes to the file
function saveHashes($hashes, $hashFilePath) {
    file_put_contents($hashFilePath, json_encode($hashes, JSON_PRETTY_PRINT));
}

// Read the manifest and generate the current hashes
$manifest = readManifest($manifestPath);
$currentHashes = generateHashes($modulesDirectory, $manifest);

// Load the previous hashes
$previousHashes = loadPreviousHashes($hashFilePath);

// Compare the hashes to find the modules that need to be invalidated
$invalidatedModules = array();
foreach ($currentHashes as $module => $hash) {
    if (!isset($previous

Hashes[$module]) || $previousHashes[$module] !== $hash) {
        $invalidatedModules[] = $module;
    }
}

// Save the current hashes for future comparison
saveHashes($currentHashes, $hashFilePath);

// Respond with the modules that need to be invalidated
header('Content-Type: application/json');
echo json_encode($invalidatedModules, JSON_PRETTY_PRINT);
?>
```

## Bash Script for Creating Files

### `create_files.sh`

```bash
#!/bin/bash

# Array of filenames and their paths
files=(
    "modules/user.js"
    "modules/product.js"
    "modules/utils.js"
    "modules/multipleExports.js"
    "modules/log.js"
    "fx.js"
    "manifest.js"
    "main.js"
    "generate_hashes.php"
)

# Function to create a file and open it with Code-Server
create_and_edit_file() {
    local filepath=$1
    touch $filepath
    code-server $filepath
    echo "Press Enter to continue to the next file..."
    read
}

# Iterate over the list of files
for file in "${files[@]}"; do
    create_and_edit_file $file
done

echo "All files have been created and edited."
```

### Conclusion

This project demonstrates a dynamic module loading system using a singleton pattern, with efficient caching and invalidation mechanisms. The `FX` class now supports dynamic properties, various data types, and detailed logging. The provided scripts help in setting up and managing the project structure. The `FX` class is a versatile and powerful tool for dynamically managing and accessing various types of data, including values, JSON objects, functions, classes, modules, and more. It supports dynamic properties, allows seamless integration with external APIs, and can interact with environment variables, local storage, and IndexedDB. The provided examples demonstrate the wide range of possible use cases, making `FX` a highly flexible and useful component in any JavaScript project.