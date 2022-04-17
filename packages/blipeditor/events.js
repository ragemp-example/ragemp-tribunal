let blipeditor = require('./index');

/// Модуль системы объектов
module.exports = {
    /// Событие инициализации сервера
    "init": async () => {
        await blipeditor.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        blipeditor.initAll(player);
    },
};