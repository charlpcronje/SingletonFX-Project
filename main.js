// File: main.js

import fx from './fx.js';

// Accessing the 'user' property triggers dynamic module loading
fx.user.addUser('Alice'); // Assuming the user module has an addUser method
console.log(fx.user.getUsers()); // Assuming the user module has a getUsers method