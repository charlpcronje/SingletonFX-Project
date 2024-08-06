# Module types examples

```js
// myModule.js

// Module
export const myModule = {
  name: 'My Module',
  version: '1.0.0',
};

// Class
export class MyClass {
  constructor(name) {
    this.name = name;
  }
}

// Instance
const myInstance = new MyClass('Instance');
export { myInstance };

// Function
export function myFunction() {
  return 'Hello, World!';
}

// Object
export const myObject = {
  key: 'value',
};

// String
export const myString = 'Hello, World!';

// Number
export const myNumber = 42;

// Boolean
export const myBoolean = true;

// Array
export const myArray = [1, 2, 3];

// Var (though `let` or `const` is recommended)
export var myVar = 'This is a var';

// Set
export const mySet = new Set([1, 2, 3]);

// Map
export const myMap = new Map([['key', 'value']]);

// Symbol
export const mySymbol = Symbol('mySymbol');

// Constant
export const MY_CONSTANT = 'I am a constant';

// Let
export let myLet = 'I am a let variable';

// BigInt
export const myBigInt = BigInt(1234567890123456789012345678901234567890);

// Undefined
export const myUndefined = undefined;

// Null
export const myNull = null;

// Date
export const myDate = new Date();

// RegExp
export const myRegExp = /abc/;

// Error
export const myError = new Error('Something went wrong');

// Promise
export const myPromise = new Promise((resolve, reject) => {
  resolve('Resolved');
});

// Generator Function
export function* myGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

// Async Function
export async function myAsyncFunction() {
  return 'Async Result';
}

// Iterator
export const myIterator = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
    yield 3;
  },
};

// WeakMap
export const myWeakMap = new WeakMap();

// WeakSet
export const myWeakSet = new WeakSet();

// Typed Array
export const myTypedArray = new Uint8Array([1, 2, 3]);

// Proxy
export const myProxy = new Proxy({}, {
  get: (target, prop) => {
    return `Property ${prop} does not exist`;
  }
});

// Reflect
export const myReflect = Reflect;
```