/**
 * @file ./fx/serverResources.js
 * @description Server-side resources
 */
import { Resource } from './resources.js';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { marked } from 'marked';

/**
 * @class APIResource
 * @extends Resource
 * @description Resource class for server-side API handling
 */
export class APIResource extends Resource {
    async _doLoad() {
        // This is a placeholder. In a real implementation, you might set up
        // route handlers or API endpoints here.
        console.log(`API Resource loaded: ${this.config.path}`);
        return { path: this.config.path };
    }
}

/**
 * @class CSSResource
 * @extends Resource
 * @description Resource class for server-side CSS handling
 */
export class CSSResource extends Resource {
    async _doLoad() {
        try {
            const css = await fs.readFile(this.config.path, 'utf-8');
            return css;
        } catch (error) {
            console.error(`Error loading CSS: ${this.config.path}`, error);
            throw error;
        }
    }
}

/**
 * @class HTMLResource
 * @extends Resource
 * @description Resource class for server-side HTML handling
 */
export class HTMLResource extends Resource {
    /**
     * @method _doLoad
     * @description Load an HTML file and provide a function to query it
     * @returns {Promise<Function>} A function to query the loaded HTML
     */
    async _doLoad() {
        const fs = await import('fs/promises');
        const path = await import('path');
        const cheerio = await import('cheerio');

        const html = await fs.readFile(this.config.path, 'utf-8');
        const $ = cheerio.load(html);

        return (selector) => {
            if (!selector) return html;
            return $(selector).toString();
        };
    }

    /**
     * @method serve
     * @description Serve the HTML or a part of it based on the selector
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    async serve(req, res) {
        const queryFunction = await this.load();
        const selector = req.query.selector;
        const html = queryFunction(selector);

        res.setHeader('Content-Type', 'text/html');
        res.end(html);
    }
}


/**
 * @class ModuleResource
 * @extends Resource
 * @description Resource class for server-side module loading
 */
export class ModuleResource extends Resource {
    async _doLoad() {
        try {
            const module = await import(this.config.path);
            return module.default || module;
        } catch (error) {
            console.error(`Error loading module: ${this.config.path}`, error);
            throw error;
        }
    }
}

/**
 * @class StaticResource
 * @extends Resource
 * @description Resource class for server-side static file serving
 */
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

/**
 * @class MarkdownResource
 * @extends Resource
 * @description Resource class for server-side Markdown file serving
 */
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

/**
 * @class ImageResource
 * @extends Resource
 * @description Resource class for server-side image serving
 */
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

/**
 * @class StreamResource
 * @extends Resource
 * @description Resource class for server-side streaming data
 */
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

/**
 * @class RouteResource
 * @extends Resource
 * @description Resource class for server-side route handling
 */
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