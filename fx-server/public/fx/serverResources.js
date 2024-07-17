// fx/serverResources.js
import { Resource } from './resources';
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');
const marked = require('marked');

export class APIResource extends Resource {
    // Server-side API implementation
}

export class CSSResource extends Resource {
    // Server-side CSS handling
}

export class HTMLResource extends Resource {
    // Server-side HTML template handling
}

export class ModuleResource extends Resource {
    // Server-side module loading
}

export class StaticResource extends Resource {
    async _doLoad() {
        return {
            serve: async (req, res) => {
                const filePath = path.join(this.config.dir, req.params.filename);
                try {
                    const data = await fs.readFile(filePath);
                    const contentType = mime.lookup(filePath) || 'application/octet-stream';
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('File not found');
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal server error');
                    }
                }
            }
        };
    }
}

export class MarkdownResource extends Resource {
    async _doLoad() {
        return {
            serve: async (req, res) => {
                const filePath = path.join(this.config.dir, `${req.params.page}.md`);
                try {
                    const data = await fs.readFile(filePath, 'utf8');
                    const html = marked(data);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Markdown file not found');
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal server error');
                    }
                }
            }
        };
    }
}

export class ImageResource extends Resource {
    async _doLoad() {
        return {
            serve: async (req, res) => {
                const filePath = this.config.file;
                try {
                    const data = await fs.readFile(filePath);
                    const contentType = mime.lookup(filePath) || 'application/octet-stream';
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Image not found');
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal server error');
                    }
                }
            }
        };
    }
}

export class StreamResource extends Resource {
    async _doLoad() {
        return {
            stream: (req, res) => {
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                });

                const streamData = () => {
                    res.write(`data: ${JSON.stringify({ time: new Date() })}\n\n`);
                };

                const intervalId = setInterval(streamData, 1000);

                req.on('close', () => {
                    clearInterval(intervalId);
                });
            }
        };
    }
}

export class RouteResource extends Resource {
    async _doLoad() {
        const [moduleName, methodName] = this.config.handler.split('.');
        const module = await import(`./modules/${moduleName}.js`);
        const handler = module[methodName];

        return {
            handle: async (req, res) => {
                if (!this.config.methods.includes(req.method)) {
                    res.writeHead(405, { 'Content-Type': 'text/plain' });
                    res.end('Method Not Allowed');
                    return;
                }

                if (this.config.middleware) {
                    for (const middlewareName of this.config.middleware) {
                        const middleware = await import(`./middleware/${middlewareName}.js`);
                        await middleware.default(req, res);
                        if (res.writableEnded) return;
                    }
                }

                await handler(req, res);
            }
        };
    }
}