/**
 * @file ./manifest/views.js
 * @description Views
 */
export default {
    '/docs/:page': {
        handler: {
            type: 'markdown',
            dir: './content'
        }
    }
}