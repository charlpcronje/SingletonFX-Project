# Chrome & VS Code DEV Assistant

- [Chrome \& VS Code DEV Assistant](#chrome--vs-code-dev-assistant)
  - [1. Extensions Modules](#1-extensions-modules)
    - [**1.1. Automatic Code Transfer (textTransfer.js)**:](#11-automatic-code-transfer-texttransferjs)
    - [**1.2. Terminal Integration in Chrome (terminalIntegration.js)**:](#12-terminal-integration-in-chrome-terminalintegrationjs)
    - [**1.3. Seamless AI Platform Integration (aiPlatformIntegration.js)**:](#13-seamless-ai-platform-integration-aiplatformintegrationjs)
    - [**1.4. Intelligent Code Merging (codeMerging.js)**:](#14-intelligent-code-merging-codemergingjs)
    - [**1.5. Centralized Configuration Management (configurationManager.js)**:](#15-centralized-configuration-management-configurationmanagerjs)
    - [**1.6. Efficient Communication Protocols (communicationManager.js)**:](#16-efficient-communication-protocols-communicationmanagerjs)
    - [**1.7. Automated Testing Framework (testingFramework.js)**:](#17-automated-testing-framework-testingframeworkjs)
    - [**1.8. User-Friendly Customization (userSettings.js)**:](#18-user-friendly-customization-usersettingsjs)
    - [**1.9. Cross-Platform Compatibility (platformCompatibility.js)**:](#19-cross-platform-compatibility-platformcompatibilityjs)
    - [**1.10. Extensible Architecture (extensibleArchitecture.js)**:](#110-extensible-architecture-extensiblearchitecturejs)
    - [**1.11. Built-in Code Snippets Library (codeSnippetsLibrary.js)**:](#111-built-in-code-snippets-library-codesnippetslibraryjs)
    - [**1.12. Code Quality and Maintainability (codeQualityAnalysis.js)**:](#112-code-quality-and-maintainability-codequalityanalysisjs)
    - [**1.13. Collaborative Editing Notifications (collaborativeEditing.js)**:](#113-collaborative-editing-notifications-collaborativeeditingjs)
    - [**1.14. Git Integration and Branch Management (gitIntegration.js)**:](#114-git-integration-and-branch-management-gitintegrationjs)
    - [**1.15. Incremental Documentation Updates (documentationGenerator.js)**:](#115-incremental-documentation-updates-documentationgeneratorjs)
    - [**1.16. File Change Monitoring and Reporting (fileChangeMonitoring.js)**:](#116-file-change-monitoring-and-reporting-filechangemonitoringjs)
    - [**1.17. Notion Integration (notionIntegration.js)**:](#117-notion-integration-notionintegrationjs)
    - [**1.18. Code Refactoring Assistance (codeRefactoring.js)**:](#118-code-refactoring-assistance-coderefactoringjs)
    - [**1.19. Reporting and Analytics for Business Owners (businessReporting.js)**:](#119-reporting-and-analytics-for-business-owners-businessreportingjs)
  - [2. The Central Module](#2-the-central-module)
    - [2.1. Project Structure](#21-project-structure)
    - [2.2. Modules](#22-modules)
    - [`user.js`](#userjs)
    - [`product.js`](#productjs)
    - [`utils.js`](#utilsjs)
    - [`multipleExports.js`](#multipleexportsjs)
  - [2.3. Manifest](#23-manifest)
    - [`manifest.js`](#manifestjs)
    - [2.4. SingletonFX Script](#24-singletonfx-script)
    - [`fx.js`](#fxjs)
    - [2.5. Main Script](#25-main-script)
    - [`main.js`](#mainjs)
    - [2.6. PHP Script for Generating Hashes](#26-php-script-for-generating-hashes)
    - [`generate_hashes.php`](#generate_hashesphp)
  - [3. How It Works](#3-how-it-works)
    - [3.1. SingletonFX Script](#31-singletonfx-script)
    - [3.2. Key Features:](#32-key-features)
    - [3.3. Initialization:](#33-initialization)
    - [3.4. Usage Examples](#34-usage-examples)
    - [3.5. PHP Script for Hash Generation](#35-php-script-for-hash-generation)
    - [Configuration:](#configuration)
    - [3.6. Bash Script for Creating Files](#36-bash-script-for-creating-files)
    - [3.7. Usage:](#37-usage)
    - [3.8. Conclusion](#38-conclusion)

I have been working on the following for a long time: https://github.com/charlpcronje/Chrome-Extension-and-VS-Code-Extension-for-AI-Assisted-Development

It is basically a Chrome extension that interfaces with ChatGPT, Claude AI, Phind.com, and Google. Depending on the query, GPT-3.5 decides which AI should be asked the question. There is also a VS Code Extension that uses the same central module loader as the Chrome extension, allowing them to share information. So, I type the prompt in VS Code, and when I submit the prompt, the API is not used. Instead, the Chrome extension accesses the frontend of each AI, and now that ChatGPT gives you 45 prompts every 3 hours, it is enough so that you don't need any further token spending, and also have other AIs available. If GPT-3.5 sees that more files are needed to get all the context, it requests all of them from the VS Code extension, and depending on the context size, the prompt with all the context is given to the right AI to answer. Then, as the AI answers and creates files in code blocks, it is sent back to VS Code, which either creates a new file, puts the content in it, and saves it, or creates a new branch with GIT, commits the current code, updates the file, and makes a pull request so that the code can be merged, which is also easy in VS Code.
If there are any errors after the update, they will appear in the problems tab of VS Code.
The VS Code extension then gets all the errors and sends them directly to the AI that already has the context of the updates and continues to fix the errors while creating a branch for each iteration and merging and committing the code until the error is sorted out or until the user intervenes.

What also happens in the background through the two extensions is to sanitize the text being sent back and forth and to load different JavaScript modules as needed.
I created the following modules to help with different actions that might be required:

Here’s how these modules work together to enhance different workflows:

## 1. Extensions Modules

### **1.1. Automatic Code Transfer (textTransfer.js)**:

- The combination of the Chrome and VS Code extensions allows for automatic transfer of code from AI systems to VS Code. Prompts from VS Code can be sent to AIs, and commands from AIs can be executed in VS Code. This feature ensures that AI-generated code is seamlessly integrated into your development environment, streamlining the coding process and reducing manual effort.

### **1.2. Terminal Integration in Chrome (terminalIntegration.js)**:

- With the Chrome extension, you can interface directly with the terminal in a tab running a code server. This integration provides a powerful and flexible environment for executing commands, running scripts, and performing complex operations without leaving your browser. It enhances productivity by allowing you to automate tasks and manage your development environment from a single interface.

### **1.3. Seamless AI Platform Integration (aiPlatformIntegration.js)**:

- Integrates with [ChatGPT](https://chat.openai.com), Claude AI, [Phind.com](http://phind.com/), and [Google](https://gemini.google.com/). More can be added by specifying the CSS selectors to the relevant elements on the website. This way, the extension knows exactly where to send the query for the best results.
- The Chrome extension handles the interaction with AI platforms, automatically entering prompts and retrieving generated output. The VS Code extension then inserts this output into your code files, allowing you to leverage AI capabilities directly within your development environment. This integration streamlines the process of using AI for code generation, debugging, and problem-solving. Plus, there is no API cost for tokens, making this a cost-effective solution for integrating AI into your workflow.

### **1.4. Intelligent Code Merging (codeMerging.js)**:

- When AI-generated code needs to be merged with existing code, the extensions provide a user-friendly interface for reviewing and modifying changes. This feature ensures that AI-generated code integrates smoothly into your projects, maintaining code quality and consistency. You can review, edit, and approve changes before they are applied, minimizing the risk of introducing errors.

### **1.5. Centralized Configuration Management (configurationManager.js)**:

- A centralized configuration object stores settings and preferences for both extensions, ensuring consistency across the development environment. This singleton class makes it easy to update configurations and adapt to changes in AI platforms' web interfaces, providing a unified approach to managing settings and preferences.

### **1.6. Efficient Communication Protocols (communicationManager.js)**:

- The Chrome and VS Code extensions communicate efficiently using message passing and shared protocols. This coordination enhances functionality by allowing the extensions to work together seamlessly. For example, when an AI platform generates code in Chrome, the output is automatically passed to VS Code for integration into the codebase.

### **1.7. Automated Testing Framework (testingFramework.js)**:

- The project includes a robust testing framework with unit tests and end-to-end tests. Automated tests are run regularly to ensure the reliability and error-free performance of both extensions. This feature is crucial for maintaining high standards of code quality as new features are added or updates are made.

### **1.8. User-Friendly Customization (userSettings.js)**:

- Developers can easily customize the behavior and preferences of the extensions through a user-friendly settings interface. This flexibility allows you to tailor the extensions to your specific needs and workflow, enhancing productivity and efficiency.

### **1.9. Cross-Platform Compatibility (platformCompatibility.js)**:

- Both extensions are designed to work seamlessly across different operating systems, including Windows, macOS, and Linux. This ensures a consistent user experience regardless of your preferred platform, making the extensions accessible to a wide range of developers.

### **1.10. Extensible Architecture (extensibleArchitecture.js)**:

- The extensions follow a modular and extensible architecture, making it easy to add new features, integrate with additional AI platforms, or extend functionality to meet specific requirements. This design philosophy ensures that the extensions can evolve with your needs and the changing landscape of AI and development tools.

### **1.11. Built-in Code Snippets Library (codeSnippetsLibrary.js)**:

- Access a built-in library of commonly used code snippets and templates. This feature saves time by allowing developers to quickly insert frequently used code blocks into their projects, reducing the need for repetitive typing and speeding up development.

### **1.12. Code Quality and Maintainability (codeQualityAnalysis.js)**:

- The extensions integrate with VS Code's built-in "Problems" tab to analyze code issues and potential improvements. They provide suggestions for code clarity, simplicity, and maintainability, focusing on reducing duplication and avoiding error-prone constructs. This emphasis on code quality ensures that your codebase remains clean, readable, and maintainable.

### **1.13. Collaborative Editing Notifications (collaborativeEditing.js)**:

- When working in a Code-server environment, the extensions provide notifications if a file you are opening is currently being edited by someone else. This feature helps prevent conflicts and promotes awareness of collaboration among team members.

### **1.14. Git Integration and Branch Management (gitIntegration.js)**:

- Enjoy seamless Git integration for version control. The extensions automatically commit current files before overwriting, create new branches for changes, and open Pull Requests to merge modifications. This integration ensures that your code changes are managed efficiently and collaboratively, maintaining a clear history of modifications and facilitating smooth collaboration.

### **1.15. Incremental Documentation Updates (documentationGenerator.js)**:

- Keep your documentation up-to-date with code changes. The extensions analyze Git history to generate summaries of updates and prompt users to update documentation based on specific commit IDs. This feature ensures that your documentation reflects the latest code changes, making it easier for developers to understand and maintain the codebase.

### **1.16. File Change Monitoring and Reporting (fileChangeMonitoring.js)**:

- Monitor file changes in project folders and generate reports, charts, and time tracking information. The extensions leverage existing file change monitoring tools to provide valuable insights into project activity and developer productivity.

### **1.17. Notion Integration (notionIntegration.js)**:

- Integrate seamlessly with Notion, your preferred project management tool. The extensions synchronize code changes, tasks, and documentation between the development environment and Notion, facilitating efficient project management and collaboration.

### **1.18. Code Refactoring Assistance (codeRefactoring.js)**:

- Receive intelligent code refactoring suggestions and automation. The extensions help identify opportunities for improvement and provide tools to safely apply refactoring changes, enhancing code simplicity and maintainability.

### **1.19. Reporting and Analytics for Business Owners (businessReporting.js)**:

- By parsing the logs of each file being created, updated, and deleted, the report generator can accurately report on which project was worked on and for how long. By checking the commit messages generated by the AIs, it can say which files were part of which updates and how long it took, including how many iterations it took until everything worked without problems.
- Generate detailed reports and analytics tailored for business owners. The extensions provide insights into project progress, developer productivity, code quality metrics, and other key performance indicators (KPIs). This data is presented in a user-friendly format, enabling business owners to make informed decisions and track the success of their development teams.

## 2. The Central Module

This project demonstrates the use of a singleton pattern for dynamically loading and managing JavaScript modules using the `SingletonFX` script. The project includes several example modules to illustrate different use cases, including class instances, static classes, functions, and modules with multiple exports.

### 2.1. Project Structure

```bash
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

### 2.2. Modules

### `user.js`

```jsx
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

```jsx
// **modules/product.js**
export class Product {
    static createProduct(name) {
        console.log(`Product ${name} created.`);
    }
}
```

### `utils.js`

```jsx
// **modules/utils.js**
export function calculateTotal(price, quantity) {
    console.log(`Total is ${price * quantity}`);
}
```

### `multipleExports.js`

```jsx
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

## 2.3. Manifest

### `manifest.js`

```jsx
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

### 2.4. SingletonFX Script

### `fx.js`

```jsx
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

### 2.5. Main Script

### `main.js`

```jsx
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

### 2.6. PHP Script for Generating Hashes

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
    $jsonContent = preg_replace('/export\\s+const\\s+\\w+\\s+=\\s+/', '', $manifestContent);
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

## 3. How It Works

### 3.1. SingletonFX Script

The `SingletonFX` script is designed to dynamically load JavaScript modules on demand using a singleton pattern. It uses IndexedDB for caching and PHP for server-side hash generation to ensure that modules are invalidated and reloaded when they change.

### 3.2. Key Features:

- **Lazy Loading**: Modules are loaded only when accessed.
- **Caching**: Modules are cached in IndexedDB to reduce network requests.
- **Invalidation**: Cached modules are invalidated and reloaded when their hashes change.

### 3.3. Initialization:

The `SingletonFX` class initializes by fetching a list of invalidated modules from the server using the PHP script. It then deletes the outdated entries from IndexedDB.

### 3.4. Usage Examples

```jsx
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

### 3.5. PHP Script for Hash Generation

The PHP script (`generate_hashes.php`) generates MD5 hashes for specified files in the manifest and keeps track of changes. It responds with a list of modules that need to be invalidated.

### Configuration:

- **$modulesDirectory**: Path to the directory containing the modules.
- **$manifestPath**: Path to the manifest file.
- **$hashFilePath**: Path to save the hashes for future comparison.

### 3.6. Bash Script for Creating Files

The Bash script (`create_files.sh`) creates the necessary files for the project and opens them in Code-Server. It waits for user input before proceeding to the next file.

### 3.7. Usage:

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

### 3.8. Conclusion

This project demonstrates a dynamic module loading system using a singleton pattern, with efficient caching and invalidation mechanisms. The provided scripts help in setting up and managing the project structure.