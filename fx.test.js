import {
    fx
} from './fx.js';
import {
    manifest
} from './manifest.js';

// Mock the fetch function
global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue(['user', 'product'])
});

// Mock the indexedDB object
global.indexedDB = {
    open: jest.fn().mockImplementation(() => ({
        result: {
            objectStoreNames: {
                contains: jest.fn()
            },
            createObjectStore: jest.fn()
        },
        onsuccess: jest.fn(),
        onerror: jest.fn()
    }))
};

describe('FX', () => {
    beforeEach(() => {
        // Reset mocks before each test
        fetch.mockClear();
        indexedDB.open.mockClear();
    });

    test('should create a singleton instance', () => {
        const instance1 = new FX();
        const instance2 = new FX();
        expect(instance1).toBe(instance2);
    });

    test('should initialize invalidation process', async () => {
        fetch.mockResolvedValueOnce({
            json: async () => ['user', 'product'],
        });
        await fx.initializeInvalidation();
        expect(fetch).toHaveBeenCalledWith('/path/to/generate_hashes.php');
        expect(indexedDB.open).toHaveBeenCalledWith('FXDB', 1);
    });

    test('should invalidate cache for specific modules', async () => {
        const moduleNames = ['user', 'product'];
        await fx.invalidateCache(moduleNames);
        expect(indexedDB.open).toHaveBeenCalledWith('FXDB', 1);
    });

    test('should lazy load a module', async () => {
        const user = await fx.user;
        expect(fetch).toHaveBeenCalledWith('modules/user.js');
        expect(user.addUser).toBeDefined();
    });

    test('should cache a module', async () => {
        await fx.user;
        fetch.mockClear();
        await fx.user;
        expect(fetch).not.toHaveBeenCalled();
    });

    test('should load and instantiate a module', async () => {
        const moduleName = 'user';
        const path = 'modules/user.js';
        const type = 'instance';
        const mainExport = 'User';
        const module = await fx.loadAndInstantiateModule(moduleName, path, type, mainExport);
        expect(module.User).toBeDefined();
    });

    test('should load script from network', async () => {
        const moduleName = 'user';
        const path = 'modules/user.js';
        fetch.mockResolvedValueOnce({
            ok: true,
            text: async () => 'export class User {}',
        });
        const module = await fx.loadScriptFromNetwork(moduleName, path);
        expect(fetch).toHaveBeenCalledWith(path);
        expect(module.User).toBeDefined();
    });

    test('should load script from cache', async () => {
        const scriptContent = 'export class User {}';
        const module = await fx.loadScriptFromCache(scriptContent);
        expect(module.User).toBeDefined();
    });

    test('should execute script', async () => {
        const scriptContent = 'export class User {}';
        const module = await fx.executeScript(scriptContent);
        expect(module.User).toBeDefined();
    });

    test('should cache script', async () => {
        const moduleName = 'user';
        const scriptContent = 'export class User {}';
        await fx.cacheScript(moduleName, scriptContent);
        expect(indexedDB.open).toHaveBeenCalledWith('FXDB', 1);
    });

    test('should get cached script', async () => {
        const moduleName = 'user';
        const scriptContent = 'export class User {}';
        await fx.cacheScript(moduleName, scriptContent);
        const cachedScript = await fx.getCachedScript(moduleName);
        expect(cachedScript).toBe(scriptContent);
    });

    test('should set and get values using dot notation', () => {
        fx.set('company.name', 'Tech Co.');
        expect(fx.get('company.name')).toBe('Tech Co.');
    });

    test('should handle async functions with data method', async () => {
        const mockUser = {
            id: 1,
            name: 'John'
        };
        fetch.mockResolvedValueOnce({
            json: async () => mockUser,
        });
        fx.data('getUser', async function(userId) {
            const response = await fetch(`user.json`);
            return response.json();
        });
        const user = await fx.getUser(1);
        expect(user).toEqual(mockUser);
    });
});