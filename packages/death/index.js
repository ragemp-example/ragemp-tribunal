"use strict";

module.exports = {
    // Кол-во ХП у лежачего игрока
    health: 50,
    // Список ID персонажей присмерти, которые вышли с сервера
    knockedList: [],

    addKnocked(player, time = 5 * 60 * 1000) {
        if (mp.players.exists(player)) player.setVariable("knocked", time);
        if (!player.character) return;
        if (this.knockedList.includes(player.character.id)) return;
        player.isCustomDeath = false;
        this.knockedList.push(player.character.id);
    },
    removeKnocked(player) {
        if (mp.players.exists(player)) {
            player.setVariable("knocked", null);
            player.isCustomDeath = false;
            mp.events.call(`mapCase.ems.calls.remove`, player, player.character.id);
        }
        var i = this.knockedList.indexOf(player.character.id);
        if (i != -1) this.knockedList.splice(i, 1);
    }
};
