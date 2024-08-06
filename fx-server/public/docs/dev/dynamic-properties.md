# Dynamic Properties in FX Framework

The FX Framework provides a powerful and intuitive way to work with dynamic properties. This feature allows you to set, get, and manipulate data easily throughout your application.

## Setting Dynamic Properties

There are multiple ways to set dynamic properties in FX:

### 1. Using Direct Assignment

You can directly assign values to properties on the `fx` object:

```javascript
fx.user.name = "Peter";
fx.user.age = 30;
```

This method is the most straightforward and intuitive, mimicking regular JavaScript object property assignment.

### 2. Using the `set` Method

The `set` method allows you to set properties with default values:

```javascript
fx.set("user.name", "Peter", "Default Name");
fx.set("user.age", 30, 0);
```

The third parameter is the default value, which will be used if the second parameter is `undefined`.

### 3. Using the `data` Method

The `data` method is a versatile way to set properties:

```javascript
fx.data("user.name", "Peter");
fx.data("user", { name: "Peter", age: 30 });
```

This method can set individual properties or entire objects at once.

## Getting Dynamic Properties

Similarly, there are multiple ways to retrieve dynamic properties:

### 1. Direct Access

You can directly access properties on the `fx` object:

```javascript
const userName = fx.user.name;
const userAge = fx.user.age;
```

This method provides a clean and intuitive way to access properties.

### 2. Using the `get` Method

The `get` method allows you to retrieve properties with a default value:

```javascript
const userName = fx.get("user.name", "Default Name");
const userAge = fx.get("user.age", 0);
```

If the property doesn't exist, the default value (second parameter) will be returned.

### 3. Using the `data` Method

The `data` method can also be used to retrieve properties:

```javascript
const userName = fx.data("user.name");
const user = fx.data("user");
```

When used without a second parameter, `data` acts as a getter.

## Nested Properties

FX supports deep nested properties:

```javascript
fx.company.departments.engineering.lead.name = "Alice";
const leadName = fx.company.departments.engineering.lead.name;
```

You can nest properties as deeply as needed, and FX will automatically create the necessary object structure.

## Dynamic Property Behavior

1. **Auto-creation**: If you set a nested property and the parent objects don't exist, FX will create them automatically.

2. **Type Conversion**: FX attempts to maintain the type of the data you set. However, when using methods like `set` with a default value, type conversion may occur if the types don't match.

3. **Reactivity**: Changes to dynamic properties can trigger updates in your application if you've set up reactivity (covered in the Reactivity section).

## Best Practices

1. **Consistency**: Choose one method (direct assignment, `set`, or `data`) and use it consistently throughout your application for clarity.

2. **Default Values**: When dealing with properties that might not exist, use the `get` method with a default value to avoid errors.

3. **Structuring**: Plan your property structure in advance. A well-thought-out structure can make your code more maintainable.

4. **Avoid Overuse**: While dynamic properties are powerful, overusing them can lead to code that's hard to track. Use them judiciously.

Dynamic properties in FX provide a flexible and powerful way to manage your application's state. By understanding and leveraging these features, you can write cleaner, more intuitive code.