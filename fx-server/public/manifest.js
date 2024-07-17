// manifest.js
export default function createManifest(fx) {
    return {
        routes: () => fx.load({
            type: "object",
            path: "./manifest/routes.js"
        }),
        assets: () => fx.load({
            type: "object",
            path: "./manifest/assets.js"
        }),
        modules: () => fx.load({
            type: "object",
            path: "./manifest/modules.js"
        }),
        views: () => fx.load({
            type: "object",
            path: "./manifest/views.js"
        }),
        api: () => fx.load({
            type: "object",
            path: "./manifest/api.js"
        }),
        data: () => fx.load({
            type: "object",
            path: "./manifest/data.js"
        }),
        db: () => fx.load({
            type: "object",
            path: "./manifest/db.js"
        }),
        ai: () => fx.load({
            type: "object",
            path: "./manifest/ai.js"
        }),
        tools: () => fx.load({
            type: "object",
            path: "./manifest/tools.js"
        }),
        comms: () => fx.load({
            type: "object",
            path: "./manifest/comms.js"
        })
    };
 }