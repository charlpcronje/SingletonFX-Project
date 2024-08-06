```markdown
# FX Library Help

# FX Library Features

## 1. Dynamic Properties
Set and get dynamic properties easily:

```js
// Setting properties
fx.user.name = "Peter";
fx.set("user.name", "Peter", "Default Value");
fx.data("user.name", "Peter");

// Getting properties
const userName1 = fx.user.name;
const userName2 = fx.get("user.name", "Default Value");
const userName3 = fx.data("user.name");
```

## 2. Local/Session Storage
Easily interact with local and session storage:

```js
// Local storage
fx.store.key = "Value";
const localValue = fx.store.key;

// Session storage
fx.session.key = "Value";
const sessionValue = fx.session.key;
```

## 3. IndexedDB Integration
Work with IndexedDB seamlessly:

```js
fx.db.users.add({id: 1, name: "Peter"});
const user = fx.db.users.get(1);
```

## 4. Instance from Module
Load and use class instances from modules:

```js
// Manifest
{
    user: {
        path: 'modules/user.js',
        type: 'instance',
        mainExport: 'User'
    }
}

// Usage
fx.user.addUser("Peter Piper");
```

## 5. Class from Module
Load and use classes from modules:

```js
// Manifest
{
    product: {
        path: 'modules/product.js',
        type: 'class',
        mainExport: 'Product'
    }
}

// Usage
const product = new fx.product();
```

## 6. Function from Module
Load and use functions from modules:

```js
// Manifest
{
    utils: {
        calc: {
            total: {
                path: 'modules/utils.js',
                type: 'function',
                mainExport: 'calculateTotal'
            }
        }
    }
}

// Usage
const total = fx.utils.calc.total(30, 5);
```

## 7. Multiple Exports
Work with modules that have multiple exports:

```js
// Manifest
{
    multipleExports: {
        path: 'modules/multipleExports.js',
        type: 'instance',
        mainExport: 'Order',
        additionalExports: {
            cancelOrder: 'cancelOrder'
        }
    }
}

// Usage
const order = fx.multipleExports;  // Instance of Order
order.placeOrder("Product A", 2);  // Method from main export
fx.multipleExports.cancelOrder("ORDER123");  // Additional export
```

## 8. CSS Loading
Load and apply CSS dynamically:

```js
// Manifest
{
    styles: {
        main: {
            type: 'css',
            path: '/styles/main.css',
            scope: 'global',
            transformations: ['autoprefixer', 'minify']
        }
    }
}

// Usage
console.log(fx.styles.main);
```

## 9. HTML Templates
Load and use HTML templates:

```js
// Manifest
{
    templates: {
        user: {
            card: {
                type: 'html',
                path: '/templates/user-card.html'
            }
        }
    }
}

// Usage
const userCardTemplate = fx.templates.user.card;
const userCardHtml = userCardTemplate({name: "John Doe", email: "john@example.com"});
```

## 10. JSON Data
Load and use JSON data:

```js
// Manifest
{
    data: {
        config: {
            type: 'json',
            path: '/data/config.json'
        }
    }
}

// Usage
const config = fx.data.config;
console.log(config.apiKey);
```

## 11. Raw Files
Load raw file contents:

```js
// Manifest
{
    raw: {
        readme: {
            type: 'raw',
            path: '/README.md'
        }
    }
}

// Usage
const readmeContent = fx.raw.readme;
console.log(readmeContent);
```

## 12. Sync-like API for Asynchronous Operations
FX allows you to write asynchronous code in a synchronous style.

```js
const users = fx.api.users.get('/api/users');
console.log(users);  // This works without await!
```

## 13. Sequence Control
Control the order of execution using sequence identifiers.

```js
fx(1).api.users.get('/api/users');
fx(1).api.posts.get('/api/posts');  // This runs after the previous call
fx(2).api.comments.get('/api/comments');  // This can run in parallel
```

## 14. Automatic Retry
Automatically retry failed operations.

```js
fx({ retry: 3 }).api.users.get('/api/users');  // Will retry up to 3 times on failure
```

## 15. Caching
Cache results for improved performance.

```js
fx({ cache: 5000 }).api.users.get('/api/users');  // Cache result for 5 seconds
```

## 16. Logging
Log operations for debugging purposes.

```js
fx({ log: 3 }).api.users.get('/api/users');  // Log both call initiation and result
```

## 17. Callback Support
Execute a callback function after an operation completes.

```js
fx({ cb: (result) => console.log(result) }).api.users.get('/api/users');
```

## 18. Sequence Callback
Trigger another sequence after the current one completes.

```js
fx({ sq: 1, sqcb: 2 }).api.users.get('/api/users');
fx({ sq: 2 }).api.posts.get('/api.posts');  // This will run after the users API call
```

## 19. Resource Loading
Load various types of resources easily.

```js
const template = fx.load({ type: "html", path: "/template.html" });
const styles = fx.load({ type: "css", path: "/styles.css" });
const config = fx.load({ type: "json", path: "/config.json" });
```

## 20. IndexedDB Integration
Seamlessly work with IndexedDB for client-side storage.

```js
fx.db.users.add({ name: "John Doe" });
const user = fx.db.users.get(1);
```

## 21. Environment Variable Access
Access environment variables easily.

```js
const apiKey = fx.env.API_KEY;
```

# Unintentional Features

### 1. Proxy-based Property Creation
Dynamically create properties that don't exist.

```js
fx.nonExistentApi.someMethod();  // This creates a new API endpoint on the fly
```

### 2. Infinite Chaining
Chain methods indefinitely without errors.

```js
fx.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z();
```

### 3. Mixed Sequence and Non-sequence Calls
Mix sequenced and non-sequenced calls in unexpected ways.

```js
fx(1).api.users.get('/api/users');
fx.api.posts.get('/api/posts');
fx(1).api.comments.get('/api/comments');
```

### 4. Recursive Configuration
Apply configurations recursively.

```js
fx({ log: 3 }).fx({ retry: 2 }).fx({ cache: 5000 }).api.users.get('/api/users');
```

### 5. Dynamic Resource Type Conversion
Attempt to convert

between resource types on the fly.

```js
const htmlAsJson = fx.load({ type: "json", path: "/template.html" });
```

Note: These unintentional features may not always work as expected and are not officially supported. Use them at your own risk!