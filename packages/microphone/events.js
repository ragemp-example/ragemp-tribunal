let microphone = require('./index');

/// Модуль системы объектов
module.exports = {
    /// Событие инициализации сервера
    "init": async () => {
        await microphone.init();
        inited(__dirname);
    },
    "playerEnterColshape": (player, shape) => {
        if (!shape.isMicrophone) return;
        player.call("microphone.enter", []);
    },
    "playerExitColshape": (player, shape) => {
        if (!shape.isMicrophone) return;
        player.call("microphone.exit", []);
    },
};