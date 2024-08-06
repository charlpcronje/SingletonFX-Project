# Storage Integration in FX Framework

The FX Framework provides seamless integration with various storage mechanisms, allowing you to easily persist and retrieve data in your web applications. This section covers Local Storage, Session Storage, and IndexedDB integration.

## Local Storage

Local Storage allows you to store key-value pairs in the browser, persisting even when the browser window is closed.

### Setting Values in Local Storage

To set a value in Local Storage using FX:

```javascript
fx.store.key = "Value";
```

This is equivalent to:

```javascript
localStorage.setItem("key", "Value");
```

For complex objects:

```javascript
fx.store.user = { name: "John", age: 30 };
```

FX automatically handles JSON serialization for complex objects.

### Getting Values from Local Storage

To retrieve a value from Local Storage:

```javascript
const value = fx.store.key;
```

This is equivalent to:

```javascript
const value = localStorage.getItem("key");
```

For complex objects:

```javascript
const user = fx.store.user;
console.log(user.name); // Outputs: "John"
```

FX automatically handles JSON parsing for complex objects.

### Removing Values from Local Storage

To remove a value:

```javascript
delete fx.store.key;
```

This is equivalent to:

```javascript
localStorage.removeItem("key");
```

## Session Storage

Session Storage works similarly to Local Storage but persists only for the duration of the browser session.

### Setting Values in Session Storage

```javascript
fx.session.key = "Value";
```

### Getting Values from Session Storage

```javascript
const value = fx.session.key;
```

### Removing Values from Session Storage

```javascript
delete fx.session.key;
```

The usage is identical to Local Storage, but the data is stored in the session context.

## IndexedDB Integration

FX provides a high-level API for working with IndexedDB, simplifying complex operations.

### Defining an IndexedDB Store

Before using IndexedDB, you need to define your object stores. This is typically done during your app's initialization:

```javascript
fx.db.define("users", { keyPath: "id" });
fx.db.define("products", { keyPath: "sku" });
```

This creates object stores named "users" and "products" if they don't already exist.

### Adding Data to IndexedDB

To add data to an IndexedDB store:

```javascript
fx.db.users.add({ id: 1, name: "Peter", age: 30 });
```

For multiple items:

```javascript
fx.db.users.addMany([
  { id: 2, name: "Alice", age: 28 },
  { id: 3, name: "Bob", age: 35 }
]);
```

### Retrieving Data from IndexedDB

To get a single item by its key:

```javascript
const user = fx.db.users.get(1);
console.log(user.name); // Outputs: "Peter"
```

To query data:

```javascript
const youngUsers = fx.db.users.query(user => user.age < 30);
```

### Updating Data in IndexedDB

To update an existing item:

```javascript
fx.db.users.update(1, { age: 31 });
```

Or using a function:

```javascript
fx.db.users.update(1, user => {
  user.age++;
  return user;
});
```

### Deleting Data from IndexedDB

To delete a single item:

```javascript
fx.db.users.delete(1);
```

To delete all items matching a condition:

```javascript
fx.db.users.deleteMany(user => user.age > 40);
```

### Transactions

FX handles transactions automatically for individual operations. For multiple operations, you can use a transaction block:

```javascript
fx.db.transaction(["users", "products"], "readwrite", async (users, products) => {
  await users.add({ id: 4, name: "Eve", age: 22 });
  await products.add({ sku: "PROD1", name: "Widget", price: 9.99 });
});
```

This ensures that all operations within the block are part of a single transaction.

## Best Practices and Tips

1. **Choose the Right Storage**: Use Local Storage for small amounts of data that should persist across sessions, Session Storage for temporary data, and IndexedDB for larger datasets or complex querying needs.

2. **Security Considerations**: Never store sensitive information (like passwords or tokens) in client-side storage.

3. **Error Handling**: Always handle potential errors, especially with IndexedDB operations which can fail due to various reasons (e.g., quota exceeded, no database access).

4. **Performance**: For large datasets, prefer IndexedDB over Local/Session Storage for better performance.

5. **Versioning**: When using IndexedDB, implement a versioning system for your database schema to handle upgrades gracefully.

6. **Clearing Data**: Provide users with options to clear their stored data, respecting privacy concerns.

By leveraging FX's storage integration features, you can easily manage client-side data persistence in your web applications, enhancing user experience and enabling offline capabilities.