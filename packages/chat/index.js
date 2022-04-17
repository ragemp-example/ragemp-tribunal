"use strict";
/// Модуль чата, с историей сообщений, тегами и процессами

module.exports = {
    push(player, text) {
        player.call('chat.message.push', [`${text}`]);
    },
    broadcast(text) {
        mp.players.forEach(rec => {
            if (!rec.character) return;
            this.push(rec, text);
        });
    },
    splitBroadcast(message, fixed, color) {
        mp.players.forEach(current => {
            if (!current.character) return;
            current.call('chat.message.split', [message, fixed, color]);
        });
    },
    setMute(player, time) {
        player.mute = {
            startTime: Date.now(),
            time: time
        };
        player.call(`chat.mute.set`, [time]);
    },
};
