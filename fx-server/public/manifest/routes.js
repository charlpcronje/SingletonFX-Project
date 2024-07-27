/**
 * @file ./manifest/routes.js
 * @description Routes
 */
export default {
    '/api/env/:key': {
        handler: 'envHandler.getEnv',
        methods: ['GET']
    },
    '/api/data/:type': {
        handler: 'dataHandler.getData',
        methods: ['GET', 'POST']
    },
    '/components/:name': {
        handler: 'componentHandler.renderComponent',
        methods: ['GET']
    },
    '/static/:filename': {
        handler: {
            type: 'static',
            dir: './public'
        }
    },
    '/docs/:page': {
        handler: {
            type: 'markdown',
            dir: './content'
        }
    },
    '/styles/:name': {
        handler: {
            type: 'css',
            file: './assets/styles/main.css'
        }
    },
    '/data/users': {
        handler: {
            type: 'json',
            file: './data/users.json'
        }
    },
    '/config': {
        handler: {
            type: 'yaml',
            file: './config/app.yml'
        }
    },
    '/rss': {
        handler: {
            type: 'xml',
            file: './data/feed.xml'
        }
    },
    '/logo': {
        handler: {
            type: 'image',
            file: './assets/images/logo.png'
        }
    },
    '/api/ai/complete': {
        handler: 'aiHandler.textCompletion',
        methods: ['POST'],
        middleware: ['apiAuth', 'rateLimit']
    },
    '/api/log': {
        handler: 'logHandler.createLog',
        methods: ['POST'],
        middleware: ['bodyParser', 'apiAuth']
    },
    '/api/metrics': {
        handler: 'metricsHandler.getMetrics',
        methods: ['GET'],
        middleware: ['cache']
    },
    '/api/webhook': {
        handler: 'webhookHandler.process',
        methods: ['POST'],
        middleware: ['verifySignature']
    },
    '/api/stream': {
        handler: 'streamHandler.streamData',
        methods: ['GET'],
        type: 'stream'
    }
};