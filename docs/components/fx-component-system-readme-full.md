# FX Component System

The FX Component System is a powerful and flexible framework for building web components. It provides a simple, declarative way to define components with HTML-like syntax, while offering advanced features such as state management, lifecycle hooks, and scoped styling.

## Table of Contents

1. [Installation](#installation)
2. [Component Definition](#component-definition)
3. [Component Usage](#component-usage)
4. [State Management](#state-management)
5. [Lifecycle Hooks](#lifecycle-hooks)
6. [Styling](#styling)
7. [Sub-components](#sub-components)
8. [API Reference](#api-reference)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Installation

To use the FX Component System, include the `fx-component-system.js` file in your project:

```html
<script type="module" src="/path/to/fx-component-system.js"></script>
```

Ensure that the file path is correct relative to your project structure.

## Component Definition

Components are defined using an HTML-like syntax in separate files. Here's the basic structure of a component definition:

```html
<component name="component-name" tag="custom-tag-name">
<data name="props" type="json">
{
    // Initial component data
}
</data>

<template>
    <!-- Component template -->
</template>

<style>
    /* Component styles */
</style>

<script>
    class {
        // Component logic
    }
</script>
</component>
```

### Data

The `<data>` tag defines the initial data for the component. It should contain a JSON object. This data can be accessed within the component using `this.data.props`.

Example:
```html
<data name="props" type="json">
{
    "count": 0,
    "title": "My Counter"
}
</data>
```

### Template

The `<template>` tag contains the HTML structure of the component. You can use `{{expression}}` syntax to insert dynamic values.

Example:
```html
<template>
    <div>
        <h2>{{data.props.title}}</h2>
        <p>Count: {{data.props.count}}</p>
        <button onclick="this.increment()">Increment</button>
    </div>
</template>
```

### Style

The `<style>` tag contains CSS styles for the component. These styles are scoped to the component by default.

Example:
```html
<style>
    button {
        background-color: #007bff;
        color: white;
        padding: 5px 10px;
        border: none;
        border-radius: 3px;
    }
</style>
```

### Script

The `<script>` tag contains a class definition with the component's logic. Methods defined here can be called from the template.

Example:
```html
<script>
    class {
        increment() {
            this.data.props.count++;
            this.render();
        }

        onCreate() {
            console.log('Component created');
        }
    }
</script>
```

## Component Usage

To use a component in your HTML, simply use the custom tag name defined in the component:

```html
<custom-tag-name></custom-tag-name>
```

You can also pass attributes to the component:

```html
<custom-tag-name title="My Custom Counter"></custom-tag-name>
```

## State Management

Components can share state using the `state` attribute:

```html
<custom-tag-name state="shared-state"></custom-tag-name>
```

Components with the same `state` value will share the same state. If no `state` is specified, the component uses the "global" state.

You can access and modify state programmatically:

```javascript
// Get state
const state = fx.component.getState('shared-state');

// Set state
fx.component.setState('shared-state', { newProp: 'value' });
```

State changes automatically trigger a re-render of all components using that state.

## Lifecycle Hooks

The component system provides several lifecycle hooks:

- `onCreate()`: Called when the component is created
- `onMount()`: Called when the component is added to the DOM
- `onUpdate(oldState, newState)`: Called when the component's state is updated
- `onDestroy()`: Called when the component is removed from the DOM

Define these methods in your component's script to use them:

```html
<script>
    class {
        onCreate() {
            console.log('Component created');
        }
        
        onMount() {
            console.log('Component mounted');
        }
        
        onUpdate(oldState, newState) {
            console.log('State updated', oldState, newState);
        }
        
        onDestroy() {
            console.log('Component destroyed');
        }
    }
</script>
```

## Styling

Styles can be defined in three ways:

1. Inside the `<style>` tag of the component definition
2. Using the `style` attribute on the `<template>` tag to load external stylesheets
3. Using the `src` attribute on the `<style>` tag to load external stylesheets

Example:

```html
<template style="/path/to/external-style.css">
    <!-- Template content -->
</template>

<style src="/path/to/another-style.css">
    /* Additional styles */
</style>
```

Styles are scoped to the component by default. You can change the scope using the `scope` attribute on the `<style>` tag.

## Sub-components

Components can include other components in their templates:

```html
<template>
    <div>
        <custom-tag-name></custom-tag-name>
        <another-component></another-component>
    </div>
</template>
```

Ensure that all sub-components are properly defined and loaded.

## API Reference

### `fx.component.load(name)`

Loads a component by name.

Parameters:
- `name` (string): The name of the component to load

Returns: A Promise that resolves when the component is loaded

### `fx.component.get(name)`

Gets a component class by name.

Parameters:
- `name` (string): The name of the component to get

Returns: The component class

### `fx.component.getState(stateId)`

Gets the state for a given state ID.

Parameters:
- `stateId` (string): The ID of the state to get

Returns: The state object

### `fx.component.setState(stateId, newState)`

Sets the state for a given state ID.

Parameters:
- `stateId` (string): The ID of the state to set
- `newState` (object): The new state to set

## Best Practices

1. Keep components small and focused on a single responsibility.
2. Use shared states sparingly and prefer passing data through attributes when possible.
3. Leverage lifecycle hooks for setup and cleanup operations.
4. Use scoped styles to prevent CSS conflicts between components.
5. Document your components, especially if they're intended for reuse across projects.

## Troubleshooting

Common issues and their solutions:

1. Component not rendering:
   - Ensure the component is properly defined and loaded.
   - Check for any JavaScript errors in the console.

2. Styles not applying:
   - Verify that the styles are properly scoped to the component.
   - Check for any CSS syntax errors.

3. State not updating:
   - Make sure you're using `this.setState()` to update state, not modifying `this.state` directly.
   - Verify that the state ID is correct if using shared state.

4. Lifecycle hooks not firing:
   - Ensure the methods are correctly named (onCreate, onMount, etc.).
   - Check that the component is properly extending FXBaseComponent.

If you encounter any other issues, please check the console for error messages and refer to the component definition for any syntax errors.

## Conclusion

The FX Component System provides a powerful and flexible way to create reusable web components. With features like declarative syntax, state management, lifecycle hooks, and scoped styling, it offers everything you need to build complex, interactive web applications. By leveraging the system's capabilities, you can create modular, maintainable, and scalable front-end architectures.

Remember to always refer to this documentation when working with the FX Component System, and don't hesitate to explore and experiment with its features to get the most out of your web development projects.
