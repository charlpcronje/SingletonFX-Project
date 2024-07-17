# FX Singleton Class 

The FX class is a powerful and flexible resource management system designed to provide a unified, synchronous-like API for handling various types of resources, including modules, API endpoints, CSS, HTML, and data storage. It leverages JavaScript's Proxy object to create a seamless interface for accessing and manipulating these resources.

Key features of the FX class include:

1. Dynamic resource loading and management
2. A manifest system for declaring resources
3. Lazy loading of resources
4. Unified access to different storage mechanisms (localStorage, sessionStorage, IndexedDB)
5. Environment variable access
6. CSS loading and manipulation with scoping and transformations
7. HTML loading with easy querying capabilities
8. API endpoint management
9. Dynamic property handling

The FX class is designed to provide a sync-like API, meaning that even asynchronous operations appear synchronous in usage. This is achieved through clever use of proxies and an execution context that manages asynchronous operations behind the scenes. Users of the FX class can interact with resources as if they were simple object properties, without needing to use async/await or handle promises directly.

## Reasoning about IndexedDB Access

To maintain consistency with the sync-like API of other FX features, we need to redesign the IndexedDB access to remove explicit `get` and `set` methods. Instead, we'll use a proxy-based approach similar to how we handle localStorage and sessionStorage. This will allow for transparent, sync-like access to IndexedDB data.

```js
/**
 * @method handleDBAccess
 * @description Handles access to IndexedDB
 * @returns {Proxy} A proxy object for interacting with IndexedDB
 */
handleDBAccess() {
    return new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === 'symbol') return;
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
 */
setToIndexedDB(storeName, key, value) {
    this.context.await(async () => {
        const db = await this.dbPromise;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        await store.put(value, key);
    });
}

```

With this implementation, IndexedDB can be accessed in a sync-like manner, consistent with other FX features:

```js
fx.db.userPreferences = { theme: 'dark' };
console.log(fx.db.userPreferences); // { theme: 'dark' }
```

Now, let's proceed with documenting all the functionality added to FX so far.

# List of FX Functionalities

1. Dynamic Resource Loading and Management
2. Manifest System
3. Lazy Loading
4. Local and Session Storage Access
5. IndexedDB Access
6. Environment Variable Access
7. CSS Loading and Manipulation
8. HTML Loading and Querying
9. API Endpoint Management
10. Dynamic Property Handling

## 1. Dynamic Resource Loading and Management

### Description
The FX class provides a system for dynamically loading and managing various types of resources, including modules, CSS, HTML, and data. It allows for on-demand loading of resources and provides a unified interface for accessing them.

### Reasoning
The goal was to create a flexible system that can handle different types of resources uniformly, reducing the complexity of resource management in large applications.

### Considerations
- Performance implications of dynamic loading
- Caching mechanisms to prevent unnecessary reloads
- Handling of different resource types (modules, CSS, HTML, data)
- Error handling for failed resource loads

### Implementation
```js
async loadResource(path) {
    const config = this.getManifestEntry(path);
    if (!config) {
        throw new Error(`No manifest entry found for ${path}`);
    }

    if (this.resourceCache.has(path)) {
        return this.resourceCache.get(path);
    }

    let resource;
    switch (config.type) {
        case 'module':
            resource = await this.loadModule(config);
            break;
        case 'css':
            resource = await this.loadCSS(config);
            break;
        case 'html':
            resource = await this.loadHTML(config);
            break;
        // ... other resource types
    }

    this.resourceCache.set(path, resource);
    return resource;
}

```

### Use Cases
```js
// Loading a module
const userModule = fx.modules.user;

// Loading CSS
const styles = fx.styles.main;

// Loading HTML
const header = fx.templates.header;
```

## 2. Manifest System

### Description
The manifest system allows for declarative definition of resources that can be loaded by the FX class. It provides a centralized place to configure and manage all resources used in an application.

### Reasoning
A manifest system was implemented to separate resource configuration from the loading logic, making it easier to manage and update resources without changing the core FX code.

### Considerations
- Flexibility in defining different types of resources
- Easy updating and maintenance of resource configurations
- Support for adding new resource types in the future
- Performance implications of manifest parsing

### Implementation
```js
manifest(path, config) {
    this.manifest[path] = { ...config, defer: true };
}

getManifestEntry(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], this.manifest);
}

```

### Use Cases
```js
// Defining a resource in the manifest
fx.manifest('styles.main', {
    type: 'css',
    path: '/styles/main.css',
    scope: 'global'
});

// Accessing a resource defined in the manifest
const mainStyles = fx.styles.main;
```

## 3. Lazy Loading

### Description
Lazy loading allows resources to be loaded only when they are actually needed, improving initial load times and reducing unnecessary network requests.

### Reasoning
Lazy loading was implemented to optimize performance, especially for large applications with many resources that may not all be needed immediately.

### Considerations
- Balance between lazy loading and preloading for critical resources
- Handling of dependencies between lazily loaded resources
- User experience during lazy loading (e.g., loading indicators)
- Caching of lazily loaded resources for subsequent access

### Implementation
```js
handleGet(target, prop, receiver, path) {
    const fullPath = [...path, prop].join('.');

    if (this.getManifestEntry(fullPath)) {
        return this.loadResource(fullPath);
    }

    // ... other property handling
}

```

### Use Cases
```js
// Resource is not loaded until accessed
const userModule = fx.modules.user; // Loads the module when accessed

// Subsequent accesses use the cached resource
const sameUserModule = fx.modules.user; // Returns the already loaded module
```

## 4. Local and Session Storage Access

### Description
FX provides a unified interface for accessing both localStorage and sessionStorage, allowing for easy storage and retrieval of data that persists across page reloads (localStorage) or for the duration of a page session (sessionStorage).

### Reasoning
A unified interface for storage access was implemented to simplify data persistence operations and provide a consistent API for different storage mechanisms.

### Considerations
- Seamless integration with the FX API
- Handling of JSON serialization and deserialization
- Error handling for storage quota exceeded scenarios
- Clear distinction between local and session storage

### Implementation
```js
handleStorageAccess(type) {
    const storage = type === 'local' ? localStorage : sessionStorage;
    return new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === 'symbol') return;
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

```

### Use Cases
```js
// Setting a value in localStorage
fx.store.userPreferences = { theme: 'dark' };

// Getting a value from localStorage
const theme = fx.store.userPreferences.theme;

// Setting a value in sessionStorage
fx.session.currentUser = { id: 1, name: 'John' };

// Getting a value from sessionStorage
const userId = fx.session.currentUser.id;
```

## 5. IndexedDB Access

### Description
FX provides a sync-like interface for interacting with IndexedDB, allowing for storage and retrieval of larger amounts of structured data in the browser.

### Reasoning
IndexedDB access was implemented to provide a more powerful and flexible storage option compared to localStorage and sessionStorage, while maintaining the sync-like API consistent with other FX features.

### Considerations
- Maintaining a sync-like API for asynchronous IndexedDB operations
- Handling of complex data structures
- Error handling for failed database operations
- Performance optimization for frequent database access

### Implementation
```js
handleDBAccess() {
    return new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === 'symbol') return;
            return this.getFromIndexedDB('fxStore', prop);
        },
        set: (target, prop, value) => {
            if (typeof prop === 'symbol') return false;
            this.setToIndexedDB('fxStore', prop, value);
            return true;
        }
    });
}

getFromIndexedDB(storeName, key) {
    return this.context.await(async () => {
        const db = await this.dbPromise;
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        return await store.get(key);
    });
}

setToIndexedDB(storeName, key, value) {
    this.context.await(async () => {
        const db = await this.dbPromise;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        await store.put(value, key);
    });
}

```

### Use Cases
```js
// Setting a value in localStorage
fx.store.userPreferences = { theme: 'dark' };

// Getting a value from localStorage
const theme = fx.store.userPreferences.theme;

// Setting a value in sessionStorage
fx.session.currentUser = { id: 1, name: 'John' };

// Getting a value from sessionStorage
const userId = fx.session.currentUser.id;

// Storing data in IndexedDB
fx.db.userProfile = { id: 1, name: 'John', email: 'john@example.com' };

// Retrieving data from IndexedDB
const userProfile = fx.db.userProfile;

// Updating data in IndexedDB
fx.db.userProfile.lastLogin = new Date();
```

## 6. Environment Variable Access

### Description
FX provides access to environment variables, allowing for configuration values to be easily accessed throughout the application.

### Reasoning
Environment variable access was implemented to allow for easy configuration management and to support different environments (development, staging, production) without code changes.

### Considerations
- Security of sensitive environment variables
- Handling of missing or undefined environment variables
- Integration with different environment variable sources (e.g., .env files, server-side configurations)
- Performance impact of environment variable access

### Implementation
```js
handleEnvAccess() {
    return new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === 'symbol') return;
            return process.env[prop];
        }
    });
}

```

### Use Cases
```js
// Setting a value in localStorage
fx.store.userPreferences = { theme: 'dark' };

// Getting a value from localStorage
const theme = fx.store.userPreferences.theme;

// Setting a value in sessionStorage
fx.session.currentUser = { id: 1, name: 'John' };

// Getting a value from sessionStorage
const userId = fx.session.currentUser.id;

// Storing data in IndexedDB
fx.db.userProfile = { id: 1, name: 'John', email: 'john@example.com' };

// Retrieving data from IndexedDB
const userProfile = fx.db.userProfile;

// Updating data in IndexedDB
fx.db.userProfile.lastLogin = new Date();
// Accessing an environment variable
const apiKey = fx.env.API_KEY;

// Using an environment variable in configuration
const dbConfig = {
    host: fx.env.DB_HOST,
    port: fx.env.DB_PORT,
    username: fx.env.DB_USER
};
```

## 7. CSS Loading and Manipulation

### Description
FX provides functionality for loading CSS files, applying transformations, and scoping styles to specific elements. This allows for dynamic styling and helps prevent style conflicts in large applications.

### Reasoning
CSS loading and manipulation were implemented to provide greater control over styling in dynamic applications, allowing for runtime changes to styles and scoping of CSS to prevent unintended side effects.

### Considerations
- Performance of CSS parsing and manipulation
- Browser compatibility of CSS transformations
- Proper scoping of CSS to prevent global style pollution
- Caching of processed CSS for improved performance

### Implementation
```js
async loadCSS(config) {
    const response = await fetch(config.path);
    let css = await response.text();

    if (config.transformations) {
        css = await this.applyTransformations(css, config.transformations);
    }

    if (config.scope && config.scope !== 'global') {
        css = this.scopeCSS(css, config.scope);
    }

    const style = document.createElement('style');
    style.textContent = css;
    if (config.media) {
        style.media = config.media;
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
```

### Use Cases
```js
// Loading and applying CSS
const mainStyles = fx.styles.main;

// Scoping CSS to a specific element
mainStyles.setScope('#app-container');

// Removing dynamically added styles
mainStyles.remove();
```

## 8. HTML Loading and Querying

### Description
FX provides functionality for loading HTML templates and easily querying elements within those templates. This allows for dynamic content insertion and manipulation.

### Reasoning
HTML loading and querying were implemented to support dynamic content management in single-page applications and to provide an easy way to work with HTML templates

### Considerations
- Efficient parsing and storage of HTML content
- Security considerations when loading and inserting HTML
- Performance optimization for frequent querying of loaded HTML
- Handling of malformed HTML

### Implementation
```js
async loadHTML(config) {
    const response = await fetch(config.path);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return (selector) => {
        if (!selector) return html;
        const elements = doc.querySelectorAll(selector);
        return elements.length === 1 ? elements[0] : Array.from(elements);
    };
}
```

### Use Cases
```js
// Setting a value in localStorage
fx.store.userPreferences = { theme: 'dark' };

// Getting a value from localStorage
const theme = fx.store.userPreferences.theme;

// Setting a value in sessionStorage
fx.session.currentUser = { id: 1, name: 'John' };

// Getting a value from sessionStorage
const userId = fx.session.currentUser.id;

// Storing data in IndexedDB
fx.db.userProfile = { id: 1, name: 'John', email: 'john@example.com' };

// Retrieving data from IndexedDB
const userProfile = fx.db.userProfile;

// Updating data in IndexedDB
fx.db.userProfile.lastLogin = new Date();
// Accessing an environment variable
const apiKey = fx.env.API_KEY;

// Using an environment variable in configuration
const dbConfig = {
    host: fx.env.DB_HOST,
    port: fx.env.DB_PORT,
    username: fx.env.DB_USER
};
// Loading an HTML template
const template = fx.templates.userCard;

// Querying elements within the loaded template
const userName = template('.user-name');
const userAvatar = template('.user-avatar');

// Getting the full HTML content
const fullHTML = template();

// Using the queried elements
document.querySelector('#user-container').appendChild(userName);
```

## 9. API Endpoint Management

### Description
FX provides a system for managing and interacting with API endpoints. It allows for easy configuration of endpoints and provides a uniform interface for making API calls.

### Reasoning
API endpoint management was implemented to simplify interaction with backend services, provide a consistent interface for API calls across the application, and allow for easy configuration and management of API endpoints.

### Considerations
- Handling of different HTTP methods (GET, POST, PUT, DELETE, etc.)
- Error handling and retry logic for failed API calls
- Authentication and authorization for API requests
- Caching of API responses for improved performance

### Implementation
```js
loadAPI(config) {
    const api = {};
    const methods = config.methods || ['GET', 'POST', 'PUT', 'DELETE'];
    methods.forEach(method => {
        api[method.toLowerCase()] = async (endpoint, options = {}) => {
            const url = `${config.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                method,
                headers: { ...config.headers, ...options.headers },
                ...options
            });
            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }
            return response.json();
        };
    });
    return api;
}

```

### Use Cases
```js
// Configuring an API endpoint
fx.manifest('api.users', {
    type: 'api',
    baseUrl: 'https://api.example.com/users',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// Making API calls
const users = await fx.api.users.get('/');
const newUser = await fx.api.users.post('/', { body: JSON.stringify({ name: 'John Doe' }) });
await fx.api.users.put(`/${newUser.id}`, { body: JSON.stringify({ name: 'Jane Doe' }) });
await fx.api.users.delete(`/${newUser.id}`);
```

## 10. Dynamic Property Handling

### Description
FX provides a system for dynamically creating, accessing, and manipulating properties. This allows for flexible data management and enables the creation of complex data structures on the fly.

### Reasoning
Dynamic property handling was implemented to provide a flexible way to manage data within the application, allowing for the creation of nested structures and dynamic addition of properties without predefined schemas.

### Considerations
- Performance implications of dynamic property access
- Maintaining consistency with JavaScript's native object behavior
- Handling of nested properties and complex data structures
- Serialization and deserialization of dynamic properties

### Implementation
```js
handleGet(target, prop, receiver, path) {
    const fullPath = [...path, prop].join('.');

    if (this.dynamicProperties.has(fullPath)) {
        return this.dynamicProperties.get(fullPath);
    }

    return new Proxy(() => {}, {
        get: (t, p, r) => this.handleGet(target, p, r, [...path, prop]),
        set: (t, p, v, r) => this.handleSet(target, p, v, r, [...path, prop]),
        apply: (t, _, args) => this.handleFunctionCall(fullPath, args)
    });
}

handleSet(target, prop, value, receiver, path) {
    const fullPath = [...path, prop].join('.');
    this.dynamicProperties.set(fullPath, value);
    return true;
}

set(key, value) {
    this.dynamicProperties.set(key, value);
    return this;
}

get(key, defaultValue) {
    return this.dynamicProperties.has(key) ? this.dynamicProperties.get(key) : defaultValue;
}

data(key, value) {
    if (arguments.length === 1) {
        return this.get(key);
    }
    return this.set(key, value);
}
```

### Use Cases
```js
// Setting a value in localStorage
fx.store.userPreferences = { theme: 'dark' };

// Getting a value from localStorage
const theme = fx.store.userPreferences.theme;

// Setting a value in sessionStorage
fx.session.currentUser = { id: 1, name: 'John' };

// Getting a value from sessionStorage
const userId = fx.session.currentUser.id;

// Storing data in IndexedDB
fx.db.userProfile = { id: 1, name: 'John', email: 'john@example.com' };

// Retrieving data from IndexedDB
const userProfile = fx.db.userProfile;

// Updating data in IndexedDB
fx.db.userProfile.lastLogin = new Date();
// Accessing an environment variable
const apiKey = fx.env.API_KEY;

// Using an environment variable in configuration
const dbConfig = {
    host: fx.env.DB_HOST,
    port: fx.env.DB_PORT,
    username: fx.env.DB_USER
};
// Loading an HTML template
const template = fx.templates.userCard;

// Querying elements within the loaded template
const userName = template('.user-name');
const userAvatar = template('.user-avatar');

// Getting the full HTML content
const fullHTML = template();

// Using the queried elements
document.querySelector('#user-container').appendChild(userName);
// Setting dynamic properties
fx.user = { name: 'John Doe' };
fx.user.age = 30;
fx.company.address.street = 'Main St';

// Getting dynamic properties
const userName = fx.user.name;
const companyStreet = fx.company.address.street;

// Using the set and get methods
fx.set('config.theme', 'dark');
const theme = fx.get('config.theme');

// Using the data method
fx.data('settings.notifications', true);
const notifications = fx.data('settings.notifications');
```

This completes the comprehensive documentation of the FX class functionalities. Each section provides a detailed explanation of the functionality, the reasoning behind its implementation, key considerations, the actual implementation code, and example use cases.

The FX class provides a powerful and flexible system for resource management, data handling, and API interactions, all while maintaining a sync-like API that simplifies asynchronous operations for the end user. Its modular design allows for easy extension and customization to meet the specific needs of various applications.