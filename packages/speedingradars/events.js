let speedingradars = require('./index');

let notifs = call("notifications");

/// Модуль системы шипов
module.exports = {
    /// Событие инициализации сервера
    "init": () => {
        speedingradars.init();
        inited(__dirname);
    },
    "speedingradars.create": (player, speedLimit) => {
        speedingradars.create(player, speedLimit);
    },
    "speedingradars.remove": (player) => {
        speedingradars.remove(player);
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;

        if (shape.speedingradarObj != null) {
            if (player.speedingradarObj === shape.speedingradarObj) {
                speedingradars.remove(player);
                notifs.info(player, "Вы слишком далеко отошли от радара и он был уничтожен", "Радар");
            }
        }
    },
    "speedingradars.check": (player, speed, speedLimit, copId) => {
        speedingradars.check(player, speed, speedLimit, copId);
    },
    "playerQuit": (player) => {
        if (!player.character) return;
        if (player.speedingradarObj == null) return;

        speedingradars.remove(player);
    },
};