/**
 * @file ./main.js
 * @description Main
 */

import fx from './fx.js'; 
import createManifest from './manifest.js';

async function initializeApp() {
    await fx.initialize(createManifest(fx));
    console.log('FX app initialized');
}

initializeApp().catch(console.error);