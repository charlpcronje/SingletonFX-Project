/**
 * @file ./fx/clientResources.js
 * @description Client-side resources
 */
import { Resource } from './resources.js';

/**
 * @class APIResource
 * @extends Resource
 * @description Resource class for client-side API handling
 */
export class APIResource extends Resource {
    
    /**
     * @constructor
     * @param {Object} config - The configuration for the API
     * @param {FX} fx - The FX instance
     */
    constructor(config, fx) {
        super(config, fx.context);
        this.fx = fx;
        this.baseUrl = config.baseUrl;
        this.methods = config.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        this.logCount = 0;

        this.methods.forEach(method => {
            this[method.toLowerCase()] = this.createMethod(method);
        });
    }

    /**
     * @method log
     * @description Log a message to the console
     * @param {any} message - The message to log
     */
    log(message) {
        console.log(`${++this.logCount},`,"APIResource:",{message});
    }

    /**
     * @method createMethod
     * @description Create a method for the API
     * @param {string} method - The method to create
     * @returns {Function} The created method
     */
    createMethod(method) {
        return (endpoint, options = {}) => {
            this.log(`Creating ${method} method for ${endpoint}`);
            this.log(`Calling API method: ${method.toUpperCase()} ${this.baseUrl}${endpoint}`);
            const fetchPromise = fetch(`${this.baseUrl}${endpoint}`, {
                    method: method.toUpperCase(),
                    ...options,
                    headers: {
                        ...this.config.headers,
                        ...options.headers
                    }
                })
                .then(response => {
                    this.log(`Received response for ${method} ${endpoint}`);
                    if (!response.ok) {
                        throw new Error(`API call failed: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.log(`Parsed JSON data for ${method} ${endpoint}`);
                    return data;
                })
                .catch(error => {
                    this.log(`Error in ${method} ${endpoint}: ${error.message}`);
                    throw error;
                });

            this.log(`Awaiting fetch promise for ${method} ${endpoint}`);
            return this.fx.context.await(fetchPromise);
        };
    }
}

/**
 * @class CSSResource
 * @extends Resource
 * @description Resource class for client-side CSS handling
 */
export class CSSResource extends Resource {
    async _doLoad() {
        const response = await fetch(this.config.path);
        let css = await response.text();

        if (this.config.transformations) {
            css = await this.applyTransformations(css, this.config.transformations);
        }

        if (this.config.scope && this.config.scope !== 'global') {
            css = this.scopeCSS(css, this.config.scope);
        }

        const style = document.createElement('style');
        style.textContent = css;
        if (this.config.media) {
            style.media = this.config.media;
        }
        document.head.appendChild(style);

        return {
            getCSS: () => css,
            setScope: (newScope) => {
                css = this.scopeCSS(css, newScope);
                style.textContent = css;
            },
            remove: () => {
                document.head.removeChild(style);
            }
        };
    }

    /**
     * @method applyTransformations
     * @description Apply transformations to the CSS
     * @param {string} css - The CSS to transform
     * @param {Array} transformations - The transformations to apply
     * @returns {Promise<string>} The transformed CSS
     */
    async applyTransformations(css, transformations) {
        for (const transformation of transformations) {
            css = await transformation(css);
        }
        return css;
    }

    /**
     * @method applyAutoprefixer
     * @description Apply autoprefixer to the CSS
     * @param {string} css - The CSS to autoprefix
     * @returns {Promise<string>} The autoprefixed CSS
     */
    async applyAutoprefixer(css) {
        // Simplified autoprefixer: add vendor prefixes for a few common properties
        const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
        const properties = ['transform', 'transition', 'box-shadow', 'user-select'];

        properties.forEach(property => {
            const regex = new RegExp(`(^|\\s)(${property}:)`, 'g');
            css = css.replace(regex, (match, p1, p2) => {
                return p1 + prefixes.map(prefix => `${prefix}${p2}`).join(' ') + p2;
            });
        });

        return css;
    }

    /**
     * @method minifyCSS
     * @description Minify the CSS
     * @param {string} css - The CSS to minify
     * @returns {Promise<string>} The minified CSS
     */
    async minifyCSS(css) {
        // Simplified minification: remove comments and whitespace
        return css.replace(/\/\*[\s\S]*?\*\/|[\n\r]/g, '').replace(/\s{2,}/g, ' ').trim();
    }

    /**
     * @method scopeCSS
     * @description Scope the CSS
     * @param {string} css - The CSS to scope
     * @param {string} scope - The scope to apply
     * @returns {string} The scoped CSS
     */
    scopeCSS(css, scope) {
        // Simplified scoping: prepend the scope to each selector
        const scopedCSS = css.replace(/(^|\s)([a-zA-Z0-9_-]+)/g, `$1${scope} $2`);
        return scopedCSS;
    }
}



/**
 * @class HTMLResource
 * @extends Resource
 * @description Resource class for HTML templates
 */
class HTMLResource extends Resource {
    /**
     * @method _doLoad
     * @description Load an HTML file and provide a query function
     * @returns {Promise<Function>} A function to query the loaded HTML
     */
    async _doLoad() {
        const response = await fetch(this.config.path);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return (selector) => {
            if (!selector) return html;
            const elements = doc.querySelectorAll(selector);
            return elements.length === 1 ? elements[0] : Array.from(elements);
        };
    }
}

/**
 * @class ModuleResource
 * @extends Resource
 * @description Resource class for JavaScript modules
 */
class ModuleResource extends Resource {
    /**
     * @method _doLoad
     * @description Load a JavaScript module
     * @returns {Promise<any>} The loaded module or its main export
     */
    async _doLoad() {
        const module = await import(this.config.path);
        if (this.config.mainExport) {
            const exportedItem = module[this.config.mainExport];
            if (this.config.type === 'class') {
                return exportedItem;
            } else if (this.config.type === 'instance') {
                return new exportedItem();
            } else {
                return exportedItem;
            }
        }
        return module;
    }
}

/**
 * @class DataResource
 * @extends Resource
 * @description Resource class for data files (JSON, XML, YML)
 */
class DataResource extends Resource {
    /**
     * @method _doLoad
     * @description Load and parse a data file
     * @returns {Promise<Object>} The parsed data
     */
    async _doLoad() {
        const response = await fetch(this.config.path);
        const contentType = response.headers.get('content-type');
        if (contentType.includes('application/json')) {
            return response.json();
        } else if (contentType.includes('application/xml')) {
            const text = await response.text();
            return new DOMParser().parseFromString(text, 'text/xml');
        } else if (contentType.includes('application/x-yaml')) {
            const text = await response.text();
            // In a real implementation, you would use a YAML parsing library
            console.log('YAML parsing not implemented');
            return text;
        } else {
            throw new Error(`Unsupported data type: ${contentType}`);
        }
    }
}

/**
 * @class RawResource
 * @extends Resource
 * @description Resource class for raw text files
 */
class RawResource extends Resource {
    /**
     * @method _doLoad
     * @description Load a raw text file
     * @returns {Promise<string>} The raw file content
     */
    async _doLoad() {
        const response = await fetch(this.config.path);
        return response.text();
    }
}

// Client-side versions of StaticResource, MarkdownResource, ImageResource, StreamResource, and RouteResource
// These might have different implementations or be stubs if not applicable on the client side

/**
 * @class StaticResource
 * @extends Resource
 * @description Resource class for static files (client-side stub)
 */
export class StaticResource extends Resource {
    async _doLoad() {
        console.log(`Static Resource requested: ${this.config.path}`);
        return this.config.path;
    }
}

/**
 * @class MarkdownResource
 * @extends Resource
 * @description Resource class for Markdown files (client-side stub)
 */
export class MarkdownResource extends Resource {
    async _doLoad() {
        console.log(`Markdown Resource requested: ${this.config.path}`);
        return this.config.path;
    }
}

/**
 * @class ImageResource
 * @extends Resource
 * @description Resource class for image files
 */
export class ImageResource extends Resource {
    _doLoad() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = this.config.path;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }
}

/**
 * @class StreamResource
 * @extends Resource
 * @description Resource class for streaming files (client-side stub)
 */
export class StreamResource extends Resource {
    async _doLoad() {
        console.log(`Stream Resource requested: ${this.config.path}`);
        return this.config.path;
    }
}

/**
 * @class RouteResource
 * @extends Resource
 * @description Resource class for route files (client-side stub)
 */
export class RouteResource extends Resource {
    async _doLoad() {
        console.log(`Route Resource requested: ${this.config.path}`);
        return this.config.path;
    }
}