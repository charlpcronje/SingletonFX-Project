# FX Framework Specification

## 1. Overview

FX is an advanced JavaScript framework designed to provide a seamless, synchronous-like interface for both client-side and server-side development. It employs a unique approach to resource management, state handling, and component creation, allowing developers to work with asynchronous operations in a synchronous manner.

## 2. Core Concepts

### 2.1 Singleton Pattern
FX uses a singleton pattern, ensuring only one instance of the framework is created and used throughout the application.

### 2.2 Proxy-based Property Access
FX utilizes JavaScript Proxies to provide dynamic, nested property access and method invocation.

### 2.3 Resource Management
Resources (APIs, modules, components, etc.) are defined in a manifest and dynamically loaded as needed.

### 2.4 Isomorphic Design
FX is designed to work seamlessly in both browser and Node.js environments.

### 2.5 Component System
FX includes a component system for creating reusable UI elements.

### 2.6 Synchronous-like Asynchronous Operations
Asynchronous operations are handled in a way that allows them to be written and used as if they were synchronous.

## 3. Key Features

### 3.1 Dynamic Resource Loading
Resources are loaded on-demand, improving performance and reducing initial load times.

### 3.2 State Management
FX provides a built-in state management system that can be used across components.

### 3.3 ExecutionContext
Manages the execution of asynchronous tasks in a synchronous-looking manner.

### 3.4 Manifest-based Configuration
Application structure and resources are defined in a manifest, providing a clear overview of the application's architecture.

## 4. Usage Examples

### 4.1 Basic Setup

```javascript
import fx from 'fx-framework';

// Initialize the framework
fx.init({
    manifest: './app-manifest.js',
    debug: true
});

// Start the application
fx.start();
```

### 4.2 Defining and Using Resources

In your manifest file (app-manifest.js):

```javascript
export default {
    api: {
        users: {
            type: 'api',
            baseUrl: 'https://api.example.com/users'
        }
    },
    components: {
        UserList: {
            type: 'component',
            path: './components/UserList.js'
        }
    }
};
```

Using the defined resources:

```javascript
// Fetch users
const users = await fx.api.users.get('/');

// Render user list component
fx.components.UserList.render(users);
```

### 4.3 Creating a Component

```javascript
fx.component('UserList', {
    template: `
        <ul>
            {{#each users}}
                <li>{{this.name}}</li>
            {{/each}}
        </ul>
    `,
    data: {
        users: []
    },
    async created() {
        this.users = await fx.api.users.get('/');
    }
});
```

### 4.4 State Management

```javascript
// Set global state
fx.state.set('currentUser', { id: 1, name: 'John Doe' });

// Get state in a component
fx.component('UserProfile', {
    template: `<div>Welcome, {{user.name}}</div>`,
    data: {
        user: fx.state.get('currentUser')
    }
});
```

### 4.5 Custom Resource Types

```javascript
fx.defineResource('customDB', {
    init: (config) => {
        // Initialize custom database connection
    },
    methods: {
        query: (sql) => {
            // Execute SQL query
        }
    }
});

// Usage
const results = await fx.customDB.query('SELECT * FROM users');
```

### 4.6 Nested Property Access

```javascript
// Assuming a deeply nested API structure
const userComments = await fx.api.users.posts.comments.get('/1/2');
```

### 4.7 ExecutionContext Usage

```javascript
fx.runAsync(async () => {
    const user = await fx.api.users.get('/1');
    const posts = await fx.api.posts.get(`/user/${user.id}`);
    return { user, posts };
}).then(result => {
    console.log(result);
});
```

### 4.8 Server-side Rendering

```javascript
// On the server
const app = fx.createServerApp();

app.get('/', async (req, res) => {
    const initialState = await fx.api.getInitialState();
    const renderedApp = await fx.ssr.render('App', { initialState });
    res.send(renderedApp);
});
```

### 4.9 Lazy Loading

```javascript
// In your manifest
export default {
    modules: {
        heavyModule: {
            type: 'module',
            path: './heavyModule.js',
            lazy: true
        }
    }
};

// Usage
fx.modules.heavyModule.load().then(module => {
    module.doHeavyOperation();
});
```

### 4.10 Custom Plugin

```javascript
fx.plugin('logger', {
    install: (fx, options) => {
        fx.log = (message) => {
            console.log(`[${options.prefix}] ${message}`);
        };
    }
});

// Usage
fx.use('logger', { prefix: 'MyApp' });
fx.log('Hello, World!'); // Outputs: [MyApp] Hello, World!
```

## 5. Best Practices

1. Use the manifest to define your application structure and resources.
2. Leverage the ExecutionContext for managing asynchronous operations.
3. Create reusable components for consistent UI elements.
4. Utilize the built-in state management for sharing data across components.
5. Take advantage of lazy loading for better performance in larger applications.