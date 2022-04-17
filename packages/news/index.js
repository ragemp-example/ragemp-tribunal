"use strict";

let chat = call('chat');
let notifs = call('notifications');

module.exports = {
    // Цена за 1 символ объявления
    symbolPrice: 5,
    // Коэффициент при начислении ЗП за объявление (adPrice * adPayK)
    adPayK: 0.3,
    // Анти-флуд на подачу объявления
    waitAddAd: 30 * 1000,
    // Кол-во боеприпасов, списываемое за выдачу формы
    clothesAmmo: 0,
    // Текущий прямой эфир
    liveStream: {
        ownerId: null, // тот, кто начал эфир
        memberIds: [], // члены эфира
    },
    // Дистанция прослушки эфира
    streamDist: 3,
    // Мин. ранг, который может начать эфир
    streamRank: 8,

    stream(player) {
        var header = `Эфир`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (this.liveStream.ownerId != null && this.liveStream.ownerId != player.id) return out(`Эфир занят другим редактором`);

        if (this.liveStream.ownerId == player.id) {
            this.liveStream.ownerId = null;
            this.liveStream.memberIds = [];
            chat.broadcast(`!{#bd7aff}[WN] ${player.name} завершил прямой эфир`);
        } else {
            this.liveStream.ownerId = player.id;
            this.liveStream.memberIds = [player.id];
            chat.broadcast(`!{#bd7aff}[WN] ${player.name} начал прямой эфир`);
        }
    },
    streamMember(player, rec) {
        if (this.liveStream.ownerId != player.id) return notifs.error(player, `Вы не ведете прямой эфир`);
        var i = this.liveStream.memberIds.indexOf(rec.id);
        if (i == -1) {
            this.liveStream.memberIds.push(rec.id);
            chat.broadcast(`!{#bd7aff}[WN] ${player.name} добавил ${rec.name} в прямой эфир`);
        } else {
            this.liveStream.memberIds.splice(i, 1);
            chat.broadcast(`!{#bd7aff}[WN] ${player.name} удалил ${rec.name} из прямого эфира`);
        }
    },
    streamHandle(player, text) {
        if (this.liveStream.ownerId == null) return;

        var owner = mp.players.at(this.liveStream.ownerId);
        if (!owner || !owner.character) return this.liveStream.ownerId = null;
        if (!this.liveStream.memberIds.includes(player.id)) return;
        if (player.dist(owner.position) > this.streamDist) return;

        chat.splitBroadcast(text, `!{#bd7aff}[WN] ${player.name}: `);
    },
    isInStream(player) {
        return this.liveStream.ownerId == player.id || this.liveStream.memberIds.includes(player.id);
    },
};
