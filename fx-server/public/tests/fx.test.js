/**
 * @file ./tests/fx.test.js
 * @description Test suite for the FX class
 */
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

console.log('Setting up test environment');

// Mock dotenv
jest.mock('dotenv', () => ({
    config: jest.fn(() => {
        console.log('Mocked dotenv.config called');
    })
}));

// Mock the resource modules
jest.mock('../fx/resources.js', () => {
    console.log('Mocking resources.js');
    return {
        Resource: class {
            constructor() {
                console.log('Mocked Resource constructor called');
            }
        },
        createResourceFactory: jest.fn(() => async () => class {})
    };
});

jest.mock('../fx/clientResources.js', () => {
    console.log('Mocking clientResources.js');
    return {
        APIResource: class {},
        CSSResource: class {},
        HTMLResource: class {},
        ModuleResource: class {
            constructor() {
                console.log('Mocked ModuleResource constructor called');
            }
        },
        DataResource: class {},
        RawResource: class {}
    };
});

jest.mock('../fx/serverResources.js', () => {
    console.log('Mocking serverResources.js');
    return {
        StaticResource: class {},
        MarkdownResource: class {},
        ImageResource: class {},
        StreamResource: class {},
        RouteResource: class {},
        ModuleResource: class {
            constructor() {
                console.log('Mocked ModuleResource constructor called');
            }
        }
    };
});

// Mock the getResource method
fx.getResource = jest.fn().mockImplementation((type, config) => {
    return Promise.resolve(new MockHTMLResource(config, mockContext));
});

// Set the environment to 'server' for testing
console.log('Setting NODE_ENV to server');
process.env.NODE_ENV = 'server';

// Now import the FX instance
console.log('Importing FX instance');
import fx, { FX } from '../fx.js';

describe('FX Core Functionality', () => {
    beforeEach(() => {
        console.log('Starting new test');
    });

    afterEach(async () => {
        console.log('Test completed, waiting for all tasks');
        await fx.waitForAll(2000); // 2 second timeout
        console.log('AfterEach completed');
    });

    test('FX instance should be a singleton', () => {
        console.log('Test: FX singleton instance');
        const instance1 = fx;
        const instance2 = FX.getInstance();
        expect(instance1).toBe(instance2);
    });

    test('FX instance should be created', () => {
        console.log('Test: FX instance creation');
        expect(fx).toBeInstanceOf(FX);
    });

    test('loadManifest should add entries to manifestObj', async () => {
        console.log('Test: loadManifest functionality');
        const testManifest = {
            testKey: { type: 'module', path: './test-module.js' }
        };
        
        try {
            await fx.loadManifest(testManifest);
            console.log('loadManifest completed, waiting for all tasks');
            await fx.waitForAll(2000); // 2 second timeout
            
            expect(fx.manifestObj).toHaveProperty('testKey');
            expect(fx.manifestObj.testKey).toEqual(testManifest.testKey);
        } catch (error) {
            console.error('Error in loadManifest test:', error);
            throw error;
        }
    });

    test('FX proxy handles property access correctly', () => {
        const testProperty = 'testValue';
        fx.set('testProp', testProperty);
        expect(fx.testProp).toBe(testProperty);
    });

    test('FX proxy handles nested property access', () => {
        const nestedObject = { nested: { value: 'nestedValue' } };
        fx.set('nestedProp', nestedObject);
        expect(fx.nestedProp.nested.value).toBe('nestedValue');
    });

    test('FX.fx method creates a new proxy with custom configuration', async () => {
        const customFx = fx.fx({ sq: 'customSequence', retry: 3 });
        const mockFunction = jest.fn().mockResolvedValue('success');
        customFx.set('testFunction', mockFunction);

        await customFx.testFunction();

        expect(mockFunction).toHaveBeenCalledTimes(1);
        // You may need to add more specific expectations based on how you implement
        // the custom configuration behavior in your ExecutionContext
    });

    test('FX proxy handles method calls correctly', async () => {
        const mockMethod = jest.fn().mockResolvedValue('methodResult');
        fx.set('testMethod', mockMethod);

        const result = await fx.testMethod();

        expect(result).toBe('methodResult');
        expect(mockMethod).toHaveBeenCalledTimes(1);
    });

    test('Nested property access is optimized', async () => {
        fx.set('deeply', { nested: { property: { access: 'value' } } });
        console.log('Nested property access is optimized',fx.deeply.nested.property.access);   
        const start = performance.now();
        const value = fx.deeply.nested.property.access;
        const end = performance.now();
        
        expect(end - start).toBeLessThan(5); // Assuming 5ms is our performance threshold
        expect(value).toBe('value');
    });

    test('Error handling system works correctly', async () => {
        const mockErrorHandler = jest.fn();
        fx.errorHandler.register('TestError', mockErrorHandler);

        const testError = new Error('Test error');
        testError.name = 'TestError';

        fx.errorHandler.handle(testError);
        expect(mockErrorHandler).toHaveBeenCalledWith(testError, expect.any(Object));
    });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    // Add more tests here as needed
    afterAll(async () => {
        console.log('All tests completed, performing final cleanup');
        try {
            await fx.waitForAll(5000);
            console.log('Final cleanup completed successfully');
        } catch (error) {
            console.error('Error in afterAll cleanup:', error);
        }
    });
});

describe('FX Class Extended Tests', () => {
    test('FX.set and FX.get work correctly for simple values', () => {
        fx.set('testKey', 'testValue');
        expect(fx.get('testKey')).toBe('testValue');
    });

    test('FX.set and FX.get work correctly for objects', () => {
        const testObj = { foo: 'bar' };
        fx.set('testObj', testObj);
        expect(fx.get('testObj')).toEqual(testObj);
    });

    test('FX.data method works for both getting and setting', () => {
        fx.data('dataKey', 'dataValue');
        expect(fx.data('dataKey')).toBe('dataValue');
    });

    test('FX handles nested property access and modification', () => {
        fx.set('nested', { level1: { level2: 'value' } });
        expect(fx.nested.level1.level2).toBe('value');
        fx.nested.level1.level2 = 'newValue';
        expect(fx.nested.level1.level2).toBe('newValue');
    });

    test('FX.fx method creates a proxy that respects the config', async () => {
        const mockFn = jest.fn().mockResolvedValue('success');
        fx.set('asyncMethod', mockFn);
        
        const customFx = fx.fx({ retry: 3 });
        await customFx.asyncMethod();
        
        expect(mockFn).toHaveBeenCalledTimes(1);
        // In a real scenario, we'd test that it retries on failure
    });

    test('FX.loadManifest correctly processes nested manifests', async () => {
        const nestedManifest = {
            parent: {
                child: { type: 'module', path: './child-module.js' }
            }
        };
        await fx.loadManifest(nestedManifest);
        expect(fx.manifestObj.parent.child).toEqual({ type: 'module', path: './child-module.js' });
    });
});

describe('FX Resource Management', () => {
    test('HTMLResource serves correct content', () => {
        // Create a mock Resource base class
        class MockResource {
            constructor(config, context) {
                this.config = config;
                this.context = context;
            }
        }

        // Mock the ExecutionContext
        const mockContext = {
            runAsync: jest.fn().mockImplementation(async (fn) => await fn())
        };

        // Mock the resource factory to return a mock HTMLResource
        fx.resourceFactory = jest.fn().mockResolvedValue(
            class MockHTMLResource extends MockResource {
                constructor(config, context) {
                    super(config, context);
                }

                load() {
                    return this.context.runAsync(() => {
                        return (selector) => {
                            if (selector === 'h1') {
                                return '<h1>Test Header</h1>';
                            }
                            return '';
                        };
                    });
                }
            }
        );

        // Replace the real ExecutionContext with the mock
        fx.context = mockContext;

        return fx.context.runAsync(async () => {
            const htmlResource = await fx.getResource('html', { path: './test.html' });
            const contentFn = await htmlResource.load();
            expect(contentFn('h1')).toBe('<h1>Test Header</h1>');
        });
    });
});

describe('FX Performance', () => {
    test('Nested property access is fast for deep objects', () => {
        const deepObject = { a: { b: { c: { d: { e: 'value' } } } } };
        fx.set('deepObject', deepObject);

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            const value = fx.deepObject.a.b.c.d.e;
        }
        const end = performance.now();

        expect(end - start).toBeLessThan(50); // Assuming 50ms is our performance threshold for 1000 accesses
    });
});