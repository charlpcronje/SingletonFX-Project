/**
 * @file ./fx/resources.js
 * @description Resources
 */

/**
 * @constant {boolean} isBrowser
 * @description Determines if the current environment is a browser
 */
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * @class Resource
 * @description Base class for all resources
 */
export class Resource {
    /**
     * @constructor
     * @param {Object} config - Configuration for the resource
     * @param {ExecutionContext} context - The execution context
     */
    constructor(config, context) {
        this.config = config;
        this.context = context;
    }

    /**
     * @method load
     * @description Load the resource
     * @returns {Promise<any>} The loaded resource
     */
    async load() {
        throw new Error('Load method must be implemented by subclass');
    }
}

/**
 * @function createResourceFactory
 * @description Factory function to create the appropriate resource based on type and environment
 * @param {string} type - The type of resource to create
 * @returns {Promise<typeof Resource>} A promise that resolves to the resource class
 */
export function createResourceFactory() {
    return async function resourceFactory(type) {
        let ResourceClass;
        switch (type) {
            case 'string':
            case 'number':
            case 'boolean':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/PrimitiveResource.js')).default 
                    : (await import('./serverResources/PrimitiveResource.js')).default;
                break;
            case 'array':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/ArrayResource.js')).default 
                    : (await import('./serverResources/ArrayResource.js')).default;
                break;
            case null:
            case undefined:
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/EmptyResource.js')).default 
                    : (await import('./serverResources/EmptyResource.js')).default;
                break;
            case 'api':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/APIResource.js')).default 
                    : (await import('./serverResources/APIResource.js')).default;
                break;
            case 'css':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/CSSResource.js')).default 
                    : (await import('./serverResources/CSSResource.js')).default;
                break;
            case 'html':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/HTMLResource.js')).default 
                    : (await import('./serverResources/HTMLResource.js')).default;
                break;
            case 'module':
            case 'class':
            case 'instance':
            case 'function':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/ModuleResource.js')).default 
                    : (await import('./serverResources/ModuleResource.js')).default;
                break;
            case 'json':
            case 'xml':
            case 'yml':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/DataResource.js')).default 
                    : (await import('./serverResources/DataResource.js')).default;
                break;
            case 'raw':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/RawResource.js')).default 
                    : (await import('./serverResources/RawResource.js')).default;
                break;
            case 'static':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/StaticResource.js')).default 
                    : (await import('./serverResources/StaticResource.js')).default;
                break;
            case 'markdown':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/MarkdownResource.js')).default 
                    : (await import('./serverResources/MarkdownResource.js')).default;
                break;
            case 'image':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/ImageResource.js')).default 
                    : (await import('./serverResources/ImageResource.js')).default;
                break;
            case 'stream':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/StreamResource.js')).default 
                    : (await import('./serverResources/StreamResource.js')).default;
                break;
            case 'route':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/RouteResource.js')).default 
                    : (await import('./serverResources/RouteResource.js')).default;
                break;
            case 'component':
                ResourceClass = isBrowser 
                    ? (await import('./clientResources/ComponentResource.js')).default 
                    : (await import('./serverResources/ComponentResource.js')).default;
                break;
            default:
                console.error(`Unknown resource type: ${type}`);
                return null;
        }

        return ResourceClass;
    };
}