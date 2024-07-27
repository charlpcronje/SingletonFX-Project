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
        // Initialize fx with the manifest
        await fx.initialize(createManifest);

        // Create the server
        const server = http.createServer((req, res) => {
            // Apply CORS headers
            fx.cors.applyHeaders(res);

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            const pathname = url.parse(req.url).pathname;

            // Route the request
            fx.router.route(pathname, req, res).catch(error => {
                console.error('Error handling request:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            });
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