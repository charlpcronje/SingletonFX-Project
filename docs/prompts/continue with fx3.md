# FX Library: Comprehensive Overview

## 1. Core FX Class Structure

The FX class is the central component of the library, managing resources, handling asynchronous operations, and providing a sync-like API.

```javascript
class FX {
    constructor() {
        this.manifestObj = {};
        this.resources = new Map();
        this.dynamicProperties = new Map();
        this.context = new ExecutionContext();
        this.dbPromise = this.initIndexedDB();
        this.proxyCache = new WeakMap();
        this.maxRecursionDepth = 10;

        this.loadManifest(initialManifest);

        return new Proxy(this, {
            get: (target, prop) => this.handleGet(target, prop, []),
            set: (target, prop, value) => this.handleSet(target, prop, value, [])
        });
    }

    // ... other methods ...
}
```

Key components:
- `manifestObj`: Stores the manifest configuration
- `resources`: Maps resource paths to their instances
- `dynamicProperties`: Stores dynamically added properties
- `context`: An instance of ExecutionContext for managing async operations
- `dbPromise`: Promise for IndexedDB initialization
- `proxyCache`: Caches proxies for performance
- `maxRecursionDepth`: Prevents infinite recursion in property access

## 2. Manifest Loading

The `loadManifest` method processes the manifest configuration:

```javascript
loadManifest(manifestObj, prefix = '') {
    Object.entries(manifestObj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !value.type) {
            this.loadManifest(value, fullKey);
        } else {
            let current = this.manifestObj;
            fullKey.split('.').forEach((part, index, array) => {
                if (index === array.length - 1) {
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
```

This method recursively processes the manifest, creating nested structures and resource instances.

## 3. Resource Creation

The `createResource` method instantiates different resource types:

```javascript
createResource(config) {
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
        default:
            throw new Error(`Unknown resource type: ${config.type}`);
    }
}
```

This method creates the appropriate resource instance based on the configuration type.

## 4. Property Access Handling

The `handleGet` method manages access to properties, resources, and nested objects:

```javascript
handleGet(target, prop, path, receiver, config = {}) {
    const fullPath = [...path, prop].join('.');
    console.log(`Accessing: ${fullPath}, Depth: ${path.length}`);

    if (path.length > this.maxRecursionDepth) {
        console.warn(`Maximum recursion depth reached for path: ${fullPath}. Stopping recursion.`);
        return undefined;
    }

    // Check for special properties
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
```

This method handles property access, including special properties, dynamic properties, resources, and nested objects.

## 5. Property Setting

The `handleSet` method manages setting properties and dynamic properties:

```javascript
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
```

This method handles setting properties, including special cases for IndexedDB, localStorage, and sessionStorage.

## 6. Resource Types

FX supports various resource types, each with its own class:

### APIResource

Handles API endpoints:

```javascript
class APIResource extends Resource {
    constructor(config, fx) {
        super(config, fx.context);
        this.fx = fx;
        this.baseUrl = config.baseUrl;
        this.methods = config.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        
        this.methods.forEach(method => {
            this[method.toLowerCase()] = this.createMethod(method);
        });
    }

    createMethod(method) {
        return (endpoint, options = {}) => {
            console.log(`Calling API method: ${method.toUpperCase()} ${this.baseUrl}${endpoint}`);
            return this.fx.context.await(
                fetch(`${this.baseUrl}${endpoint}`, {
                    method: method.toUpperCase(),
                    ...options,
                    headers: {
                        ...this.config.headers,
                        ...options.headers
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`API call failed: ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(`API call error: ${error.message}`);
                    throw error;
                })
            );
        };
    }
}
```

### CSSResource

Manages CSS loading and manipulation:

```javascript
class CSSResource extends Resource {
    constructor(config, context) {
        super(config, context);
        this.scope = config.scope || 'global';
        this.transformations = config.transformations || [];
    }

    async _doLoad() {
        const response = await fetch(this.config.path);
        let css = await response.text();

        if (this.transformations.length > 0) {
            css = await this.applyTransformations(css);
        }

        if (this.scope !== 'global') {
            css = this.scopeCSS(css, this.scope);
        }

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        return {
            getCSS: () => css,
            setScope: (newScope) => {
                css = this.scopeCSS(css, newScope);
                style.textContent = css;
            }
        };
    }

    // ... methods for transformations and scoping ...
}
```

### HTMLResource

Handles HTML template loading:

```javascript
class HTMLResource extends Resource {
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
```

### ModuleResource

Manages JavaScript module loading:

```javascript
class ModuleResource extends Resource {
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
```

### DataResource

Handles data file loading (JSON, XML, YML):

```javascript
class DataResource extends Resource {
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
            // Implement YAML parsing here
        } else {
            throw new Error(`Unsupported data type: ${contentType}`);
        }
    }
}
```

### RawResource

Manages raw file loading:

```javascript
class RawResource extends Resource {
    async _doLoad() {
        const response = await fetch(this.config.path);
        return response.text();
    }
}
```

## 7. ExecutionContext

The ExecutionContext class manages asynchronous operations to provide a sync-like API:

```javascript
class ExecutionContext {
    constructor() {
        this.taskQueue = [];
        this.running = false;
        this.logCount = 0;
        this.maxAttempts = 1000;
        this.delayBetweenAttempts = 1;
        this.sequences = new Map();
        this.cache = new Map();
    }

    run() {
        if (this.running) return;
        this.running = true;
        while (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift();
            task();
        }
        this.running = false;
    }

    enqueue(task) {
        this.taskQueue.push(task);
        if (!this.running) {
            this.run();
        }
    }

    await(promise) {
        let result;
        let hasResult = false;
        let error;

        promise.then(
            (value) => {
                result = value;
                hasResult = true;
            },
            (err) => {
                error = err;
                hasResult = true;
            }
        );

        while (!hasResult) {
            this.run();
        }

        if (error) throw error;
        return result;
    }

    // ... other methods for handling sequences, caching, etc. ...
}
```

This class is crucial for maintaining the sync-like API while handling asynchronous operations.

## 8. Usage Examples

Here are some examples of how to use the FX library:

```javascript
import fx from './fx.js';

// API calls
const users = fx.api.users.get('/users');
console.log('Users:', users);

// CSS loading and manipulation
const mainStyles = fx.styles.main;
console.log('Main CSS:', mainStyles.getCSS());
mainStyles.setScope('#app');

// HTML template loading
const userCardTemplate = fx.templates.userCard;
console.log('User card template:', userCardTemplate('.user-name'));

// Module loading
const utils = fx.modules.utils;
console.log('Total:', utils.calculateTotal(10, 5));

// JSON data loading
const config = fx.data.config;
console.log('Config:', config);

// Dynamic properties
fx.dynamicProp = { nested: { value: 42 } };
console.log('Dynamic property:', fx.dynamicProp.nested.value);

// Local storage
fx.store.testItem = 'Test Value';
console.log('Local Storage Item:', fx.store.testItem);

// Session storage
fx.session.sessionItem = { key: 'value' };
console.log('Session Storage Item:', fx.session.sessionItem);

// IndexedDB
fx.db.dbItem = { key: 'value' };
console.log('IndexedDB Item:', fx.db.dbItem);

// Environment variables
console.log('API URL:', fx.env.API_URL);
```

These examples demonstrate various features of the FX library, including API calls, resource loading, and storage access.

## 9. Manifest Configuration

The manifest is a crucial part of the FX library, defining how resources should be loaded and used:

```javascript
const manifest = {
    api: {
        users: {
            type: 'api',
            baseUrl: 'https://api.example.com/users',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    },
    styles: {
        main: {
            type: 'css',
            path: '/styles/main.css',
            scope: 'global',
            transformations: ['autoprefixer', 'minify']
        }
    },
    templates: {
        userCard: {
            type: 'html',
            path: '/templates/user-card.html'
        }
    },
    modules: {
        utils: {
            type: 'module',
            path: '/modules/utils.js'
        }
    },
    data: {
        config: {
            type: 'json',
            path: '/data/config.json'
        }
    }
};

fx.loadManifest(manifest);
```

This manifest configuration defines various resources that the FX library will manage.

## 10. Error Handling and Debugging

FX implements error handling for resource loading and API calls. It also provides debugging capabilities:

```javascript
fx.setDebug(true); // Enable debug mode
fx.log('This is a debug message');
```

## 11. Advanced Features and Usage

### Lazy Loading

FX implements lazy loading for resources, improving performance by only loading resources when they are first accessed:

```javascript
fx.manifest('lazyModule', {
    type: 'module',
    path: '/modules/lazy-module.js',
    defer: true
});

// The module is only loaded when accessed
const lazyModule = fx.lazyModule;
```

### Caching

FX provides built-in caching mechanisms for resources:

```javascript
fx.manifest('cachedAPI', {
    type: 'api',
    baseUrl: 'https://api.example.com',
    cache: 60000 // Cache for 60 seconds
});

// First call fetches from API
const data1 = fx.cachedAPI.get('/data');

// Second call within 60 seconds returns cached data
const data2 = fx.cachedAPI.get('/data');
```

### Retry Logic

FX includes retry logic for handling transient failures:

```javascript
fx.manifest('unstableAPI', {
    type: 'api',
    baseUrl: 'https://unstable-api.example.com',
    retry: 3, // Retry up to 3 times
    retryDelay: 1000 // Wait 1 second between retries
});

const result = fx.unstableAPI.get('/data');
```

The retry logic is implemented in the `ExecutionContext` class:

```javascript
class ExecutionContext {
    // ... other methods ...

    async runWithRetry(fn, retries, delay) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === retries) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}
```

### Dynamic Resource Addition

FX allows for dynamic addition of resources:

```javascript
fx.manifest('dynamicModule', {
    type: 'module',
    path: '/modules/dynamic-module.js'
});

const dynamicModule = fx.dynamicModule;
```

### Reactive Properties

FX can implement reactive properties using getters and setters:

```javascript
fx.reactive('count', 0, (newValue, oldValue) => {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
});

fx.count++; // Logs: "Count changed from 0 to 1"
```

Implementation in the FX class:

```javascript
class FX {
    // ... other methods ...

    reactive(key, initialValue, callback) {
        let value = initialValue;
        Object.defineProperty(this, key, {
            get: () => value,
            set: (newValue) => {
                const oldValue = value;
                value = newValue;
                callback(newValue, oldValue);
            }
        });
    }
}
```

### Component System

FX can implement a simple component system:

```javascript
fx.component('UserCard', {
    template: fx.templates.userCard,
    props: ['name', 'email'],
    methods: {
        greet() {
            alert(`Hello, ${this.props.name}!`);
        }
    }
});

const userCard = fx.render('UserCard', { props: { name: 'John', email: 'john@example.com' } });
document.body.appendChild(userCard);
```

Implementation in the FX class:

```javascript
class FX {
    // ... other methods ...

    component(name, config) {
        this.components = this.components || {};
        this.components[name] = config;
    }

    render(name, options) {
        const component = this.components[name];
        if (!component) throw new Error(`Component ${name} not found`);

        const element = document.createElement('div');
        element.innerHTML = component.template(options.props);

        const instance = {
            props: options.props,
            methods: {}
        };

        for (const [methodName, method] of Object.entries(component.methods)) {
            instance.methods[methodName] = method.bind(instance);
            element[methodName] = instance.methods[methodName];
        }

        return element;
    }
}
```

## 12. State Management

FX can implement a simple state management system:

```javascript
fx.state.create('appState', {
    count: 0,
    user: null
});

fx.state.watch('appState.count', (newValue, oldValue) => {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
});

fx.state.appState.count++; // Logs: "Count changed from 0 to 1"
```

Implementation in the FX class:

```javascript
class FX {
    // ... other methods ...

    state = {
        create: (name, initialState) => {
            this[name] = new Proxy(initialState, {
                set: (target, property, value) => {
                    const oldValue = target[property];
                    target[property] = value;
                    this.state.notify(`${name}.${property}`, value, oldValue);
                    return true;
                }
            });
        },
        watch: (path, callback) => {
            this.state.watchers = this.state.watchers || {};
            this.state.watchers[path] = this.state.watchers[path] || [];
            this.state.watchers[path].push(callback);
        },
        notify: (path, newValue, oldValue) => {
            const watchers = this.state.watchers[path] || [];
            watchers.forEach(callback => callback(newValue, oldValue));
        }
    };
}
```

## 13. Plugin System

FX can support a plugin system for extending its functionality:

```javascript
fx.use(myPlugin);

function myPlugin(fx) {
    fx.newMethod = () => {
        console.log('New method added by plugin');
    };
}

fx.newMethod(); // Logs: "New method added by plugin"
```

Implementation in the FX class:

```javascript
class FX {
    // ... other methods ...

    use(plugin) {
        plugin(this);
    }
}
```

## 14. Security Considerations

When implementing FX, it's important to consider security:

1. **Input Validation**: Validate all inputs, especially when dynamically creating resources or executing code.
2. **Content Security Policy**: Implement a strong Content Security Policy to prevent XSS attacks.
3. **HTTPS**: Ensure all API calls and resource loading use HTTPS.
4. **Authentication**: Implement proper authentication for API calls and sensitive resources.
5. **Data Sanitization**: Sanitize data before rendering it in templates or inserting it into the DOM.

## 15. Performance Optimization

To optimize FX's performance:

1. **Minimize manifest size**: Only include necessary resources in the manifest.
2. **Use lazy loading**: Defer loading of non-critical resources.
3. **Implement efficient caching**: Cache responses and resources appropriately.
4. **Optimize proxy usage**: Minimize the depth of proxy chains.
5. **Use Web Workers**: Offload heavy computations to Web Workers.

## 16. Testing

Implement comprehensive testing for FX:

1. **Unit Tests**: Test individual methods and classes.
2. **Integration Tests**: Test how different parts of FX work together.
3. **End-to-End Tests**: Test the entire system in a real-world scenario.
4. **Performance Tests**: Ensure FX performs well under load.
5. **Security Tests**: Verify that FX is secure against common vulnerabilities.

Example of a unit test using Jest:

```javascript
test('FX loads API resource', async () => {
    const fx = new FX();
    fx.manifest('api.test', {
        type: 'api',
        baseUrl: 'https://api.example.com'
    });

    const mockData = { id: 1, name: 'Test' };
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockData)
        })
    );

    const result = await fx.api.test.get('/data');
    expect(result).toEqual(mockData);
});
```

This comprehensive overview covers the core functionality of the FX library, advanced features, security considerations, performance optimizations, and testing strategies. The FX library provides a powerful and flexible system for managing resources, handling asynchronous operations, and building complex web applications with a sync-like API.

