# FX Singleton

This project demonstrates the use of a singleton pattern for dynamically loading and managing JavaScript modules using the `FX` script. The `FX` class is designed to handle dynamic module loading, module caching with IndexedDB, cache invalidation, and dynamic property setting and getting using dot notation. Additionally, it supports accessing environment variables, local storage data, and IndexedDB data. The project includes several example modules to illustrate different use cases, including class instances, static classes, functions, and dynamic property management.

## Features

1. **Singleton Pattern**: Ensures only one instance of the `FX` class is created and reused throughout the application.
2. **Dynamic Module Loading**: Modules are loaded on demand using a manifest that specifies their paths and types.
3. **Module Caching with local storage**: Modules are cached in local storage to reduce network requests and improve performance.
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
├── fx-server.js
├── fx.js
├── index.html
├── main.js
├── manifest.js
├── package.json
├── server.js
├── components/
│   ├── fx-counter.html
│   └── fx-layout.html
├── data/
│   ├── localization.json
├── fx/
│   ├── clientResources.js
│   ├── fx-component-system.js
│   ├── resources.js
│   └── serverResources.js
├── manifest/
│   ├── assets.js
│   ├── commns.js
│   ├── data.js
│   ├── modules.js
│   ├── routes.js
│   ├── tools.js
│   └── views.js
├── modules/
│   ├── console.js
│   ├── counter.js
│   ├── dynamic-module.js
│   ├── env.js
│   ├── help.js
│   ├── html.js
│   ├── lazy-loaded-module.js
│   ├── log.js
│   ├── multipleExports.js
│   ├── product.js
│   ├── response.js
│   ├── smartRouter.js
│   ├── user.js
│   └── utils.js
├── styles/
|   ├── main.css
|   └── secondary.css
└── views/
    ├── product-card.html
    ├── user-card.html
    └── user-profile.html
```


```js
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
// Or
console.log(fx.greeting); // Outputs: "Hello, world!"

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
Here is one of the examples of the how main.js can look for using FX in the browser.

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



### Conclusion

This project demonstrates a dynamic module loading system using a singleton pattern, with efficient caching and invalidation mechanisms. The `FX` class now supports dynamic properties, various data types, and detailed logging. The provided scripts help in setting up and managing the project structure. The `FX` class is a versatile and powerful tool for dynamically managing and accessing various types of data, including values, JSON objects, functions, classes, modules, and more. It supports dynamic properties, allows seamless integration with external APIs, and can interact with environment variables, local storage, and IndexedDB. The provided examples demonstrate the wide range of possible use cases, making `FX` a highly flexible and useful component in any JavaScript project.