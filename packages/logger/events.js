const logger = require('./index');

module.exports = {
    "init": async () => {
        await logger.serviceInit();
        inited(__dirname);
    },
    "logger.log": (player, text, moduleName = null) => {
        logger.log(text, moduleName, player);
    },
    "logger.debug": (player, text, moduleName = null) => {
        logger.debug(text, moduleName, player);
    },
}