# FX Component System Developer Documentation

## Table of Contents
- [FX Component System Developer Documentation](#fx-component-system-developer-documentation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Component Definition](#component-definition)
  - [Data and State Management](#data-and-state-management)
    - [Component Data](#component-data)
    - [Shared State](#shared-state)
    - [State API](#state-api)
  - [Lifecycle Hooks](#lifecycle-hooks)
  - [Styling](#styling)
  - [Templates and Data Binding](#templates-and-data-binding)
  - [Component Loading](#component-loading)
  - [API Reference](#api-reference)

## Introduction

The FX Component System is a powerful framework for building web components with built-in data management, lifecycle hooks, and scoped styling. This document provides a comprehensive guide to using the system effectively.

## Component Definition

Components are defined using an HTML-like syntax in separate files. Here's the basic structure:

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

## Data and State Management

The FX Component System uses a combination of component-specific data and shared state management.

### Component Data

Each component has its own `data` object, initialized from the `<data>` tag in the component definition.

Example:
```html
<data name="props" type="json">
{
    "count": 0
}
</data>

<script>
    class {
        increment() {
            this.data.props.count++;
            this.render();
        }
    }
</script>
```

### Shared State

Components can share state using the `state` attribute. This allows multiple components to access and modify the same state.

Example:
```html
<fx-counter state="shared-counter"></fx-counter>
<fx-display state="shared-counter"></fx-display>
```

Both components will now share the same state identified by "shared-counter".

### State API

The FX Component System provides methods for getting and setting shared state:

- `fx.component.getState(stateId)`: Retrieves the state for a given state ID.
- `fx.component.setState(stateId, newState)`: Sets the state for a given state ID.

Example:
```javascript
fx.component.setState('shared-counter', { count: 5 });
const state = fx.component.getState('shared-counter');
```

## Lifecycle Hooks

The system provides several lifecycle hooks:

- `onCreate()`: Called when the component is created.
- `onMount()`: Called when the component is added to the DOM.
- `onUpdate(oldState, newState)`: Called when the component's shared state is updated.
- `onDestroy()`: Called when the component is removed from the DOM.

Example:
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

1. Inside the `<style>` tag of the component definition.
2. Using the `style` attribute on the `<template>` tag to load external stylesheets.
3. Using the `src` attribute on the `<style>` tag to load external stylesheets.

Styles are scoped to the component by default. You can change the scope using the `scope` attribute on the `<style>` tag.

Example:
```html
<template style="/path/to/external-style.css">
    <!-- Template content -->
</template>

<style src="/path/to/another-style.css" scope="#element">
    /* Additional styles */
</style>
```

## Templates and Data Binding

Templates use a simple mustache-like syntax for data binding:

```html
<template>
    <div>
        <h2>{{data.props.title}}</h2>
        <p>Count: {{data.props.count}}</p>
        <button onclick="this.increment()">Increment</button>
    </div>
</template>
```

You can access component data and methods using this syntax.

## Component Loading

Components are automatically loaded and registered when they're encountered in the DOM. You can also load components programmatically:

```javascript
fx.component.load('component-name').then(() => {
    // Component is loaded and ready to use
});
```

## API Reference

- `fx.component.load(name)`: Loads a component by name.
- `fx.component.get(name)`: Gets a component class by name.
- `fx.component.getState(stateId)`: Gets the shared state for a given state ID.
- `fx.component.setState(stateId, newState)`: Sets the shared state for a given state ID.

These methods allow you to interact with the component system programmatically, giving you fine-grained control over component loading and state management.