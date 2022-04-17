mp.events.add({
    "logger.log": (text, moduleName) => {
        mp.events.callRemote('logger.log', text, moduleName);
    },
    "logger.debug": (text, moduleName) => {
        mp.events.callRemote('logger.debug', text, moduleName);
    },
});