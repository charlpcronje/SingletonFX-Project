# FX Core

FX is a framework for building web applications. It attempts to provide a simple sync-like syntax for building web applications.

## The basics
FX started where I just wanted a simple way to keep track of all data I need to use in different places. For the basics like below, there is nothing else needed So at it's most basic you can set data like this:

### Using the `data` method
The first argument is the key of the data, the second is the data itself.
```js
const data = fx.data('user',{
    name: 'John',
    age: 30
});
```
### Using the `set` method
The `set` method is used to set the data. It is used to set the data with default values. Under the hood the data method is using the `set` method.
```js
fx.set('user',user,{
    // default values
    name: "default name",
    age: 30 
});
```

### Using the dynamic properties of `fx`
This does exactly the same as the `data` method, but it is a bit more convenient to use.
```js
fx.user.name = 'John';
fx.user.age = 30;
```

## Accessing the data
No matter where you set the data, you can access it from anywhere where fx is imported.

### Using the `data` method
If only the key is provided, the whole data is returned.
```js
console.log(fx.data('user.name'));   // John
```

### Using the `get` method
If only the key is provided, the whole data is returned.
```js
console.log(fx.get('user.name',"Default name"));   // John
// or
console.log(fx.get('user').name);   // John
// or
console.log(fx.user.name);   // John
```

## Storing functions in the data and using them
In some cases you might want to store functions in the data. You can do this by using the same methods as before.

```js
fx.set('user',{
    name: 'John',
    age: 30,
    sayHello: function() {
        console.log('Hello, my name is ' + this.name);
    }
});

// or maybe you want to use the same calculations for getting the discount for a product
fx.set('product',{
    discount: function(price) {
        return price * 0.1;
    }
});

// and then you can use the function like this
console.log(fx.product.discount(100));   // 10

fx.product = {
    price: 100,
    discount: function() {
        return this.price * 0.1;
    }
});

console.log(fx.product.discount());   // 10
```