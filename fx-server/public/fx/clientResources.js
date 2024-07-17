// fx/clientResources.js
import { Resource } from './resources';

export class APIResource extends Resource {
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

    log(message) {
        console.log(`${++this.logCount}. APIResource: ${message}`);
    }

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

    // ... (other methods like applyTransformations, applyAutoprefixer, minifyCSS, scopeCSS)
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


export class HTMLResource extends Resource {
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

export class ModuleResource extends Resource {
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

// Client-side versions of StaticResource, MarkdownResource, ImageResource, StreamResource, and RouteResource
// These might have different implementations or be stubs if not applicable on the client side

export class StaticResource extends Resource {
    // Client-side implementation or stub
}

export class MarkdownResource extends Resource {
    // Client-side implementation or stub
}

export class ImageResource extends Resource {
    // Client-side implementation or stub
}

export class StreamResource extends Resource {
    // Client-side implementation or stub
}

export class RouteResource extends Resource {
    // Client-side implementation or stub
}