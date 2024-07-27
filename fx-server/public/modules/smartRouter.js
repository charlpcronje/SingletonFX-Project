/**
 * @file ./modules/smartRouter.js
 * @description Smart Router
 */

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