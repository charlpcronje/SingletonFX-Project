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
        }
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

// Set the environment to 'server' for testing
console.log('Setting NODE_ENV to server');
process.env.NODE_ENV = 'server';

// Now import the FX class
console.log('Importing FX class');
import { FX } from '../fx.js';

describe('FX Class', () => {
    let fx;

    beforeEach(() => {
        console.log('Creating new FX instance');
        fx = new FX();
    });

    test('FX instance should be created', () => {
        console.log('Test: FX instance creation');
        console.log('Expected: Instance of FX');
        console.log('Actual:', fx);
        expect(fx).toBeInstanceOf(FX);
    });

    test('loadManifest should add entries to manifestObj', async () => {
        console.log('Test: loadManifest functionality');
        console.log('Arguments: testManifest object');
        const testManifest = {
            testKey: { type: 'module', path: './test-module.js' }
        };
        try {
            console.log('Calling loadManifest');
            await fx.loadManifest(testManifest);
            console.log('Expected: manifestObj to have property "testKey"');
            console.log('Actual:', fx.manifestObj);
            expect(fx.manifestObj).toHaveProperty('testKey');
        } catch (error) {
            console.error('Error in loadManifest:', error);
            throw error;
        }
    });
});