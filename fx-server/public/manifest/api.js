/**
 * @file ./manifest/api.js
 * @description API
 */
export default {
    '/rss': {
        handler: {
            type: 'xml',
            file: './data/feed.xml'
        }
    },
    '/api/data/:type': {
        handler: 'dataHandler.getData',
        methods: ['GET', 'POST']
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
}