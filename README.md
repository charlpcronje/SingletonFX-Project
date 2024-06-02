# SingletonFX Project

This project demonstrates the use of a singleton pattern for dynamically loading and managing JavaScript modules using the `SingletonFX` script. The project includes several example modules to illustrate different use cases, including class instances, static classes, functions, and modules with multiple exports.

## Project Structure

```sh
project-root/
├── modules/
│   ├── user.js
│   ├── product.js
│   ├── utils.js
│   └── multipleExports.js
├── fx.js
├── manifest.js
├── main.js
├── generate_hashes.php
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
};
```

## SingletonFX Script

### `fx.js`
```js
// **fx.js**
import { manifest } from './manifest.js';

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
                    db.createObjectStore('modules', { keyPath: 'moduleName' });
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

            const { path, type, mainExport } = moduleMeta;
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
                    return { [mainExport]: exportValue };
                case 'instance':
                    return { [mainExport]: new exportValue() };
                case 'function':
                    return { [mainExport]: exportValue };
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
        const blob = new Blob([scriptContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        return import(url);
    }

    async cacheScript(moduleName, scriptContent) {
        const db = await this.openDB();
        const transaction = db.transaction('modules', 'readwrite');
        const store = transaction.objectStore('modules');

        store.put({ moduleName, scriptContent });
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
```

## Main Script

### `main.js`
```js
import { fx } from './fx.js';

// Usage for User (instance)
fx.user.addUser('John Doe');

// Usage for Product (class)
fx.product.createProduct('Laptop');

// Usage for Utils (function)
fx.utils.calculateTotal(100, 2);

// Usage for Multiple Exports (instance and additional functions)
fx.multipleExports.placeOrder('Book', 3);
fx.multipleExports.cancelOrder('12345');
```

## PHP Script for Generating Hashes

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
    if (!isset($previousHashes[$module]) || $previousHashes[$module] !== $hash) {
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

### Bash Script to Create Files

**create_files.sh**
```bash
#!/bin/bash

# Array of filenames and their paths
files=(
    "modules/user.js"
    "modules/product.js"
    "modules/utils.js"
    "modules/multipleExports.js"
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

## How It Works

### SingletonFX Script

The `SingletonFX` script is designed to dynamically load JavaScript modules on demand using a singleton pattern. It uses IndexedDB for caching and PHP for server-side hash generation to ensure that modules are invalidated and reloaded when they change.

#### Key Features:
- **Lazy Loading**: Modules are loaded only when accessed.
- **Caching**: Modules are cached in IndexedDB to reduce network requests.
- **Invalidation**: Cached modules are invalidated and reloaded when their hashes change.

#### Initialization:
The `SingletonFX` class initializes by fetching a list of invalidated modules from the server using the PHP script. It then deletes the outdated entries from IndexedDB.

### Usage Examples

```js
import { fx } from './fx.js';

// Usage for User (instance)
fx.user.addUser('John Doe');

// Usage for Product (class)
fx.product.createProduct('Laptop');

// Usage for Utils (function)
fx.utils.calculateTotal(100, 2);

// Usage for Multiple Exports (instance and additional functions)
fx.multipleExports.placeOrder('Book', 3);
fx.multipleExports.cancelOrder('12345');
```

### PHP Script for Hash Generation

The PHP script (`generate_hashes.php`) generates MD5 hashes for specified files in the manifest and keeps track of changes. It responds with a list of modules that need to be invalidated.

#### Configuration:
- **$modulesDirectory**: Path to the directory containing the modules.
- **$manifestPath**: Path to the manifest file.
- **$hashFilePath**: Path to save the hashes for future comparison.

### Bash Script for Creating Files

The Bash script (`create_files.sh`) creates the necessary files for the project and opens them in Code-Server. It waits for user input before proceeding to the next file.

#### Usage:
1. Save the script as `create_files.sh`.
2. Make it executable:
   ```bash
   chmod +x create_files.sh
   ```
3. Run the script:
   ```bash
   ./create_files.sh
   ```

This script helps in setting up the project structure by creating each file and allowing you to paste the contents into each file before moving on to the next one.

### Conclusion

This project demonstrates a dynamic module loading system using a singleton pattern, with efficient caching and invalidation mechanisms. The provided scripts help in setting up and managing the project structure.