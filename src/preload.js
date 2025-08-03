const { contextBridge, desktopCapturer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    getScreenResources: async () => {
        const sources = await desktopCapturer.getSources({
            types: ["screen"]
        });
        return sources;
    }
});