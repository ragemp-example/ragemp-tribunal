"use strict";
let wiretapping = require("./index.js");

let phone;
let notify;

/// Сервисные события
module.exports = {
    "init": async () => {
        phone = call("phone");
        notify = call("notifications");

        wiretapping.init();
        inited(__dirname);
    },
    "wiretapping.add": (player, phoneNumber) => {
        if (!phone.isExists(phoneNumber)) {
            player.call("wiretapping.result", [false]);
            return notify.error(player, `Человека с таким номером не существует`, "Прослушка");
        }
        let target = phone.findPlayerByPhoneNumber(phoneNumber);
        if (target == null) {
            player.call("wiretapping.result", [false]);
            return notify.error(player, `Человек с таким номером вне зоны действия сети`, "Прослушка");
        }
        wiretapping.add(target, player.id);
    },
    "wiretapping.remove": (player, phoneNumber) => {
        if (!phone.isExists(phoneNumber)) {
            player.call("wiretapping.result", [false]);
            return notify.error(player, `Человека с таким номером не существует`, "Прослушка");
        }
        let target = phone.findPlayerByPhoneNumber(phoneNumber);
        if (target == null) {
            player.call("wiretapping.result", [false]);
            return notify.error(player, `Человек с таким номером вне зоны действия сети`, "Прослушка");
        }
        wiretapping.remove(target, player.id);
    },
    "playerQuit": player => {
        if (player.wiretapping != null) {
            player.wiretapping.listenersId.forEach(listenerId => {
                mp.players.at(listenerId).call("wiretapping.result", [false]);
                notify.error(player, `Человек с номером ${player.phone.number} пропал из сети`, "Прослушка");

                wiretapping.remove(player, listenerId);
            });
        }
        if (player.wiretappingControl != null) {
            player.wiretappingControl.listen.forEach(target => {
                wiretapping.remove(mp.players.at(target), player.id);
            });
        }
    },
};