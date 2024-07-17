# Smart Routing System

Improved version of the routing system:

```javascript
// manifest/routes.js
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
```

This enhanced routing system offers several improvements:

1. Flask-like simplicity: Routes are defined in a declarative way, similar to Flask's blueprints.
2. Method specification: Each route can specify which HTTP methods it supports.
3. Middleware support: Routes can define middleware to be applied.
4. Static file handling: Direct support for serving static files.
5. Various content types: Support for Markdown, CSS, JSON, YAML, XML, and images.
6. Flexible handler definition: Handlers can be specified as strings (module.method) or objects for special types.

Now, let's update the `smartRouter.js` to handle these enhanced routes:

```javascript
// modules/smartRouter.js
import fx from '../fx.js';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import markdown from 'markdown-it';

export function route(pathname, req, res) {
    const route = findRoute(pathname);
    if (route) {
        const params = extractParams(pathname, route.path);
        handleRoute(route, req, res, params);
    } else {
        fx.response.sendError(res, 404, 'Not Found');
    }
}

function findRoute(pathname) {
    for (const [path, handler] of Object.entries(fx.routes)) {
        if (matchPath(pathname, path)) {
            return { ...handler, path };
        }
    }
    return null;
}

function matchPath(pathname, routePath) {
    const pathnameSegments = pathname.split('/').filter(Boolean);
    const routeSegments = routePath.split('/').filter(Boolean);

    if (pathnameSegments.length !== routeSegments.length) return false;

    return routeSegments.every((segment, i) => {
        return segment.startsWith(':') || segment === pathnameSegments[i];
    });
}

function extractParams(pathname, routePath) {
    const params = {};
    const pathnameSegments = pathname.split('/').filter(Boolean);
    const routeSegments = routePath.split('/').filter(Boolean);

    routeSegments.forEach((segment, i) => {
        if (segment.startsWith(':')) {
            params[segment.slice(1)] = pathnameSegments[i];
        }
    });

    return params;
}

async function handleRoute(route, req, res, params) {
    if (route.methods && !route.methods.includes(req.method)) {
        return fx.response.sendError(res, 405, 'Method Not Allowed');
    }

    if (route.middleware) {
        for (const middlewareName of route.middleware) {
            const middleware = fx.middleware[middlewareName];
            if (middleware) {
                await middleware(req, res);
                if (res.writableEnded) return; // Response was sent by middleware
            }
        }
    }

    if (typeof route.handler === 'string') {
        const [module, method] = route.handler.split('.');
        fx[module][method](req, res, params);
    } else if (typeof route.handler === 'object') {
        switch (route.handler.type) {
            case 'static':
                serveStaticFile(route.handler.dir, params.filename, res);
                break;
            case 'markdown':
                serveMarkdownFile(route.handler.dir, params.page, res);
                break;
            case 'css':
                serveCssFile(route.handler.file, res);
                break;
            case 'json':
                serveJsonFile(route.handler.file, res);
                break;
            case 'yaml':
                serveYamlFile(route.handler.file, res);
                break;
            case 'xml':
                serveXmlFile(route.handler.file, res);
                break;
            case 'image':
                serveImageFile(route.handler.file, res);
                break;
            default:
                fx.response.sendError(res, 500, 'Invalid handler type');
        }
    }

    if (route.type === 'stream') {
        // Handle streaming response
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        req.on('close', () => {
            // Clean up stream resources if needed
        });
    }
}

function serveStaticFile(dir, filename, res) {
    const filePath = path.join(dir, filename);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            fx.response.sendError(res, 404, 'File not found');
        } else {
            const ext = path.extname(filePath);
            const contentType = getContentType(ext);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function serveMarkdownFile(dir, page, res) {
    const filePath = path.join(dir, `${page}.md`);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            fx.response.sendError(res, 404, 'Page not found');
        } else {
            const md = markdown();
            const html = md.render(data);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        }
    });
}

function serveCssFile(file, res) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            fx.response.sendError(res, 404, 'CSS file not found');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        }
    });
}

function serveJsonFile(file, res) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            fx.response.sendError(res, 404, 'JSON file not found');
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        }
    });
}

function serveYamlFile(file, res) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            fx.response.sendError(res, 404, 'YAML file not found');
        } else {
            const jsonData = yaml.load(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(jsonData));
        }
    });
}

function serveXmlFile(file, res) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            fx.response.sendError(res, 404, 'XML file not found');
        } else {
            res.writeHead(200, { 'Content-Type': 'application/xml' });
            res.end(data);
        }
    });
}

function serveImageFile(file, res) {
    fs.readFile(file, (err, data) => {
        if (err) {
            fx.response.sendError(res, 404, 'Image file not found');
        } else {
            const ext = path.extname(file);
            const contentType = getContentType(ext);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function getContentType(ext) {
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.xml': 'application/xml',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

export default { route };
```

This enhanced `smartRouter.js` now handles a wide variety of route types and content, making it much more flexible and powerful. It supports:

1. Traditional handler functions
2. Static file serving
3. Markdown rendering
4. CSS file serving
5. JSON file serving
6. YAML file serving (converted to JSON)
7. XML file serving
8. Image file serving
9. Middleware support
10. Method checking
11. Streaming responses

This approach combines the simplicity of Flask-like routing with the power and flexibility of Node.js, all while integrating seamlessly with the FX framework. It provides a robust foundation for building complex web applications with a clean, declarative routing structure.