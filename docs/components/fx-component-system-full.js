/**
 * @file fx-component-system.js
 * @description Complete implementation of the FX component system
 */

import fx from '../fx.js';

class ComponentRegistry {
    constructor() {
        this.components = new Map();
        this.states = new Map();
    }

    registerComponent(name, componentClass) {
        this.components.set(name, componentClass);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    getState(stateId) {
        if (!this.states.has(stateId)) {
            this.states.set(stateId, { data: {}, listeners: new Set() });
        }
        return this.states.get(stateId).data;
    }

    setState(stateId, newState) {
        const state = this.getState(stateId);
        Object.assign(state, newState);
        this.notifyStateListeners(stateId);
    }

    addStateListener(stateId, component) {
        const state = this.states.get(stateId) || { data: {}, listeners: new Set() };
        state.listeners.add(component);
        this.states.set(stateId, state);
    }

    removeStateListener(stateId, component) {
        const state = this.states.get(stateId);
        if (state && state.listeners) {
            state.listeners.delete(component);
        }
    }

    notifyStateListeners(stateId) {
        const state = this.states.get(stateId);
        if (state && state.listeners) {
            state.listeners.forEach(component => component.render());
        }
    }
}

const registry = new ComponentRegistry();

class FXBaseComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {};
        this._stateId = 'global';
    }

    connectedCallback() {
        this._stateId = this.getAttribute('state') || 'global';
        this.initializeState();
        registry.addStateListener(this._stateId, this);
        this.render();
        if (this.onMount) {
            this.onMount();
        }
    }

    disconnectedCallback() {
        registry.removeStateListener(this._stateId, this);
        if (this.onDestroy) {
            this.onDestroy();
        }
    }

    initializeState() {
        this.state = { ...registry.getState(this._stateId) };
    }

    setState(newState) {
        const oldState = { ...this.state };
        Object.assign(this.state, newState);
        registry.setState(this._stateId, newState);
        if (this.onUpdate) {
            this.onUpdate(oldState, this.state);
        }
    }

    render() {
        // To be implemented by subclasses
    }
}

class ComponentLoader {
    constructor() {
        this.loadedComponents = new Map();
        this.pendingLoads = new Map();
    }

    async loadComponent(name) {
        if (this.loadedComponents.has(name)) {
            return Promise.resolve();
        }

        if (this.pendingLoads.has(name)) {
            return this.pendingLoads.get(name);
        }

        const loadPromise = fx.load({ type: 'raw', path: `/components/${name}.html` })
            .then(content => this.registerComponent(name, content))
            .catch(error => {
                console.error(`Failed to load component ${name}:`, error);
                throw error;
            });

        this.pendingLoads.set(name, loadPromise);

        return loadPromise;
    }

    async registerComponent(name, content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const componentElement = doc.querySelector('component');

        if (!componentElement) {
            throw new Error(`Invalid component definition for ${name}`);
        }

        const tag = componentElement.getAttribute('tag') || name;
        const template = componentElement.querySelector('template');
        const dataElement = componentElement.querySelector('data');
        const dataDefinition = dataElement ? JSON.parse(dataElement.textContent) : {};
        const script = componentElement.querySelector('script').textContent;
        const styles = await this.processStyles(componentElement);

        const ComponentClass = this.createComponentClass(name, dataDefinition, template, script, styles);

        registry.registerComponent(name, ComponentClass);
        customElements.define(tag, ComponentClass);

        this.loadedComponents.set(name, true);
        this.pendingLoads.delete(name);
    }

    async processStyles(componentElement) {
        const template = componentElement.querySelector('template');
        const styleTag = componentElement.querySelector('style');
        let styles = '';

        if (template.hasAttribute('style')) {
            const styleUrls = template.getAttribute('style').split(';');
            for (const url of styleUrls) {
                styles += await fx.load({ type: 'css', path: url.trim() });
            }
        }

        if (styleTag) {
            if (styleTag.hasAttribute('src')) {
                const styleUrls = styleTag.getAttribute('src').split(';');
                for (const url of styleUrls) {
                    styles += await fx.load({ type: 'css', path: url.trim() });
                }
            }
            styles += styleTag.textContent;
        }

        return styles;
    }

    createComponentClass(name, dataDefinition, template, script, styles) {
        return class extends FXBaseComponent {
            constructor() {
                super();
                this.data = JSON.parse(JSON.stringify(dataDefinition));

                const classMatch = script.match(/class\s*{([\s\S]*)}/);
                if (classMatch) {
                    const classBody = classMatch[1];
                    const ComponentImplementation = new Function(`return class extends FXBaseComponent {${classBody}}`)();
                    Object.assign(this, new ComponentImplementation());
                }

                if (this.onCreate) {
                    this.onCreate();
                }
            }

            render() {
                const styleElement = document.createElement('style');
                styleElement.textContent = styles;

                const scope = template.getAttribute('scope') || ':host';
                styleElement.textContent = `${scope} { ${styleElement.textContent} }`;

                const renderedTemplate = template.innerHTML.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
                    return eval(`with (this) { ${p1.trim()} }`);
                });

                this.shadowRoot.innerHTML = '';
                this.shadowRoot.appendChild(styleElement);
                const templateElement = document.createElement('template');
                templateElement.innerHTML = renderedTemplate;
                this.shadowRoot.appendChild(templateElement.content.cloneNode(true));
            }
        };
    }
}

const componentLoader = new ComponentLoader();

fx.component = {
    load: (name) => componentLoader.loadComponent(name),
    get: (name) => registry.getComponent(name),
    getState: (stateId) => registry.getState(stateId),
    setState: (stateId, newState) => registry.setState(stateId, newState),
};

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName.includes('-')) {
                    componentLoader.loadComponent(node.tagName.toLowerCase());
                }
            });
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

console.log('FX Component System initialized');
