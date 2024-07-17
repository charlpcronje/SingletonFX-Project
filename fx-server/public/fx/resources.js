// fx/resources.js

export class Resource {
    constructor(config, context) {
        this.config = config;
        this.context = context;
        this.loaded = false;
        this.value = null;
    }

    load() {
        if (!this.loaded) {
            this.value = this.context.await(this._doLoad());
            this.loaded = true;
        }
        return this.value;
    }

    async _doLoad() {
        throw new Error('_doLoad must be implemented by subclass');
    }
}

export class DataResource extends Resource {
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
            console.log('YAML parsing not implemented');
            return text;
        } else {
            throw new Error(`Unsupported data type: ${contentType}`);
        }
    }
}

export class RawResource extends Resource {
    async _doLoad() {
        const response = await fetch(this.config.path);
        return response.text();
    }
}

// Dynamically import the correct environment-specific resources
const envSpecificResources = process.env.NODE_ENV === 'server'
    ? require('./serverResources')
    : require('./clientResources');

// Export all resources
export const {
    APIResource,
    CSSResource,
    HTMLResource,
    ModuleResource,
    StaticResource,
    MarkdownResource,
    ImageResource,
    StreamResource,
    RouteResource
} = envSpecificResources;