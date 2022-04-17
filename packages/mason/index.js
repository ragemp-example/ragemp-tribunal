"use strict";

let inventory = call('inventory');
let jobs = call('jobs');
let money = call('money');
let notifs = call('notifications');
let timer = call('timer');
let utils = call('utils');

module.exports = {
    // Позиция каменоломни
    storagePos: new mp.Vector3(2601.23388671875, 2803.470458984375, 33.82036590576172 - 1),
    sellPos: new mp.Vector3(451.2948913574219, -3078.302734375, 6.0696330070495605 - 1),
    // Снаряжение каменоломни
    items: [{
        itemId: 136,
        params: {
            health: 100,
        },
        price: 100
    }],
    // Урон по каменной породе
    rockDamage: 10,
    // Урон по кирке
    pickDamage: 1,
    // Стоимость продажи камня
    rockPrice: 10,
    // Опыт скилла за добычу камня из породы
    exp: 0.05,
    // Прибавка к цене предмета в % (0.0-1.0) при фулл скилле
    priceBonus: 0.5,
    // Время, через которое у каменной породы пополнится ХП
    respawnRockTime: 30 * 60 * 1000,

    async init() {
        this.createStorageMarker();
        this.createSellMarker();
    },
    createStorageMarker() {
        var pos = this.storagePos;
        var marker = mp.markers.new(1, pos, 0.5, {
            color: [54, 184, 255, 70]
        });
        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
        colshape.onEnter = (player) => {
            var data = {
                itemPrices: this.getItemPrices(),
                rockPrice: this.rockPrice
            };
            player.call(`mason.storage.inside`, [data]);
            player.masonStorage = marker;
        };
        colshape.onExit = (player) => {
            player.call(`mason.storage.inside`);
            delete player.masonStorage;
        };
        marker.colshape = colshape;
        mp.blips.new(618, pos, {
            color: 22,
            name: `Каменоломня`,
            shortRange: 10,
            scale: 1
        });
    },
    createSellMarker() {
        var pos = this.sellPos;
        var marker = mp.markers.new(1, pos, 0.5, {
            color: [54, 184, 255, 70]
        });
        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
        colshape.onEnter = (player) => {
            var data = {
                rockPrice: this.rockPrice
            };
            player.call(`mason.sell.inside`, [data]);
            player.masonSell = marker;
        };
        colshape.onExit = (player) => {
            player.call(`mason.sell.inside`);
            delete player.masonSell;
        };
        marker.colshape = colshape;
        mp.blips.new(108, pos, {
            color: 22,
            name: `Сбыт камня`,
            shortRange: 10,
            scale: 1
        });
    },
    getItemPrices() {
        var prices = this.items.map(x => x.price);
        return prices;
    },
    buyItem(player, index) {
        var header = 'Каменщик';
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.masonStorage) return out(`Вы не у каменоломни`);

        index = Math.clamp(index, 0, this.items.length - 1);
        var item = this.items[index];
        if (player.character.cash < item.price) return out(`Необходимо $${item.price}`);

        var cantAdd = inventory.cantAdd(player, item.itemId, item.params);
        if (cantAdd) return out(cantAdd);

        money.removeCash(player, item.price, (res) => {
            if (!res) out(`Ошибка списания наличных`);
        }, `Покупка предмета #${item.itemId} на каменоломне`);

        inventory.addItem(player, item.itemId, item.params, (e) => {
            if (e) notifs.error(player, e);
        });

        notifs.success(player, `Вы приобрели ${inventory.getName(item.itemId)}`);
    },
    sellItems(player) {
        var header = 'Порт';
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.masonSell) return out(`Вы не у точки сбыта`);

        var items = inventory.getArrayByItemId(player, 135);
        if (!items.length) return out(`Вы не имеете ресурсы`);

        var exp = jobs.getJobSkill(player, 9).exp;
        var pay = items.length * this.rockPrice;
        pay *= (1 + this.priceBonus * (exp / 100));
        money.addCash(player, pay * jobs.bonusPay, (res) => {
            if (!res) out(`Ошибка начисления наличных`);

            items.forEach(item => inventory.deleteItem(player, item));

        }, `Продажа ${items.length} ед. камня x${jobs.bonusPay}`);

        notifs.success(player, `Продано ${items.length} ед. камня`, header);
    },
    hitRock(player, colshape) {
        var header = `Каменщик`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var pick = inventory.getHandsItem(player);
        if (!pick || pick.itemId != 136) return out(`Возьмите в руки кирку`);

        var health = inventory.getParam(pick, 'health');
        if (!health || health.value <= 0) return out(`Кирка сломана`);
        if (colshape.health <= 0) return out(`Каменная порода исчерпала свой ресурс`);

        health.value = Math.clamp(health.value - this.pickDamage, 0, 100);
        inventory.updateParam(player, pick, 'health', health.value);


        var damage = parseInt(this.rockDamage * this.getInventoryDamageBoost(player.inventory.items));

        colshape.health = Math.clamp(colshape.health - damage, 0, 100);

        mp.players.forEachInRange(colshape.db.pos, colshape.db.radius * 2, rec => {
            if (!rec.character) return;
            rec.call(`mason.rock.health`, [colshape.health]);
        });

        if (!colshape.health) {
            colshape.destroyTime = Date.now();
            player.call(`mason.items.request`);
            this.addJobExp(player);
        }
    },
    addRockItems(colshape, slots) {
        var params = {
            // name: colshape.tree.name
        };
        slots.splice(0, utils.randomInteger(0, slots.length - 1));
        slots.forEach(slot => {
            inventory.addGroundItem(135, params, slot);
        });
    },
    getInventoryDamageBoost(list) {
        var items = inventory.getItemsByParams(list, null, 'rockDamage', null).filter(x => !x.parentId);
        var boost = 0;
        items.forEach(item => {
            var rockDamage = inventory.getParam(item, 'rockDamage').value;
            boost += rockDamage;
        });
        return 1 + (boost / 100);
    },
    addJobExp(player) {
        var skill = jobs.getJobSkill(player, 9);
        jobs.setJobExp(player, skill, skill.exp + this.exp);
    },
};
