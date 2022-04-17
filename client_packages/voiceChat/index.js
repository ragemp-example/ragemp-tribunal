"use strict";

mp.voiceChat.muted = true;
mp.events.add('characterInit.done', function() {
    mp.keys.bind(0x4E, true, function() { // N
        if (mp.game.ui.isPauseMenuActive()) return;
        if (mp.busy.includes(['chat', 'terminal'])) return;
        if (!mp.busy.add('voicechat', false)) return;
        if (mp.chat.clearMuteTime) {
            if (mp.chat.clearMuteTime < Date.now()) {
                mp.chat.clearMuteTime = 0;
                mp.notify.success(`Использование чатов снова доступно. Не нарушайте правила сервера.`, `MUTE`);
                mp.events.callRemote(`chat.mute.clear`);
                mp.events.call("hud.setData", {
                    mute: false
                });
            } else {
                let mins = Math.ceil((mp.chat.clearMuteTime - Date.now()) / 1000 / 60);
                return mp.notify.error(`До разблокировки войс-чата осталось ${mins} мин!`);
            }
        }
        mp.voiceChat.muted = false;
        mp.callCEFV("hud.voice = true");
        playVoiceAnimation(mp.players.local);
    });

    mp.keys.bind(0x4E, false, function() { // N
        if (mp.game.ui.isPauseMenuActive()) return;
        mp.voiceChat.muted = true;
        mp.callCEFV("hud.voice = false");
        mp.busy.remove('voicechat');
    });

    mp.keys.bind(0x73, false, function() { // F4
        if (!mp.voiceChat.muted) return mp.notify.error("Отпустите клавишу N", "Голосовой чат");
        mp.voiceChat.cleanupAndReload(true, true, true);
        mp.notify.success("Голосовой чат был перезагружен", "Голосовой чат");
    });
});


mp.speechChannel = {};

let listeners = [];
let channels = {};
let remoteListeners = [];

/// Добавить канал связи с требуемыми настройками
/// maxRange = 0 - на любой дистанции volume = 1
/// autoConnection будет ли автоматически подключаться/отключаться
mp.speechChannel.addChannel = (name, maxRange = 0, autoConnection = false, use3d = false, voiceVolume = 1.0, connectAnother = false) => {
    channels[name] = {
        "maxRange": maxRange,
        "autoConnection": autoConnection,
        "use3d": use3d,
        "voiceVolume": voiceVolume,
        "connectAnother": connectAnother,
    };
};

mp.speechChannel.setVoiceVolumeChannel = (name, volumeLevel) => {
    channels[name].voiceVolume = volumeLevel;
    for (let i = 0; i < listeners.length; i++) {
        updateCurrent(mp.players.atRemoteId(listeners[i].playerId), i, name);
    }
};

mp.speechChannel.setAutoConnectionChannel = (name, status) => {
    channels[name].autoConnection = status;
    if (channels[name].connectAnother && !status) {
        remoteListeners.forEach(remoteListener => mp.events.callRemote('voiceChat.disconnect', remoteListener, name));
        remoteListeners = [];
    }
};

/// Подключить выбранного игрока к каналу связи
mp.speechChannel.connect = (player, channel) => {
    if (player == null) return;
    if (player.remoteId === mp.players.local.remoteId) return;
    let index = listeners.findIndex(x => x.playerId === player.remoteId);
    if (index !== -1) {
        if (!listeners[index].channels.includes(channel)) {
            listeners[index].channels.push(channel);
            updateCurrent(player, index, channel);
        } else {
            return;
        }
    } else {
        listeners.push({
            "playerId": player.remoteId,
            "current": channel,
            "available": null,
            "channels": [channel],
        });
        mp.events.callRemote("voiceChat.add", player);
        player.voice3d = channels[channel].use3d;
    }
};
mp.events.add("voiceChat.connect", (playerId, channel) => {
    mp.speechChannel.connect(mp.players.atRemoteId(playerId), channel);
});

/// Отключить выбранного игрока от канала связи
mp.speechChannel.disconnect = (player, channel, isSend = false) => {
    if (player == null) return;
    if (player.remoteId === mp.players.local.remoteId) return;
    let index = listeners.findIndex(x => x.playerId === player.remoteId);
    if (index === -1) return;
    if (channel == null) {
        listeners.splice(index, 1);
    } else {
        let channelIndex = listeners[index].channels.findIndex(x => x == channel);
        if (channelIndex !== -1) {
            listeners[index].channels.splice(channelIndex, 1);
        }
        if (listeners[index].channels.length === 0) {
            listeners.splice(index, 1);

            if (!remoteListeners.includes(player.remoteId)) {
                mp.events.callRemote("voiceChat.remove", player);
            }
        } else {
            updateCurrent(player, index);
        }
    }
    if (channel == null && isSend) {
        mp.events.callRemote("voiceChat.remove", player);
    }
};
mp.events.add("voiceChat.disconnect", (playerId, channel) => {
    mp.speechChannel.disconnect(mp.players.atRemoteId(playerId), channel);
});


mp.events.add("voiceChat.disconnected", (playerId, channel) => {
    if (remoteListeners.includes(playerId)) {
        let remoteListenerIndex = remoteListeners.findIndex(x => x === playerId);
        remoteListeners.splice(remoteListenerIndex, 1);
    }
});

let updateCurrent = function(player, index, newCh) {
    let currentChannel = null;
    let availableChannel = null;
    for (let i = 0, max = -1, voiceVolume = -1; i < listeners[index].channels.length; i++) {
        if (channels[listeners[index].channels[i]].maxRange === 0) {
            if (channels[listeners[index].channels[i]].voiceVolume === 1.0) {
                currentChannel = listeners[index].channels[i];
                availableChannel = null;
                player.voice3d = channels[currentChannel].use3d;
                break;
            } else if (channels[listeners[index].channels[i]].voiceVolume > voiceVolume) {
                if (currentChannel != null && channels[currentChannel].maxRange !== 0) availableChannel = currentChannel;
                currentChannel = listeners[index].channels[i];
                voiceVolume = channels[listeners[index].channels[i]].voiceVolume;
            }
        } else {
            if (channels[listeners[index].channels[i]].maxRange > max) {
                if (voiceVolume === -1) {
                    currentChannel = listeners[index].channels[i];
                    max = channels[listeners[index].channels[i]].maxRange;
                } else {
                    availableChannel = listeners[index].channels[i];
                    max = channels[listeners[index].channels[i]].maxRange;
                }
            }
        }
    }
    listeners[index].current = currentChannel;
    listeners[index].available = availableChannel;

    if (!availableChannel) player.voice3d = channels[currentChannel].use3d;
};


mp.speechChannel.addChannel("voice", 10, true, true);
/// Обработчик изменения состояния игроков для изменения состояния голосовой связи
mp.timer.addInterval(() => {
    /// Автоматическое подключение к заданным каналам всех игроков в зоне стрима
    mp.players.forEachInStreamRange(player => {
        if (player.remoteId !== mp.players.local.remoteId && mp.players.local.dimension === player.dimension) {
            let dist = mp.game.system.vdist(player.position.x, player.position.y, player.position.z,
                mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z);
            for (let key in channels) {
                if (channels[key].autoConnection) {
                    if (dist <= channels[key].maxRange) {
                        if (!channels[key].connectAnother) {
                            mp.speechChannel.connect(player, key);
                        } else {
                            if (!remoteListeners.includes(player.remoteId)) {
                                mp.events.callRemote('voiceChat.connect', player.remoteId, key);
                                remoteListeners.push(player.remoteId);
                            } // else {
                            //     player.voiceVolume = 0;
                            // }
                        }
                    }
                }
            }
        }
    });
    /// Автоматическое отключение заданных каналов всех игроков
    for (let i = 0; i < listeners.length; i++) {
        let player = mp.players.atRemoteId(listeners[i].playerId);
        if (player == null) return;

        let dist = mp.game.system.vdist(player.position.x, player.position.y, player.position.z,
            mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z);

        if (channels[listeners[i].current].maxRange !== 0) {
            if (dist > channels[listeners[i].current].maxRange || player.dimension !== mp.players.local.dimension) {
                if (channels[listeners[i].current].connectAnother) mp.events.callRemote("voiceChat.disconnected", player.remoteId, listeners[i].current);
                mp.speechChannel.disconnect(player, listeners[i].current);
                i--;
            } else {
                player.voiceVolume = 1 - (dist / channels[listeners[i].current].maxRange);
            }
        } else {
            if (listeners[i].available != null) {
                if (channels[listeners[i].current].voiceVolume >= (1 - (dist / channels[listeners[i].available].maxRange))) {
                    player.voiceVolume = channels[listeners[i].current].voiceVolume;
                    if (player.voice3d !== channels[listeners[i].current].use3d) player.voice3d = channels[listeners[i].current].use3d;
                } else {
                    if (dist > channels[listeners[i].available].maxRange || player.dimension !== mp.players.local.dimension) {
                        if (channels[listeners[i].available].connectAnother) mp.events.callRemote("voiceChat.disconnected", player.remoteId, listeners[i].current);
                        mp.speechChannel.disconnect(player, listeners[i].available);
                        i--;
                    } else {
                        player.voiceVolume = 1 - (dist / channels[listeners[i].available].maxRange);
                        if (player.voice3d !== channels[listeners[i].current].use3d) player.voice3d = channels[listeners[i].available].use3d;
                    }
                }
            } else {
                player.voiceVolume = channels[listeners[i].current].voiceVolume;
            }
        }
    }
}, 300);


mp.events.add("playerQuit", (player) => {
    if (player.remoteId !== mp.players.local.remoteId) {
        mp.speechChannel.disconnect(player, null);
    }
});

mp.events.add("playerDeath", (player) => {
    if (player.remoteId === mp.players.local.remoteId) {
        while (listeners.length !== 0) {
            mp.events.callRemote("voiceChat.remove", mp.players.atRemoteId(listeners[0].playerId));
            listeners.splice(0, 1);
        }
    } else {
        mp.speechChannel.disconnect(player, null, true);
    }
});

mp.timer.addInterval(() => {
    mp.players.forEachInStreamRange((player) => {
        if (player == mp.players.local || mp.vdist(mp.players.local.position, player.position) > 20) return;
        if (player.isVoiceActive) playVoiceAnimation(player);
    });
}, 250);

function playVoiceAnimation(player) {
    player.playFacialAnim("mic_chatter", "mp_facial");
}
