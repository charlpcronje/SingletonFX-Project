/**
 * @file ./fx/ErrorHandler.js
 * @class ErrorHandler
 * @description Centralized error handling system for FX
 */
export class ErrorHandler {
    constructor() {
        this.errorMap = new Map();
    }

    /**
     * @method register
     * @description Register an error type with its handler
     * @param {string} errorType - The type of error
     * @param {Function} handler - The handler function for this error type
     */
    register(errorType, handler) {
        this.errorMap.set(errorType, handler);
    }

    /**
     * @method handle
     * @description Handle an error
     * @param {Error} error - The error to handle
     * @param {Object} context - Additional context for error handling
     */
    handle(error, context = {}) {
        const handler = this.errorMap.get(error.name) || this.defaultHandler;
        return handler(error, context);
    }

    /**
     * @method defaultHandler
     * @description Default error handler
     * @param {Error} error - The error to handle
     * @param {Object} context - Additional context for error handling
     */
    defaultHandler(error, context) {
        console.error('Unhandled error:', error, 'Context:', context);
        // Implement default recovery strategy or rethrow
        throw error;
    }
}

/*
// Usage in FX
fx.errorHandler = new ErrorHandler();

// Register specific error handlers
fx.errorHandler.register('NetworkError', (error, context) => {
    console.warn('Network error occurred:', error.message);
    // Implement retry logic or fallback
});

// Use in async operations
try {
    await fx.api.user.get('/1');
} catch (error) {
    fx.errorHandler.handle(error, { operation: 'get user' });
}
*/
