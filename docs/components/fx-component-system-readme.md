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

## Installation

To use the FX Component System, include the `fx-component-system.js` file in your project:

```html
<script type="module" src="/path/to/fx-component-system.js"></script>
```

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

The `<data>` tag defines the initial data for the component. It should contain a JSON object.

### Template

The `<template>` tag contains the HTML structure of the component. You can use `{{expression}}` syntax to insert dynamic values.

### Style

The `<style>` tag contains CSS styles for the component. These styles are scoped to the component by default.

### Script

The `<script>` tag contains a class definition with the component's logic. Methods defined here can be called from the template.

## Component Usage

To use a component in your HTML, simply use the custom tag name defined in the component:

```html
<custom-tag-name></custom-tag-name>
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

## API Reference

### `fx.component.load(name)`

Loads a component by name.

### `fx.component.get(name)`

Gets a component class by name.

### `fx.component.getState(stateId)`

Gets the state for a given state ID.

### `fx.component.setState(stateId, newState)`

Sets the state for a given state ID.

## Conclusion

The FX Component System provides a powerful and flexible way to create reusable web components. With features like declarative syntax, state management, lifecycle hooks, and scoped styling, it offers everything you need to