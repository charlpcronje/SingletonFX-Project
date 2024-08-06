# Manifest

The manifest is for resources that you want to access dynamically, in a sync-like API or in multiple ques at the same time.

## 1. Referencing Modules
- This refers to anything that can natively be exported by JavaScript and Imported in some other module. 
- The export could be a class, or instance or function etc, if an actual instance is exported `fx` can just return the instance. 
- If arguments are necessary for instantiation of the class then it must throw an error explaining that the class that is being referenced is a class and not an instance and that the type needs to be changed to class.
- After any exported value is referenced, the type of the exported value is changed to the type being specified. So if a number is exported as a string, the type of the exported value must be converted to a string. 
- All types are converted to the type being specified. So if a number is exported and the type is string, the number must be converted to a string.

### 1.1. When referencing JavaScript modules, the type can be:
| ☐ | type      | Resource          | Extends         |
|---|-----------|-------------------|-----------------| 
| ☑ | module    | ModuleResource    | Resource        |
| ☑ | class     | ModuleResource    | Resource        |
| ☑ | instance  | ModuleResource    | Resource        |
| ☑ | function  | ModuleResource    | Resource        |
| ☑ | object    | ModuleResource    | Resource        |
| ☐ | string    | ModuleResource    | Resource        |
| ☐ | number    | ModuleResource    | Resource        |
| ☐ | boolean   | ModuleResource    | Resource        |
| ☐ | array     | ModuleResource    | Resource        |
| ☐ | typedArray| ModuleResource    | Resource        |
| ☐ | var       | ModuleResource    | Resource        |
| ☐ | const     | ModuleResource    | Resource        |
| ☐ | Let       | ModuleResource    | Resource        |
| ☐ | const     | ModuleResource    | Resource        |
| ☐ | bigInt    | ModuleResource    | Resource        |
| ☐ | undefined | ModuleResource    | Resource        |
| ☐ | null      | ModuleResource    | Resource        |
| ☐ | date      | ModuleResource    | Resource        |
| ☐ | regExp    | ModuleResource    | Resource        |
| ☐ | error     | ModuleResource    | Resource        |
| ☐ | promise   | ModuleResource    | Resource        |
| ☐ | generator | ModuleResource    | Resource        |
| ☐ | Iterator  | ModuleResource    | Resource        |
| ☐ | proxy     | ModuleResource    | Resource        |
| ☐ | reflect   | ModuleResource    | Resource        |
| ☐ | set       | ModuleResource    | Resource        |
| ☐ | weakSet   | ModuleResource    | Resource        |
| ☐ | map       | ModuleResource    | Resource        |
| ☐ | weakMap   | ModuleResource    | Resource        |
| ☐ | symbol    | ModuleResource    | Resource        |

### 1.2. Module Resource: Manifest Example
```js
export default {
    help: {
        path: 'modules/help.js',
        type: 'instance',
        mainExport: 'Help'
    },
    entity: {
        // nested module
        user: {
            path: 'modules/user.js',
            type: 'instance',
            mainExport: 'User'
        },
        company: {
            path: 'modules/company.js',
            type: 'class',
            mainExport: 'Company'
        },
    },
    
    product: {
        path: 'modules/product.js',
        type: 'class',
        mainExport: 'Product'
    },
    utils: {
        path: 'modules/utils.js',
        type: 'function',
        mainExport: 'calculateTotal'
    },
    multipleExports: {
        path: 'modules/multipleExports.js',
        type: 'instance',
        mainExport: 'Order',
        additionalExports: {
            cancelOrder: 'cancelOrder'
        }
    },
    log: {
        path: 'modules/log.js',
        type: 'function',
        mainExport: 'log'
    },
    setDebug: {
        path: 'modules/log.js',
        type: 'function',
        mainExport: 'setDebug'
    } 
}
```

## 2. UI Resource
### 2.1. When referencing UI Resources, the type can be:
| ☐ | type      | Resource           | Extends         |
|---|-----------|--------------------|-----------------|
| ☑ | html      | DOMResource        | Resource        |
| ☑ | script    | ScriptResource     | DOMResource     |
| ☑ | view      | ViewResource       | DOMResource     |
| ☑ | layout    | ViewResource       | DOMResource     |
| ☑ | markdown  | MarkdownResource   | ViewResource    |
| ☒ | component | ComponentResource  | ViewResource    |

## 3. Data Resources
When referencing Data Resources, the type can be:
| ☐ | type      | Resource           | Extends         |
|---|-----------|--------------------|-----------------|
| ☑ | json      | DataResource       | Resource        |
| ☑ | xml       | DataResource       | Resource        |
| ☑ | yml       | DataResource       | Resource        |
| ☒ | env       | EnvResource        | DataResource    |
| ☑ | raw       | RawResource        | Resource        |

## 4. Storage Resources
When referencing Storage Resources, the type can be:
| ☐ | type      | Resource           | Extends         |
|---|-----------|--------------------|-----------------|
| ☒ | cache     | CacheResource      | StorageResource |
| ☒ | indexedDB | IndexedDBResource  | StorageResource |
| ☒ | store     | StoreResource      | StorageResource |
| ☒ | session   | SessionResource    | StorageResource |
| ☒ | cookie    | CookieResource     | StorageResource |
| ☒ | state     | StateResource      | StorageResource |

## 5. Referencing Assets
When referencing Asset Resources, the type can be:
| ☐ | type      | Resource           | Extends         |
|---|-----------|--------------------|-----------------|
| ☑ | css       | StyleResource      | DOMResource     |
| ☑ | scss      | StyleResource      | DOMResource     |
| ☑ | css       | StyleResource      | DOMResource     |  
| ☑ | static    | StaticResource     | DOMResource     |
| ☑ | image     | MediaResource      | StaticResource  |
| ☑ | video     | MediaResource      | StaticResource  |
| ☑ | audio     | MediaResource      | StaticResource  |

## 6. Referencing Routes that Reference Resources
When referencing Route Resources, the type can be:
| ☐ | type      | Resource           | Extends         |
|---|-----------|--------------------|-----------------|
| ☑ | route     | RouteResource      | Resource        |
| ☑ | stream    | StreamResource     | Resource        |

## 7. Referencing API Endpoints
When referencing API Resources, the type can be:
| ☐ | type      | Resource           | Extends         |
|---|-----------|--------------------|-----------------|
| ☑ | api       | APIResource        | DataResource    |
| ☑ | socket    | SocketResource     | DataResource    |
| ☐ | graph     | GraphResource      | Resource        |

## 8. Referencing Middleware
When referencing Middleware Resources, the type can be:
* Same as module

## 9. Referencing Services
When referencing Service Resources, the type can be:
* Same as module

## 10. Referencing Plugins
When referencing Plugin Resources, the type can be:
* Same as module

## 11.Referencing Tools / Libraries
When referencing Tool / Libraries Resources, the type can be:
| ☐ | type      | Resource           | Extends         |
|---|-----------|--------------------|-----------------|
| ☑ | cli       | CLIResource        | ShellResource   |
| ☑ | lib       | LibResource        | ScriptResource  |
| ☑ | mysql     | MySQLResource      | SQLResource     |
| ☑ | sqlite    | MySQLResource      | SQLResource     |
| ☑ | postgreSQL| PostgreSQLResource | SQLResource     |