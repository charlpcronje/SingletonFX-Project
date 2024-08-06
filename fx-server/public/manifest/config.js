/**
 * @file ./manifest/config.js
 * @description Config
 */
export default {
    '/api/env/:key': {
        handler: 'envHandler.getEnv',
        methods: ['GET']
    },
    '/config': {
        handler: {
            type: 'yaml',
            file: './config/app.yml'
        }
    }
}