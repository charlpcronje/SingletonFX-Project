export class Utils {
    static calculateTotal(price, quantity) {
        return price * quantity;
    }

    static formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }
}