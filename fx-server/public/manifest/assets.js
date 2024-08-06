/**
 * @file ./manifest/assets.js
 * @description Assets
 */
export default {
    '/styles/:name': {
        handler: {
            type: 'css',
            file: './assets/styles/main.css'
        }
    },
    '/logo': {
        handler: {
            type: 'image',
            file: './assets/images/logo.png'
        }
    },
}