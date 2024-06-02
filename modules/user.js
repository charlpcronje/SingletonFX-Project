// **modules/user.js**
export class User {
    constructor() {
        console.log('User instance created');
    }

    addUser(name) {
        console.log(`User ${name} added.`);
    }
}