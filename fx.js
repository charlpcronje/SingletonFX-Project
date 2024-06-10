class FX {
    constructor() {
        this.state = {};
        this.proxy = new Proxy(this.state, {
            get: (target, prop, receiver) => {
                if (!(prop in target)) {
                    return this.loadModule(prop).then(module => {
                        target[prop] = module;
                        return module;
                    }).catch(error => {
                        console.error(`Failed to load module ${prop}: ${error}`);
                        throw error;
                    });
                }
                return Reflect.get(target, prop, receiver);
            },
            set: (target, prop, value, receiver) => {
                target[prop] = value;
                return true;
            }
        });
    }

    async loadModule(moduleName) {
        const modules = {
            user: './modules/user.js' // Map module names to paths
        };

        if (!(moduleName in modules)) {
            throw new Error(`Module ${moduleName} not found`);
        }

        const modulePath = modules[moduleName];
        const module = await import(modulePath);
        return module.default; // Assuming default export
    }

    getInstance() {
        return this.proxy;
    }
}

const fx = new FX();
export default fx.getInstance();