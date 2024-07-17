Failed to load module from modules/user.js: TypeError: Cannot set properties of undefined (setting 'onupgradeneeded')
        at /var/www/ai/fx/fx.js:109:36
        at new Promise (<anonymous>)
        at _callee3$ (/var/www/ai/fx/fx.js:106:16)
        at call (/var/www/ai/fx/fx.js:2:1)
        at Generator.tryCatch (/var/www/ai/fx/fx.js:2:1)
        at Generator._invoke [as next] (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at _next (/var/www/ai/fx/fx.js:2:1)
        at new Promise (<anonymous>)
        at FX.<anonymous> (/var/www/ai/fx/fx.js:2:1)
        at FX.apply [as openDB] (/var/www/ai/fx/fx.js:126:6)
        at FX.openDB (/var/www/ai/fx/fx.js:269:31)
        at call (/var/www/ai/fx/fx.js:2:1)
        at Generator.tryCatch (/var/www/ai/fx/fx.js:2:1)
        at Generator._invoke [as next] (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at _next (/var/www/ai/fx/fx.js:2:1)
        at new Promise (<anonymous>)
        at FX.<anonymous> (/var/www/ai/fx/fx.js:2:1)
        at FX.apply [as getCachedScript] (/var/www/ai/fx/fx.js:287:6)
        at FX.getCachedScript (/var/www/ai/fx/fx.js:176:45)
        at call (/var/www/ai/fx/fx.js:2:1)
        at Generator.tryCatch (/var/www/ai/fx/fx.js:2:1)
        at Generator._invoke [as next] (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at _next (/var/www/ai/fx/fx.js:2:1)
        at new Promise (<anonymous>)
        at FX.<anonymous> (/var/www/ai/fx/fx.js:2:1)
        at FX.apply [as loadAndInstantiateModule] (/var/www/ai/fx/fx.js:206:6)
        at FX.loadAndInstantiateModule [as lazyLoadModule] (/var/www/ai/fx/fx.js:146:40)
        at Object.lazyLoadModule [as get] (/var/www/ai/fx/fx.js:30:37)
        at user (/var/www/ai/fx/fx.test.js:45:31)
        at call (/var/www/ai/fx/fx.test.js:2:1)
        at Generator.tryCatch (/var/www/ai/fx/fx.test.js:2:1)
        at Generator._invoke [as next] (/var/www/ai/fx/fx.test.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.test.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.test.js:2:1)
        at _next (/var/www/ai/fx/fx.test.js:2:1)
        at new Promise (<anonymous>)
        at Object.<anonymous> (/var/www/ai/fx/fx.test.js:2:1)
        at Promise.then.completed (/var/www/ai/fx/node_modules/jest-circus/build/utils.js:298:28)
        at new Promise (<anonymous>)
        at callAsyncCircusFn (/var/www/ai/fx/node_modules/jest-circus/build/utils.js:231:10)
        at _callCircusTest (/var/www/ai/fx/node_modules/jest-circus/build/run.js:316:40)
        at processTicksAndRejections (node:internal/process/task_queues:95:5)
        at _runTest (/var/www/ai/fx/node_modules/jest-circus/build/run.js:252:3)
        at _runTestsForDescribeBlock (/var/www/ai/fx/node_modules/jest-circus/build/run.js:126:9)
        at _runTestsForDescribeBlock (/var/www/ai/fx/node_modules/jest-circus/build/run.js:121:9)
        at run (/var/www/ai/fx/node_modules/jest-circus/build/run.js:71:3)
        at runAndTransformResultsToJestFormat (/var/www/ai/fx/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
        at jestAdapter (/var/www/ai/fx/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
        at runTestInternal (/var/www/ai/fx/node_modules/jest-runner/build/runTest.js:367:16)
        at runTest (/var/www/ai/fx/node_modules/jest-runner/build/runTest.js:444:34)

      201 |             }
      202 |         } catch (error) {
    > 203 |             console.error(`Failed to load module from ${path}:`, error);
          |                     ^
      204 |             return undefined;
      205 |         }
      206 |     }

      at FX.error (fx.js:203:21)
      at call (fx.js:2:1)
      at Generator.tryCatch (fx.js:2:1)
      at Generator._invoke [as throw] (fx.js:2:1)
      at asyncGeneratorStep (fx.js:2:1)
      at asyncGeneratorStep (fx.js:2:1)

  console.error
    Failed to load property then from module user.

      152 |                             return moduleInstance[prop];
      153 |                         } else {
    > 154 |                             console.error(`Failed to load property ${prop} from module ${moduleName}.`);
          |                                     ^
      155 |                             return undefined;
      156 |                         }
      157 |                     });

      at error (fx.js:154:37)

  console.error
    Failed to load property then from module user.

      152 |                             return moduleInstance[prop];
      153 |                         } else {
    > 154 |                             console.error(`Failed to load property ${prop} from module ${moduleName}.`);
          |                                     ^
      155 |                             return undefined;
      156 |                         }
      157 |                     });

      at error (fx.js:154:37)

  console.error
    Failed to load property then from module user.

      152 |                             return moduleInstance[prop];
      153 |                         } else {
    > 154 |                             console.error(`Failed to load property ${prop} from module ${moduleName}.`);
          |                                     ^
      155 |                             return undefined;
      156 |                         }
      157 |                     });

      at error (fx.js:154:37)

  console.error
    Failed to load module from modules/user.js: TypeError: Cannot set properties of undefined (setting 'onupgradeneeded')
        at /var/www/ai/fx/fx.js:109:36
        at new Promise (<anonymous>)
        at _callee3$ (/var/www/ai/fx/fx.js:106:16)
        at call (/var/www/ai/fx/fx.js:2:1)
        at Generator.tryCatch (/var/www/ai/fx/fx.js:2:1)
        at Generator._invoke [as next] (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at _next (/var/www/ai/fx/fx.js:2:1)
        at new Promise (<anonymous>)
        at Proxy.<anonymous> (/var/www/ai/fx/fx.js:2:1)
        at Proxy.apply (/var/www/ai/fx/fx.js:126:6)
        at Proxy.openDB (/var/www/ai/fx/fx.js:269:31)
        at call (/var/www/ai/fx/fx.js:2:1)
        at Generator.tryCatch (/var/www/ai/fx/fx.js:2:1)
        at Generator._invoke [as next] (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at _next (/var/www/ai/fx/fx.js:2:1)
        at new Promise (<anonymous>)
        at Proxy.<anonymous> (/var/www/ai/fx/fx.js:2:1)
        at Proxy.apply (/var/www/ai/fx/fx.js:287:6)
        at Proxy.getCachedScript (/var/www/ai/fx/fx.js:176:45)
        at call (/var/www/ai/fx/fx.js:2:1)
        at Generator.tryCatch (/var/www/ai/fx/fx.js:2:1)
        at Generator._invoke [as next] (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
        at _next (/var/www/ai/fx/fx.js:2:1)
        at new Promise (<anonymous>)
        at Proxy.<anonymous> (/var/www/ai/fx/fx.js:2:1)
        at Proxy.apply (/var/www/ai/fx/fx.js:206:6)
        at loadAndInstantiateModule (/var/www/ai/fx/fx.test.js:62:33)
        at call (/var/www/ai/fx/fx.test.js:2:1)
        at Generator.tryCatch (/var/www/ai/fx/fx.test.js:2:1)
        at Generator._invoke [as next] (/var/www/ai/fx/fx.test.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.test.js:2:1)
        at asyncGeneratorStep (/var/www/ai/fx/fx.test.js:2:1)
        at _next (/var/www/ai/fx/fx.test.js:2:1)
        at new Promise (<anonymous>)
        at Object.<anonymous> (/var/www/ai/fx/fx.test.js:2:1)
        at Promise.then.completed (/var/www/ai/fx/node_modules/jest-circus/build/utils.js:298:28)
        at new Promise (<anonymous>)
        at callAsyncCircusFn (/var/www/ai/fx/node_modules/jest-circus/build/utils.js:231:10)
        at _callCircusTest (/var/www/ai/fx/node_modules/jest-circus/build/run.js:316:40)
        at processTicksAndRejections (node:internal/process/task_queues:95:5)
        at _runTest (/var/www/ai/fx/node_modules/jest-circus/build/run.js:252:3)
        at _runTestsForDescribeBlock (/var/www/ai/fx/node_modules/jest-circus/build/run.js:126:9)
        at _runTestsForDescribeBlock (/var/www/ai/fx/node_modules/jest-circus/build/run.js:121:9)
        at run (/var/www/ai/fx/node_modules/jest-circus/build/run.js:71:3)
        at runAndTransformResultsToJestFormat (/var/www/ai/fx/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
        at jestAdapter (/var/www/ai/fx/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
        at runTestInternal (/var/www/ai/fx/node_modules/jest-runner/build/runTest.js:367:16)
        at runTest (/var/www/ai/fx/node_modules/jest-runner/build/runTest.js:444:34)

      201 |             }
      202 |         } catch (error) {
    > 203 |             console.error(`Failed to load module from ${path}:`, error);
          |                     ^
      204 |             return undefined;
      205 |         }
      206 |     }

      at Proxy.error (fx.js:203:21)
      at call (fx.js:2:1)
      at Generator.tryCatch (fx.js:2:1)
      at Generator._invoke [as throw] (fx.js:2:1)
      at asyncGeneratorStep (fx.js:2:1)
      at asyncGeneratorStep (fx.js:2:1)


 RUNS  ./fx.test.js
node:internal/deps/undici/undici:12442
    Error.captureStackTrace(err, this);
          ^

TypeError: Failed to parse URL from /path/to/generate_hashes.php
    at node:internal/deps/undici/undici:12442:11
    at processTicksAndRejections (node:internal/process/task_queues:95:5) {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:787:36)
      at new Request (node:internal/deps/undici/undici:5943:25)
      at fetch (node:internal/deps/undici/undici:10221:25)
      at Object.fetch (node:internal/deps/undici/undici:12441:10)
      at fetch (node:internal/process/pre_execution:336:27)
      at FX.fetch (/var/www/ai/fx/fx.js:81:32)
      at call (/var/www/ai/fx/fx.js:2:1)
      at Generator.tryCatch (/var/www/ai/fx/fx.js:2:1)
      at Generator._invoke [as next] (/var/www/ai/fx/fx.js:2:1)
      at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
      at asyncGeneratorStep (/var/www/ai/fx/fx.js:2:1)
      at _next (/var/www/ai/fx/fx.js:2:1)
      at new Promise (<anonymous>)
      at FX.<anonymous> (/var/www/ai/fx/fx.js:2:1)
      at FX.apply [as initializeInvalidation] (/var/www/ai/fx/fx.js:84:6)
      at new initializeInvalidation (/var/www/ai/fx/fx.js:21:14)
      at Object.<anonymous> (/var/www/ai/fx/fx.js:356:19)
      at Runtime._execModule (/var/www/ai/fx/node_modules/jest-runtime/build/index.js:1439:24)
      at Runtime._loadModule (/var/www/ai/fx/node_modules/jest-runtime/build/index.js:1022:12)
      at Runtime.requireModule (/var/www/ai/fx/node_modules/jest-runtime/build/index.js:882:12)
      at Runtime.requireModuleOrMock (/var/www/ai/fx/node_modules/jest-runtime/build/index.js:1048:21)
      at Object.require (/var/www/ai/fx/fx.test.js:1:1)
      at Runtime._execModule (/var/www/ai/fx/node_modules/jest-runtime/build/index.js:1439:24)
      at Runtime._loadModule (/var/www/ai/fx/node_modules/jest-runtime/build/index.js:1022:12)
      at Runtime.requireModule (/var/www/ai/fx/node_modules/jest-runtime/build/index.js:882:12)
      at jestAdapter (/var/www/ai/fx/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:77:13)
      at processTicksAndRejections (node:internal/process/task_queues:95:5)
      at runTestInternal (/var/www/ai/fx/node_modules/jest-runner/build/runTest.js:367:16)
      at runTest (/var/www/ai/fx/node_modules/jest-runner/build/runTest.js:444:34) {
    code: 'ERR_INVALID_URL',
    input: '/path/to/generate_hashes.php'
  }
} 