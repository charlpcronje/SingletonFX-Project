import fx from './fx.js'; // Import the class
const fx = new FX(); // Create an instance
import createManifest from './manifest.js';

async function initializeApp() {
    await fx.initialize(createManifest(fx));
    console.log('FX app initialized');
}

initializeApp().catch(console.error);