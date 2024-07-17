import fx from './fx.js';

console.log('Starting FX features test...');

try {
    console.log('Testing API access...');
    const users = fx.api.users.get('/users');
    console.log('API users:', users);

    console.log('Testing nested property access...');
    const userCardTemplate = fx.templates.user.card;
    console.log('User card template:', userCardTemplate);

    console.log('Testing resource creation...');
    const mainStyles = fx.styles.main;
    console.log('CSS resource:', mainStyles);

    console.log('Testing dynamic property...');
    fx.dynamicProp = {
        nested: {
            value: 42
        }
    };
    console.log('Dynamic property:', fx.dynamicProp.nested.value);

    console.log('Testing method call on API resource...');
    const newUser = fx.api.users.post('/users', {
        body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com'
        })
    });
    console.log('New user:', newUser);

    console.log('Testing environment variable access...');
    const apiKey = fx.env.API_KEY;
    console.log('API Key:', apiKey);

    console.log('Testing local storage access...');
    fx.store.testItem = 'Test Value';
    console.log('Local Storage Item:', fx.store.testItem);

    console.log('Testing IndexedDB access...');
    fx.db.testItem = {
        key: 'value'
    };
    console.log('IndexedDB Item:', fx.db.testItem);

    console.log('FX features test completed successfully.');
} catch (error) {
    console.error('Error during FX features test:', error);
}