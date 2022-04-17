"use strict";
let peaceZones = require('./index');

let notifications = call('notifications');

module.exports = {
    "init": () => {
        peaceZones.init();
        inited(__dirname);
    },
    "peaceZones.add": (player, info) => {
        info = JSON.parse(info);
        peaceZones.add(info.x, info.y, info.z, info.dx, info.dy, info.dz);
    },
    "peaceZones.remove": (player, id) => {
        id = JSON.parse(id);
        if (id != null) {
            peaceZones.remove(player, id);
            notifications.info(player, "Зеленая зона удалена", "Удаление peace zone");
        }
        else {
            notifications.info(player, "Вы не находитесь в зеленой зоне", "Удаление peace zone");
        }
    },
    "playerEnterColshape": (player, shape) => {
        if (shape.zoneId) {
            notifications.info(player, "Вы вошли в зеленую зону", "Зеленая зона");
            player.call("peaceZones.inside", [shape.zoneId]);
        }
    },
    "playerExitColshape": (player, shape) => {
        if (shape.zoneId) {
            notifications.info(player, "Вы вышли из зеленой зоны", "Зеленая зона");
            player.call("peaceZones.inside", [null]);
        }
    },

}
