// manifest.js
export default function createManifest(fx) {
    return {
        api: () => fx.load({
            type: "object",
            path: "./manifest/api.js"
        }),
        assets: () => fx.load({
            type: "object",
            path: "./manifest/assets.js"
        }),
        config: () => fx.load({
            type: "object",
            path: "./manifest/config.js"
        }),
        data: () => fx.load({
            type: "object",
            path: "./manifest/data.js"
        }),
        db: () => fx.load({
            type: "object",
            path: "./manifest/db.js"
        }),
        modules: () => fx.load({
            type: "object",
            path: "./manifest/modules.js"
        }),
        routes: () => fx.load({
            type: "object",
            path: "./manifest/routes.js"
        }),
        tools: () => fx.load({
            type: "object",
            path: "./manifest/tools.js"
        }),
        views: () => fx.load({
            type: "object",
            path: "./manifest/views.js"
        })
    };
 }