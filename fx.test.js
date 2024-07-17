// fx.test.js
import fx from './fx.js';

describe('FX Class', () => {
    beforeEach(() => {
        // Reset FX instance before each test
        fx.dynamicProperties.clear();
        fx.resourceCache.clear();
    });

    test('manifest method adds entry correctly', () => {
        fx.manifest('test.resource', {
            type: 'module',
            path: '/test.js'
        });
        expect(fx.getManifestEntry('test.resource')).toEqual({
            type: 'module',
            path: '/test.js',
            defer: true
        });
    });

    test('set and get methods work correctly', () => {
        fx.set('test.key', 'test value');
        expect(fx.get('test.key')).toBe('test value');
    });

    test('data method works for both getting and setting', () => {
        fx.data('test.data', 42);
        expect(fx.data('test.data')).toBe(42);
    });

    test('handleStorageAccess works for localStorage', () => {
        fx.store.testItem = {
            key: 'value'
        };
        expect(fx.store.testItem).toEqual({
            key: 'value'
        });
    });

    test('handleEnvAccess returns environment variables', () => {
        process.env.TEST_VAR = 'test value';
        expect(fx.env.TEST_VAR).toBe('test value');
    });

    test('API resource loading', () => {
        fx.manifest('api.test', {
            type: 'api',
            baseUrl: 'https://api.example.com',
            methods: ['GET']
        });
        const result = fx.api.test.get('/users');
        // Note: This will actually trigger an asynchronous operation,
        // but it appears synchronous due to the ExecutionContext
        expect(result).toBeDefined();
    });

    test('CSS resource loading', () => {
        fx.manifest('styles.test', {
            type: 'css',
            path: '/test.css'
        });
        const styles = fx.styles.test;
        expect(styles.getCSS).toBeDefined();
        expect(styles.setScope).toBeDefined();
        expect(styles.remove).toBeDefined();
    });

    // Add more tests for other resource types...
});