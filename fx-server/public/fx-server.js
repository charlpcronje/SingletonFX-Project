// fx-server.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cheerio = require('cheerio');

/**
 * @class FXServer
 * @description Server-side implementation of the FX library
 */
class FXServer {
    /**
     * @constructor
     * @param {Object} options - Configuration options for FXServer
     * @param {string} options.envPath - Path to the .env file
     */
    constructor(options = {}) {
        this.envPath = options.envPath || path.resolve(process.cwd(), '.env');
        this.env = this.loadEnv();
        this.fileCache = new Map();
        this.moduleTimestamps = new Map();
    }

    /**
     * @method loadEnv
     * @description Loads environment variables from .env file
     * @returns {Object} Environment variables
     */
    loadEnv() {
        if (fs.existsSync(this.envPath)) {
            return dotenv.parse(fs.readFileSync(this.envPath));
        }
        console.warn(`No .env file found at ${this.envPath}`);
        return {};
    }

    /**
     * @method getEnv
     * @description Retrieves an environment variable
     * @param {string} key - The environment variable key
     * @returns {string|undefined} The environment variable value or undefined if not found
     */
    getEnv(key) {
        return this.env[key] || process.env[key];
    }

    /**
     * @method getHtmlElement
     * @description Retrieves specific elements from an HTML file
     * @param {string} filePath - Path to the HTML file
     * @param {string} selector - CSS selector for the desired elements
     * @returns {string} The selected HTML elements as a string
     */
    getHtmlElement(filePath, selector) {
        const html = this.readFileWithCache(filePath);
        const $ = cheerio.load(html);
        return $(selector).toString();
    }

    /**
     * @method readFileWithCache
     * @description Reads a file from disk or cache, updating cache if necessary
     * @param {string} filePath - Path to the file
     * @returns {string} The file contents
     */
    readFileWithCache(filePath) {
        const stats = fs.statSync(filePath);
        const lastModified = stats.mtime.getTime();

        if (this.fileCache.has(filePath) && this.moduleTimestamps.get(filePath) === lastModified) {
            return this.fileCache.get(filePath);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        this.fileCache.set(filePath, content);
        this.moduleTimestamps.set(filePath, lastModified);

        return content;
    }

    /**
     * @method invalidateCache
     * @description Invalidates the cache for a specific file
     * @param {string} filePath - Path to the file
     */
    invalidateCache(filePath) {
        this.fileCache.delete(filePath);
        this.moduleTimestamps.delete(filePath);
    }
}

module.exports = FXServer;