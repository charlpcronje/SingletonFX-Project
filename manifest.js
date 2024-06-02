// **manifest.js**
export const manifest = {
    user: {
        path: 'modules/user.js',
        type: 'instance',
        mainExport: 'User',
    },
    product: {
        path: 'modules/product.js',
        type: 'class',
        mainExport: 'Product',
    },
    utils: {
        path: 'modules/utils.js',
        type: 'function',
        mainExport: 'calculateTotal',
    },
    multipleExports: {
        path: 'modules/multipleExports.js',
        type: 'instance',
        mainExport: 'Order',
        additionalExports: {
            cancelOrder: 'cancelOrder'
        }
    },
};