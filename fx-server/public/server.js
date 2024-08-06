/**
 * @file ./server.js
 * @description Server
 */

import fx from './fx.js';
import http from 'http';
import url from 'url';
import createManifest from './manifest.js';

async function startServer() {
    try {
        // Load the manifest
        const manifest = createManifest(fx);
        await fx.loadManifest(manifest);

        // Create the server
        const server = http.createServer((req, res) => {
            // Apply CORS headers
            if (fx.cors && typeof fx.cors.applyHeaders === 'function') {
                fx.cors.applyHeaders(res);
            } else {
                console.warn('fx.cors.applyHeaders is not available');
            }

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            const pathname = url.parse(req.url).pathname;

            // Route the request
            if (fx.router && typeof fx.router.route === 'function') {
                fx.router.route(pathname, req, res).catch(error => {
                    console.error('Error handling request:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                });
            } else {
                console.error('fx.router.route is not available');
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Router not configured' }));
            }
        });

        // Start the server
        const PORT = process.env.PORT || 4250;
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();