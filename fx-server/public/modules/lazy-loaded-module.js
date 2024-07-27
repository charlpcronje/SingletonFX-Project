/**
 * @file ./modules/lazy-loaded-module.js
 * @description Lazy Loaded Module
 */
export class LazyLoadedModule {
    static getData() {
        return {
            message: "This module was lazy loaded!"
        };
    }
}