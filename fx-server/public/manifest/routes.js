/**
 * @file ./manifest/routes.js
 * @description Routes
 */
export default {
    route: {
        "path": "./modules/smartRouter.js",
        "type": "function",
        "mainExport": "route"
    },
    '/': (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Welcome to FX Server!');
    },
    '/api/hello': (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hello from FX API!' }));
    }
}
