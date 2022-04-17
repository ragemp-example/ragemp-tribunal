"use strict";
let radio = require("./index.js");
/// Сервисные события
module.exports = {
    /// Событие инициализации сервера
    "init": async () => {
        for (let i = 0; i < 100; i++) {
            radio.channelsUsers.push([]);
        }
        inited(__dirname);
    },
    "radioSet.connect": (player, channelNumber) => {
        if (!mp.players.exists(player)) return;
        radio.channelsUsers[channelNumber].forEach(user => {
            player.call('voiceChat.connect', [user.id, 'radio' + channelNumber]);
            if (!mp.players.exists(user)) return;
            user.call('voiceChat.connect', [player.id, 'radio' + channelNumber]);
        });
        radio.channelsUsers[channelNumber].push(player);
    },
    "radioSet.disconnect": (player, channelNumber) => {
        if (!mp.players.exists(player)) return;
        radio.channelsUsers[channelNumber].forEach(user => {
            player.call('voiceChat.disconnect', [user.id, 'radio' + channelNumber]);
            if (!mp.players.exists(user)) return;
            user.call('voiceChat.disconnect', [player.id, 'radio' + channelNumber]);
        });
        radio.clearAndRemove(player, channelNumber);
    },
    'playerQuit': player => {
        for (let j = 0; j < radio.channelsUsers.length; j++) {
            radio.clearAndRemove(player, j);
        }
    },
};