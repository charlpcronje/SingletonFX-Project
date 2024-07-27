/**
 * @file ./modules/counter.js
 * @description Counter Module
 */
export class Counter {
    constructor(initialValue = 0) {
        this.value = initialValue;
    }

    increment() {
        this.value++;
    }

    decrement() {
        this.value--;
    }

    getValue() {
        return this.value;
    }

    reset() {
        this.value = 0;
    }
}