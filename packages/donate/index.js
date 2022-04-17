"use strict";

let logger = call('logger');
let money = call('money');
let notifs = call('notifications');

module.exports = {
    // Кол-во наличных за 1 ед. доната
    convertCash: 100,
    // Стоимость смены ника
    nicknamePrice: 100,
    // Стоимость снятия варна
    clearWarnPrice: 75,
    // Стоимость открытия нового слота
    slotPrice: 500,
    // Макс. кол-во слотов
    slotsMax: 3,
    // Стоимость смены внешности
    changeAppearancePrice: 150,

    setDonate(player, donate, reason = "") {
        donate = parseInt(donate);

        var oldVal = player.account.donate;
        player.account.donate = donate;
        player.account.save();
        mp.events.call("player.donate.changed", player);
        var diff = donate - oldVal;
        if (diff > 0) diff = "+" + diff;
        logger.log(`${diff} TC | ${reason}`, `donate`, player);
    },
    convert(player, donate) {
        donate = parseInt(donate);

        var header = `Конвертация валюты`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (player.account.donate < donate) return out(`Необходимо ${donate} TC`);

        var cash = donate * this.convertCash;
        money.addCash(player, cash, (res) => {
            if (!res) return out(`Ошибка начисления на банк`);

            this.setDonate(player, player.account.donate - donate, `Конвертация валюты $${cash}`);
        }, `Конвертация валюты за ${donate} TC`);

        notifs.success(player, `Списано ${donate} TC`, header);
    },
    async setNickname(player, name) {
        var header = `Смена никнейма`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (player.account.donate < this.nicknamePrice) return out(`Необходимо ${this.nicknamePrice} TC`);

        // TODO: check nickname
        let reg = /^[A-z]{2,15} [A-z]{2,15}$/;
        if (!reg.test(name)) return out(`Имя и фамилия должны состоять из 2-15 латинских букв каждое`);

        var character = await db.Models.Character.findOne({
            attributes: ["id"],
            where: {
                name: name
            }
        });

        if (character) return out(`Никнейм ${name} занят`);

        var oldName = player.name;
        player.name = name;
        player.character.name = name;
        player.character.save();

        this.setDonate(player, player.account.donate - this.nicknamePrice, `Смена ника ${oldName}=>${player.name}`);
        notifs.success(player, `Никнейм персонажа изменен`, header);
        notifs.success(player, `Списано ${this.nicknamePrice} TC`, header);
        mp.events.call("player.name.changed", player, oldName);
        // player.kick();
    },
    clearWarn(player) {
        var header = `Снятие варна`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (player.account.donate < this.clearWarnPrice) return out(`Необходимо ${this.clearWarnPrice} TC`);
        if (!player.character.warnNumber) return out(`На персонаже нет варнов`);

        player.character.warnNumber--;
        player.character.save();
        mp.events.call("player.warns.changed", player);

        this.setDonate(player, player.account.donate - this.clearWarnPrice, `Снятие варна`);
        notifs.success(player, `Варн снят`, header);
        notifs.success(player, `Списано ${this.clearWarnPrice} TC`, header);
    },
    addSlot(player) {
        var header = `Добавление слота`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (player.account.slot >= this.slotsMax) return out(`Вы имеете максимальное количество слотов`);
        if (player.account.donate < this.slotPrice) return out(`Необходимо ${this.slotPrice} TC`);

        player.account.slots++;
        player.account.save();
        mp.events.call("player.slots.changed", player);

        this.setDonate(player, player.account.donate - this.slotPrice, `Добавление слота персонажа`);
        notifs.success(player, `Добавлен новый слот`, header);
        notifs.success(player, `Списано ${this.slotPrice} TC`, header);
    },
};
