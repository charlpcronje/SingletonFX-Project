/**
 * @file ./fx/fx-component-system.js
 * @description Complete implementation of the FX component system
 */

import fx from '../fx.js';

class ComponentRegistry {
    /**
     * @constructor
     * @description Constructor for the component registry
     */
    constructor() {
        this.components = new Map();
        this.states = new Map();
    }

    /**
     * @method registerComponent
     * @description Register a component
     * @param {string} name - The name of the component
     * @param {function} componentClass - The component class
     */
    registerComponent(name, componentClass) {
        this.components.set(name, componentClass);
    }

    /**
     * @method getComponent
     * @description Get the component
     * @param {string} name - The name of the component
     * @returns {object} The component
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * @method getState
     * @description Get the state
     * @param {string} stateId - The state id
     * @returns {object} The state
     */
    getState(stateId) {
        if (!this.states.has(stateId)) {
            this.states.set(stateId, {
                data: {},
                listeners: new Set()
            });
        }
        return this.states.get(stateId).data;
    }

    /**
     * @method setState
     * @description Set the state
     * @param {string} stateId - The state id
     * @param {object} newState - The new state
     */
    setState(stateId, newState) {
        const state = this.getState(stateId);
        Object.assign(state, newState);
        this.notifyStateListeners(stateId);
    }

    /**
     * @method addStateListener
     * @description Add a state listener
     * @param {string} stateId - The state id
     * @param {object} component - The component
     */
    addStateListener(stateId, component) {
        const state = this.states.get(stateId) || {
            data: {},
            listeners: new Set()
        };
        state.listeners.add(component);
        this.states.set(stateId, state);
    }

    /**
     * @method removeStateListener
     * @description Remove a state listener
     * @param {string} stateId - The state id
     * @param {object} component - The component
     */
    removeStateListener(stateId, component) {
        const state = this.states.get(stateId);
        if (state && state.listeners) {
            state.listeners.delete(component);
        }
    }

    /**
     * @method notifyStateListeners
     * @description Notify the state listeners
     * @param {string} stateId - The state id
     */
    notifyStateListeners(stateId) {
        const state = this.states.get(stateId);
        if (state && state.listeners) {
            state.listeners.forEach(component => component.render());
        }
    }
}

const registry = new ComponentRegistry();

class FXBaseComponent extends HTMLElement {
    /**
     * @constructor
     * @description Constructor for the base component
     */
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
        this.state = {};
        this._stateId = 'global';
    }

    /**
     * @method connectedCallback
     * @description Called when the component is connected to the document
     */
    connectedCallback() {
        this._stateId = this.getAttribute('state') || 'global';
        this.initializeState();
        registry.addStateListener(this._stateId, this);
        this.render();
        if (this.onMount) {
            this.onMount();
        }
    }

    /**
     * @method disconnectedCallback
     * @description Called when the component is disconnected from the document
     */
    disconnectedCallback() {
        registry.removeStateListener(this._stateId, this);
        if (this.onDestroy) {
            this.onDestroy();
        }
    }

    /**
     * @method initializeState
     * @description Initialize the state
     */
    initializeState() {
        this.state = {
            ...registry.getState(this._stateId)
        };
    }

    /**
     * @method setState
     * @description Set the state
     * @param {object} newState - The new state
     */
    setState(newState) {
        const oldState = {
            ...this.state
        };
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
    /**
     * @constructor
     * @description Constructor for the component loader
     */
    constructor() {
        this.loadedComponents = new Map();
        this.pendingLoads = new Map();
    }

    /**
     * @method loadComponent
     * @description Load a component
     * @param {string} name - The name of the component
     * @returns {Promise<void>} The promise
     */
    async loadComponent(name) {
        if (this.loadedComponents.has(name)) {
            return Promise.resolve();
        }

        if (this.pendingLoads.has(name)) {
            return this.pendingLoads.get(name);
        }

        const loadPromise = fx.load({
                type: 'raw',
                path: `/components/${name}.html`
            })
            .then(content => this.registerComponent(name, content))
            .catch(error => {
                console.error(`Failed to load component ${name}:`, error);
                throw error;
            });

        this.pendingLoads.set(name, loadPromise);

        return loadPromise;
    }

    /**
     * @method registerComponent
     * @description Register a component
     * @param {string} name - The name of the component
     * @param {string} content - The content of the component
     */
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

    /**
     * @method processStyles
     * @description Process the styles
     * @param {object} componentElement - The component element
     * @returns {Promise<string>} The promise
     */
    async processStyles(componentElement) {
        const template = componentElement.querySelector('template');
        const styleTag = componentElement.querySelector('style');
        let styles = '';

        if (template.hasAttribute('style')) {
            const styleUrls = template.getAttribute('style').split(';');
            for (const url of styleUrls) {
                styles += await fx.load({
                    type: 'css',
                    path: url.trim()
                });
            }
        }

        if (styleTag) {
            if (styleTag.hasAttribute('src')) {
                const styleUrls = styleTag.getAttribute('src').split(';');
                for (const url of styleUrls) {
                    styles += await fx.load({
                        type: 'css',
                        path: url.trim()
                    });
                }
            }
            styles += styleTag.textContent;
        }

        return styles;
    }

    /**
     * @method createComponentClass
     * @description Create a component class
     * @param {string} name - The name of the component
     * @param {object} dataDefinition - The data definition
     * @param {object} template - The template
     * @param {string} script - The script
     * @param {string} styles - The styles
     * @returns {function} The component class
     */
    createComponentClass(name, dataDefinition, template, script, styles) {
        return class extends FXBaseComponent {
            /**
             * @constructor
             * @description Constructor for the component class
             */
            constructor() {
                super();
                this.data = JSON.parse(JSON.stringify(dataDefinition));

                // Wrap the class in a named function to avoid syntax errors
                const classContent = script.trim().replace(/^class\s*{/, '').replace(/}$/, '');
                const ComponentImplementation = new Function(`
                    return class ComponentImplementation extends FXBaseComponent {
                        ${classContent}
                    }
                `)();

                Object.assign(this, new ComponentImplementation());

                if (this.onCreate) {
                    this.onCreate();
                }
            }

            /**
             * @method render
             * @description Render the component
             */
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

/**
 * @method observer
 * @description Observer for the component system
 * @param {object} mutations - The mutations
 */
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

/**
 * @method observe
 * @description Observe the document
 */
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('FX Component System initialized');