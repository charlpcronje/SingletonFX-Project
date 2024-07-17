// modules/html.js
import fx from '../fx.js';
import url from 'url';
import path from 'path';
import fs from 'fs';

export function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const file = path.basename(parsedUrl.pathname, '.html');
    const selector = parsedUrl.query.selector;

    try {
        const html = getHtmlElement(`${file}.html`, selector);
        fx.response.sendHtml(res, 200, html);
    } catch (error) {
        fx.response.sendError(res, 404, 'HTML element not found');
    }
}

function getHtmlElement(filePath, selector) {
    const fullPath = path.join(process.cwd(), 'views', filePath);
    const html = fs.readFileSync(fullPath, 'utf8');
    return extractElements(html, selector);
}

function extractElements(html, selector) {
    const regex = selectorToRegex(selector);
    const matches = html.match(regex);
    return matches ? matches.join('\n') : '';
}

function selectorToRegex(selector) {
    if (selector.startsWith('#')) {
        return new RegExp(`<[^>]+id=["']${selector.slice(1)}["'][^>]*>.*?<\/[^>]+>`, 'gs');
    } else if (selector.startsWith('.')) {
        return new RegExp(`<[^>]+class=["'][^"']*${selector.slice(1)}[^"']*["'][^>]*>.*?<\/[^>]+>`, 'gs');
    } else {
        return new RegExp(`<${selector}[^>]*>.*?<\/${selector}>`, 'gs');
    }
}

export default { handleRequest };