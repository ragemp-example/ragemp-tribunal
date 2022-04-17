let objeditor = require('./index');

/// Модуль системы объектов
module.exports = {
    /// Событие инициализации сервера
    "init": async () => {
        await objeditor.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        objeditor.initAll(player);
    },
    "objeditor.move": (player, type, axis, value) => {
        if (player.objeditor) {
            objeditor.move(player.objeditor, type, axis, value);
        } else {
            player.call('objeditor.bind', [false]);
        }
    },
};