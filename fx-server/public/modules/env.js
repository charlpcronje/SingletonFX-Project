// modules/env.js
import fx from '../fx.js';
import path from 'path';

export function handleRequest(req, res) {
    const key = path.basename(req.url);
    const value = process.env[key];

    if (value !== undefined) {
        fx.response.sendJson(res, 200, { [key]: value });
    } else {
        fx.response.sendError(res, 404, 'Environment variable not found');
    }
}

export default { handleRequest };