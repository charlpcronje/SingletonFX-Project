# Dynamic modules

FX has a way to load modules dynamically. This is useful if you have a lot of data that you want to use in different places.

Look at the [Manifest](./manifests.md) page, then under the Module resources, you can see to add modules to the manifest. So that you can load them dynamically.

## Examples

### manifest.js
In the first example below, the module is exported as an instance. Look in the `./modules/help.js` file to see how it is exported.
```js
export default { 
    module:{
        help: {
            type: 'instance',
            path: './modules/help.js',
            mainExport: 'help'
        },
        Help: {
            type: 'class',
            path: './modules/help.js',
            mainExport: 'Help'
        }
    }
}
```

## modules/help.js
```js
/**
 * @file ./modules/help.js
 * @description Help Module
 */
import { fx } from 'fx';

const Help = class {
    constructor(fx) {
        this.fx = fx;
        this.helpContent = null;
    }

    loadContent() {
        if (!this.helpContent) {
            this.helpContent = this.fx.load({
                type: "html",
                path: "./views/help.html"
            });
        }
    }

    /**
     * The html to show is being loaded in a sync-like fashion by using fx.load
     * So the show method is not async, and can be called from anywhere in the app
     */
    show() {
        if (!document.getElementById('fx-help-container')) {
            this.loadContent(); // load the conte
            const helpContainer = document.createElement('div');
            helpContainer.id = 'fx-help-container';
            document.body.appendChild(helpContainer);
        }
        document.getElementById('fx-help-container').innerHTML = this.helpContent;
        document.querySelector('.overlay').style.display = 'flex';
    }

    hide() {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

const help = new Help(fx);
export { 
    help, // instance
    Help // class   
};
```

## Accessing the module

### Instance
- When a `fx.modules.help` is accessed, it will return an instance of the Help class, and from then on `fx.modules.help` must keep on being a reference to that instance.
- So next time you access `fx.modules.help`, it will return the same instance of the Help class and not a new one, or access the manifest to get the details of the module and the `instance`

```js
fx.modules.help.show();
```
Now that `fx.modules.help.show()` is called transparently and the help content is loaded and shown transparently.


### Class
- Or using the class, notice the capitalization of the first letter on `Help`.
- When a `fx.modules.Help` is accessed, it will return the class itself and that must still be instantiated, and from then on `fx.modules.Help` must keep on being a reference to that class.
- So next time you access `fx.modules.Help`, it will return the `Class` or `Help` and not a access the manifest to get the details of the module or the class.
```js
// 
new fx.modules.Help().show(); 
```
What is import to notice here is that there are more async operations happening inside help.js, these must all be completed before the class is instantiated and returned.


## FX `load` method
- The `load` method is used to load resources in FX. It is a sync-like method that can be used to load resources from the server.
- Using the `load` is as good as adding an entry to the manifest and then accessing it.
- You could however use set the `defer` option to true, then it will have the same effect as using the `manifest` method to add the resource to the manifest, and then loading it when the resource is needed.

## FX `manifest` method
- It works the same way as the `load` method, but the `defer` option is by `default true`.
- So the manifest method is a way to add resources dynamically to the manifest, and then load them later when they are needed.
- You could however use the defer option and set it to true then it will have the same effect as using the load `method` to load the resource, and then load it when the resource is needed.

## load & manifest
- In the background the `load` method calls the `manifest` and passes all the argument to but sets the defer option to false.
- So you can use the `load` method to load resources from the server, and the `manifest` method to add resources to the manifest.















