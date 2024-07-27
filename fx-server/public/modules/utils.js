/**
 * @file ./modules/utils.js
 * @description Utils Module
 */

export class Utils {
    static calculateTotal(price, quantity) {
        return price * quantity;
    }

    static formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }
}