"use strict";
/// Модуль обеспечивающий работу рации
module.exports = {
    channelsUsers: [],
    clearAndRemove(player, channelNumber) {
        for (let i = 0; i < this.channelsUsers[channelNumber].length; i++) {
            if (!mp.players.exists(this.channelsUsers[channelNumber][i])) {
                this.channelsUsers[channelNumber].splice(i, 1);
                i--;
            }
            else {
                if (this.channelsUsers[channelNumber][i].id === player.id) {
                    this.channelsUsers[channelNumber].splice(i, 1);
                    i--;
                }
            }
        }
    },
};