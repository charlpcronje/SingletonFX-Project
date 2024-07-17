npm test -- --coverage

> test
> jest --coverage

 FAIL  ./fx.test.js (30.662 s)
  FX
    ✕ should create a singleton instance (2 ms)
    ✕ should initialize invalidation process (5001 ms)
    ✕ should invalidate cache for specific modules (5002 ms)
    ✕ should lazy load a module (4 ms)
    ✓ should cache a module (1 ms)
    ✕ should load and instantiate a module (5000 ms)
    ✕ should load script from network (4999 ms)
    ✕ should load script from cache (11 ms)
    ✕ should execute script (1 ms)
    ✕ should cache script (5000 ms)
    ✕ should get cached script (5000 ms)
    ✓ should set and get values using dot notation (1 ms)
    ✕ should handle async functions with data method

  ● FX › should create a singleton instance

    ReferenceError: FX is not defined

      33 |
      34 |     test('should create a singleton instance', () => {
    > 35 |         const instance1 = new FX();
         |                           ^
      36 |         const instance2 = new FX();
      37 |         expect(instance1).toBe(instance2);
      38 |     });

      at Object.<anonymous> (fx.test.js:35:27)

  ● FX › should initialize invalidation process

    TypeError: Failed to parse URL from /path/to/generate_hashes.php



    Cause:
    TypeError: Invalid URL

      79 |      */
      80 |     async initializeInvalidation() {
    > 81 |         const response = await fetch('/path/to/generate_hashes.php'); // Update with the actual URL
         |                                ^
      82 |         const invalidatedModules = await response.json();
      83 |         await this.invalidateCache(invalidatedModules);
      84 |     }

      at FX.fetch (fx.js:81:32)
      at call (fx.js:2:1)
      at Generator.tryCatch (fx.js:2:1)
      at Generator._invoke [as next] (fx.js:2:1)
      at asyncGeneratorStep (fx.js:2:1)
      at asyncGeneratorStep (fx.js:2:1)
      at _next (fx.js:2:1)
      at FX.<anonymous> (fx.js:2:1)
      at FX.apply [as initializeInvalidation] (fx.js:84:6)
      at new initializeInvalidation (fx.js:21:14)
      at Object.<anonymous> (fx.js:356:19)
      at Object.require (fx.test.js:1:1)

  ● FX › should initialize invalidation process

    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."

      38 |     });
      39 |
    > 40 |     test('should initialize invalidation process', async () => {
         |     ^
      41 |         fetch.mockResolvedValueOnce({
      42 |             json: async () => ['user', 'product'],
      43 |         });

      at test (fx.test.js:40:5)
      at Object.describe (fx.test.js:27:1)

  ● FX › should invalidate cache for specific modules

    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."

      47 |     });
      48 |
    > 49 |     test('should invalidate cache for specific modules', async () => {
         |     ^
      50 |         const moduleNames = ['user', 'product'];
      51 |         await fx.invalidateCache(moduleNames);
      52 |         expect(indexedDB.open).toHaveBeenCalledWith('FXDB', 1);

      at test (fx.test.js:49:5)
      at Object.describe (fx.test.js:27:1)

  ● FX › should lazy load a module

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "modules/user.js"

    Number of calls: 0

      55 |     test('should lazy load a module', async () => {
      56 |         const user = await fx.user;
    > 57 |         expect(fetch).toHaveBeenCalledWith('modules/user.js');
         |                       ^
      58 |         expect(user.addUser).toBeDefined();
      59 |     });
      60 |

      at toHaveBeenCalledWith (fx.test.js:57:23)
      at call (fx.test.js:2:1)
      at Generator.tryCatch (fx.test.js:2:1)
      at Generator._invoke [as next] (fx.test.js:2:1)
      at asyncGeneratorStep (fx.test.js:2:1)
      at asyncGeneratorStep (fx.test.js:2:1)

  ● FX › should load and instantiate a module

    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."

      66 |     });
      67 |
    > 68 |     test('should load and instantiate a module', async () => {
         |     ^
      69 |         const moduleName = 'user';
      70 |         const path = 'modules/user.js';
      71 |         const type = 'instance';

      at test (fx.test.js:68:5)
      at Object.describe (fx.test.js:27:1)

  ● FX › should load script from network

    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."

      75 |     });
      76 |
    > 77 |     test('should load script from network', async () => {
         |     ^
      78 |         const moduleName = 'user';
      79 |         const path = 'modules/user.js';
      80 |         fetch.mockResolvedValueOnce({

      at test (fx.test.js:77:5)
      at Object.describe (fx.test.js:27:1)

  ● FX › should load script from cache

    Cannot find module 'blob:nodedata:4c4f321e-6f5b-45ff-ae61-4d763c5ee2fc' from 'fx.js'

      241 |         });
      242 |         const url = URL.createObjectURL(blob);
    > 243 |         return import(url);
          |         ^
      244 |     }
      245 |
      246 |     /**

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at require (fx.js:243:9)

  ● FX › should execute script

    Cannot find module 'blob:nodedata:7fcf9fca-4ba3-4b1c-95be-b27bb8831b97' from 'fx.js'

      241 |         });
      242 |         const url = URL.createObjectURL(blob);
    > 243 |         return import(url);
          |         ^
      244 |     }
      245 |
      246 |     /**

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at require (fx.js:243:9)

  ● FX › should cache script

    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."

       99 |     });
      100 |
    > 101 |     test('should cache script', async () => {
          |     ^
      102 |         const moduleName = 'user';
      103 |         const scriptContent = 'export class User {}';
      104 |         await fx.cacheScript(moduleName, scriptContent);

      at test (fx.test.js:101:5)
      at Object.describe (fx.test.js:27:1)

  ● FX › should get cached script

    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."

      106 |     });
      107 |
    > 108 |     test('should get cached script', async () => {
          |     ^
      109 |         const moduleName = 'user';
      110 |         const scriptContent = 'export class User {}';
      111 |         await fx.cacheScript(moduleName, scriptContent);

      at test (fx.test.js:108:5)
      at Object.describe (fx.test.js:27:1)

  ● FX › should handle async functions with data method

    TypeError: _fx.fx.getUser is not a function

      131 |             return response.json();
      132 |         });
    > 133 |         const user = await fx.getUser(1);
          |                               ^
      134 |         expect(user).toEqual(mockUser);
      135 |     });
      136 | });

      at getUser (fx.test.js:133:31)
      at call (fx.test.js:2:1)
      at Generator.tryCatch (fx.test.js:2:1)
      at Generator._invoke [as next] (fx.test.js:2:1)
      at asyncGeneratorStep (fx.test.js:2:1)
      at asyncGeneratorStep (fx.test.js:2:1)
      at _next (fx.test.js:2:1)
      at Object.<anonymous> (fx.test.js:2:1)

-------------|---------|----------|---------|---------|-------------------------------------------------------------------------------------
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                   
-------------|---------|----------|---------|---------|-------------------------------------------------------------------------------------
All files    |   47.65 |    31.03 |   60.71 |   47.65 |                                                                                     
 fx.js       |   47.24 |    31.03 |   60.71 |   47.24 | ...-112,119,123,137-138,151-155,178-204,217,221,254-257,270-284,321,338,341,345-350 
 manifest.js |     100 |      100 |     100 |     100 |                                                                                     
-------------|---------|----------|---------|---------|-------------------------------------------------------------------------------------
Test Suites: 1 failed, 1 total
Tests:       11 failed, 2 passed, 13 total
Snapshots:   0 total
Time:        30.762 s, estimated 31 s
Ran all test suites. 