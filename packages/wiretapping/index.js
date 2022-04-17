"use strict";

let notify;


/// Модуль обеспечивающий работу прослушки
module.exports = {
    init() {
        notify = call("notifications");
    },
    add(player, listenerId) {
        if (listenerId === player.id) {
            mp.players.at(listenerId).call("wiretapping.result", [false]);
            return notify.error(mp.players.at(listenerId), `Нельзя установить прослушку на свой номер`, "Прослушка");
        }

        if (mp.players.at(listenerId).wiretappingControl == null) {
            mp.players.at(listenerId).wiretappingControl = {
                listen: [player.id]
            };
        } else {
            mp.players.at(listenerId).wiretappingControl.listen.push(player.id);
        }

        if (player.wiretapping == null) {
            player.wiretapping = {
                listenersId: [listenerId]
            };
        } else {
            player.wiretapping.listenersId.push(listenerId);
        }
        notify.info(mp.players.at(listenerId), `Прослушка подключена`, "Прослушка");
    },
    remove(player, currentListenerId) {
        let listenerIdIndex = player.wiretapping.listenersId.findIndex(listenerId => listenerId === currentListenerId);
        if (listenerIdIndex !== -1) {
            player.wiretapping.listenersId.splice(listenerIdIndex, 1);
            notify.info(mp.players.at(currentListenerId), `Прослушка отключена`, "Прослушка");
        }
        if (player.wiretapping.listenersId.length === 0) {
            player.wiretapping = null;
        }

        let targetIdIndex = mp.players.at(currentListenerId).wiretappingControl.listen.findIndex(target => target === player.id);
        if (targetIdIndex !== -1) {
            mp.players.at(currentListenerId).wiretappingControl.listen.splice(targetIdIndex, 1);
        }
        if (mp.players.at(currentListenerId).wiretappingControl.listen.length === 0) {
            mp.players.at(currentListenerId).wiretappingControl = null;
        }
    },
    callStart(target, subTarget) {
        target.wiretapping.listenersId.forEach(listenerId => {
            if (mp.players.exists(target)) mp.players.at(listenerId).call('voiceChat.connect', [target.id, 'phone']);
            if (mp.players.exists(subTarget)) mp.players.at(listenerId).call('voiceChat.connect', [subTarget.id, 'phone']);
            notify.info(mp.players.at(listenerId), `Человеку с номером телефона ${target.phone.number} поступил звонок`, "Прослушка");
        });
    },
    callEnd(target, subTarget) {
        target.wiretapping.listenersId.forEach(listenerId => {
            if (mp.players.exists(target)) mp.players.at(listenerId).call('voiceChat.disconnect', [target.id, 'phone']);
            if (mp.players.exists(subTarget)) mp.players.at(listenerId).call('voiceChat.disconnect', [subTarget.id, 'phone']);
            notify.info(mp.players.at(listenerId), `У человека с номером телефона ${target.phone.number} окончен звонок`, "Прослушка");
        });
    }
};