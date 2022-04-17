"use strict"

let money = call("money");
let notifs = call("notifications");
let utils = call("utils");

module.exports = {
    // Символы, используемые в промокоде
    symbols: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
        "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W",
        "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ],
    // Длина промокода
    codeLength: 5,
    // Свободные промокоды
    codes: [],
    // Загружаемое кол-во промокодов за один раз
    codesCount: 100,
    // Кол-во минут на сервере для получения награды за промокод
    completedMinutes: 10 * 60,
    // Подарочные промокоды
    giftPromocodes: [],

    async init() {
        this.fillCodes();
        await this.loadGiftPromocodesFromDB();
    },
    async fillCodes() {
        var codes = [];
        for (var i = 0; i < this.codesCount; i++) {
            var code = this.generatePromocode(codes);
            codes.push(code);
        }
        this.codes = await this.getFreePromocodes(codes);
        console.log(`[PROMOCODES] Свободные промокоды загружены (${this.codes.length})`);
    },
    async getPromocode() {
        if (!this.codes.length) await this.fillCodes();

        return this.codes.shift();
    },
    generatePromocode(codes) {
        var code = "";
        while (true) {
            for (var i = 0; i < this.codeLength; i++) {
                var rand = utils.randomInteger(0, this.symbols.length - 1);
                code += this.symbols[rand];
            }
            if (!codes.includes(code)) break;
        }
        return code;
    },
    async getFreePromocodes(codes) {
        var list = await db.Models.Promocode.findAll({
            attributes: ["promocode"],
            where: {
                promocode: codes
            }
        });
        list.forEach(promocode => {
            var i = codes.indexOf(promocode.promocode);
            if (i != -1) codes.splice(i, 1);
        });

        return codes;
    },
    async activate(player, code) {
        code = code.toUpperCase();
        var header = `Активация промокода`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (player.character.Promocode.promocode == code) return out(`Нельзя активировать свой промокод`);

        // подарочный промкод
        var giftPromocode = this.giftPromocodes.find(x => x.promocode == code);
        if (giftPromocode) {
            this.activateGift(player, giftPromocode);
            return;
        }

        var promocode = await db.Models.Promocode.findOne({
            where: {
                promocode: code
            },
            include: [{
                    attributes: ["accountId"],
                    model: db.Models.Character,
                },
                db.Models.PromocodeReward,
            ]
        });
        if (player.character.inviterId) return out(`Вы уже активировали реферальный промокод`);
        if (!promocode) return out(`Промокод ${code} не найден`);
        if (promocode.Character.accountId == player.account.id) return out(`Нельзя активировать промокод от своего аккаунта`);
        var minutes = parseInt((Date.now() - player.authTime) / 1000 / 60) + player.character.minutes;
        if (minutes > this.completedMinutes) return out(`Вы уже проиграли более ${this.completedMinutes} минут`);

        player.character.inviterId = promocode.characterId;
        player.character.save();

        promocode.invited++;
        promocode.save();

        mp.events.call("player.promocode.activated", player, promocode);
        notifs.success(player, `Промокод активирован`, header);
    },
    activateGift(player, giftPromocode) {
        switch (giftPromocode.rewardId) {
            case 1: // выдача наличных
                var count = giftPromocode.data.count;
                money.addCash(player, count, (res) => {
                    if (!res) return notifs.error(player, `Ошибка начисления наличных`);

                    var i = this.giftPromocodes.indexOf(giftPromocode);
                    if (i != -1) this.giftPromocodes.splice(i, 1);
                    giftPromocode.destroy();
                    notifs.success(player, `Подарочный промокод на наличные средства активирован`);
                }, `Подарочный промокод ${giftPromocode.promocode} на выдачу наличных`);
                break;
            default:
                return notifs.error(player, `Неизвестный тип подарка`);
        }
    },
    async check(player) {
        var minutes = parseInt((Date.now() - player.authTime) / 1000 / 60) + player.character.minutes;
        if (minutes < this.completedMinutes) return;
        if (player.character.inviteCompleted) return;
        if (!player.character.inviterId) return;

        var inviter = mp.players.getBySqlId(player.character.inviterId);
        var promocode;
        if (inviter) {
            promocode = inviter.character.Promocode;
        } else {
            promocode = await db.Models.Promocode.findOne({
                where: {
                    characterId: player.character.inviterId
                },
                include: db.Models.PromocodeReward
            });
            inviter = player.character.inviterId;
        }
        if (!promocode) return debug(`${player.name} выполнил условия промокода, но промокод не найден. Возможно, персонаж пригласившего был удален.`);
        if (promocode.invited <= promocode.completed) return debug(`Промокод #${promocode.id} имеет >= выполнивших`);
        var reward = promocode.PromocodeReward;

        money.addMoney(player, reward.playerSum, (res) => {
            if (!res) return debug(`Ошибка начисления в банк игроку ${player.name} при выполнии условий промокода`);


            money.addMoney(inviter, reward.ownerSum, (res) => {
                if (!res) return debug(`Ошибка начисления в банк пригласившему #${player.character.inviterId} при выполнии условий промокода`);

                promocode.completed++;
                promocode.save();
                player.character.inviteCompleted = 1;
                player.character.save();

                if (typeof inviter != 'number') {
                    mp.events.call("player.completed.changed", inviter);
                }
                notifs.success(inviter, `Получена награда за ${player.name} $${reward.ownerSum}`);
                notifs.success(player, `Получена награда за выполнение условий промокода $${reward.playerSum}`);
            }, `Награда за приглашенного игрока ${player.name}`);
        }, `Награда за выполнение условий промокода ${(typeof inviter == 'number')? inviter : inviter.name}`);

    },
    async loadGiftPromocodesFromDB() {
        this.giftPromocodes = await db.Models.GiftPromocode.findAll();

        console.log(`[PROMOCODES] Подарочные промокоды загружены (${this.giftPromocodes.length} шт.)`);
    },
};
