import {
    fx
} from './fx.js';

// Usage for User (instance)
fx.user.addUser('John Doe');

// Usage for Product (class)
fx.product.createProduct('Laptop');

// Usage for Utils (function)
fx.utils.calculateTotal(100, 2);

// Usage for Multiple Exports (instance and additional functions)
fx.multipleExports.placeOrder('Book', 3);
fx.multipleExports.cancelOrder('12345');