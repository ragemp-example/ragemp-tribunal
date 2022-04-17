"use strict";
let voice = require("./index.js");
/// Сервисные события
module.exports = {
    "voiceChat.add": (player, target) => {
        if(target) {
            target.enableVoiceTo(player);
        }
    },
    "voiceChat.remove": (player, target) => {
        if(target) {
            target.disableVoiceTo(player);
        }
    },
    "voiceChat.connect": (player, targetId, channel) => {
        let target = mp.players.at(targetId);
        if (mp.players.exists(target)) {
            target.call("voiceChat.connect", [player.id, channel]);
        }
    },
    "voiceChat.disconnect": (player, targetId, channel) => {
        let target = mp.players.at(targetId);
        if (mp.players.exists(target)) {
            target.call("voiceChat.disconnect", [player.id, channel]);
        }
    },
    "voiceChat.disconnected": (player, targetId, channel) => {
        let target = mp.players.at(targetId);
        if (mp.players.exists(target)) {
            target.call("voiceChat.disconnected", [player.id, channel]);
        }
    },
};