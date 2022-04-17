"use strict";

let inventory = call('inventory');
let jobs = call('jobs');
let money = call('money');
let notifs = call('notifications');
let timer = call('timer');
let utils = call('utils');

module.exports = {
    // Позиция лесопилки
    storagePos: new mp.Vector3(-567.3698120117188, 5273.9111328125, 70.2374496459961 - 1),
    sellPos: new mp.Vector3(-19.214927673339844, -2640.1435546875, 6.032532215118408 - 1),
    // Снаряжение лесопилки
    items: [{
        itemId: 70,
        params: {
            health: 100,
            weaponHash: mp.joaat('weapon_hatchet'),
        },
        price: 100
    }],
    // Урон по дереву
    treeDamage: 10,
    // Урон по бревну
    logDamage: 25,
    // Урон по топору
    axDamage: 1,
    // Бревна на земле
    logObjects: [],
    // Стоимость продажи дерева
    treePrice: 10,
    // Опыт скилла за срубленное дерево/бревно
    exp: 0.05,
    // Прибавка к цене предмета в % (0.0-1.0) при фулл скилле
    priceBonus: 0.5,
    // Время, через которое у дерева пополнится ХП
    respawnTreeTime: 30 * 60 * 1000,

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
                treePrice: this.treePrice
            };
            player.call(`woodman.storage.inside`, [data]);
            player.woodmanStorage = marker;
        };
        colshape.onExit = (player) => {
            player.call(`woodman.storage.inside`);
            delete player.woodmanStorage;
        };
        marker.colshape = colshape;
        mp.blips.new(67, pos, {
            color: 81,
            name: `Лесопилка`,
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
                treePrice: this.treePrice
            };
            player.call(`woodman.sell.inside`, [data]);
            player.woodmanSell = marker;
        };
        colshape.onExit = (player) => {
            player.call(`woodman.sell.inside`);
            delete player.woodmanSell;
        };
        marker.colshape = colshape;
        mp.blips.new(108, pos, {
            color: 31,
            name: `Сбыт дерева`,
            shortRange: 10,
            scale: 1
        });
    },
    getItemPrices() {
        var prices = this.items.map(x => x.price);
        return prices;
    },
    buyItem(player, index) {
        var header = 'Дровосек';
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.woodmanStorage) return out(`Вы не у лесопилки`);

        index = Math.clamp(index, 0, this.items.length - 1);
        var item = this.items[index];
        if (player.character.cash < item.price) return out(`Необходимо $${item.price}`);

        var cantAdd = inventory.cantAdd(player, item.itemId, item.params);
        if (cantAdd) return out(cantAdd);

        money.removeCash(player, item.price, (res) => {
            if (!res) out(`Ошибка списания наличных`);
        }, `Покупка предмета #${item.itemId} на лесопилке`);

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
        if (!player.woodmanSell) return out(`Вы не у точки скупки`);

        var items = inventory.getArrayByItemId(player, 131);
        if (!items.length) return out(`Вы не имеете ресурсы`);

        var exp = jobs.getJobSkill(player, 7).exp;
        var pay = items.length * this.treePrice;
        pay *= (1 + this.priceBonus * (exp / 100));
        money.addCash(player, pay * jobs.bonusPay, (res) => {
            if (!res) out(`Ошибка начисления наличных`);

            items.forEach(item => inventory.deleteItem(player, item));

        }, `Продажа ${items.length} ед. дерева x${jobs.bonusPay}`);

        notifs.success(player, `Продано ${items.length} ед. дерева`, header);
    },
    hitTree(player, colshape) {
        var header = `Лесоруб`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var ax = inventory.getHandsItem(player);
        if (!this.isAx(ax)) return out(`Возьмите в руки топор`);

        var health = inventory.getParam(ax, 'health');
        if (!health || health.value <= 0) return out(`Топор сломан`);
        if (colshape.health <= 0) return out(`Дерево исчерпало свой ресурс`);

        health.value = Math.clamp(health.value - this.axDamage, 0, 100);
        inventory.updateParam(player, ax, 'health', health.value);


        var damage = parseInt(this.treeDamage * this.getInventoryDamageBoost(player.inventory.items));

        colshape.health = Math.clamp(colshape.health - damage, 0, 100);

        mp.players.forEachInRange(colshape.db.pos, colshape.db.radius, rec => {
            if (!rec.character) return;
            rec.call(`woodman.tree.health`, [colshape.health]);
        });

        if (!colshape.health) {
            colshape.destroyTime = Date.now();
            player.call(`woodman.log.request`);
            this.addJobExp(player);
        }
    },
    addLogObject(colshape, slot) {
        var obj = mp.objects.new('prop_fence_log_02', slot.pos, {
            rotation: slot.rot
        });
        var pos = obj.position;
        var logColshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 3);
        logColshape.onEnter = (player) => {
            if (player.vehicle) return;
            player.treeLog = logColshape;
            player.call(`woodman.log.inside`, [logColshape.squats, logColshape.obj.id]);
        };
        logColshape.onExit = (player) => {
            delete player.treeLog;
            player.call(`woodman.log.inside`);
        };
        logColshape.obj = obj;
        logColshape.tree = colshape.db;
        logColshape.squats = [100, 100, 100, 100, 100];

        obj.colshape = logColshape;
        obj.destroyTimer = timer.add(() => {
            try {
                if (!obj || !mp.objects.exists(obj)) return;

                obj.colshape.destroy();
                obj.destroy();
            } catch (e) {
                console.log(e);
            }
        }, inventory.groundItemTime);
    },
    hitLog(player, colshape, index) {
        var header = `Лесоруб`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var ax = inventory.getHandsItem(player);
        if (!this.isAx(ax)) return out(`Возьмите в руки топор`);

        var health = inventory.getParam(ax, 'health');
        if (!health || health.value <= 0) return out(`Топор сломан`);

        index = Math.clamp(index, 0, colshape.squats.length - 1);
        if (colshape.squats[index] <= 0) return out(`Перейдите к другой части бревна`);

        health.value = Math.clamp(health.value - this.axDamage, 0, 100);
        inventory.updateParam(player, ax, 'health', health.value);

        var damage = parseInt(this.logDamage * this.getInventoryDamageBoost(player.inventory.items));
        colshape.squats[index] = Math.clamp(colshape.squats[index] - damage, 0, 100);

        var obj = colshape.obj;
        mp.players.forEachInRange(obj.position, 3, rec => {
            if (!rec.character) return;
            rec.call(`woodman.log.health`, [obj.id, index, colshape.squats[index]]);
        });

        var allHealth = utils.arraySum(colshape.squats);
        if (!allHealth) {
            player.call(`woodman.items.request`);
            this.addJobExp(player);
        }
    },
    addLogItems(colshape, slots) {
        colshape.destroy();
        colshape.obj.destroy();

        var params = {
            name: colshape.tree.name
        };
        slots.forEach(slot => {
            inventory.addGroundItem(131, params, slot);
        });
    },
    getInventoryDamageBoost(list) {
        var items = inventory.getItemsByParams(list, null, 'treeDamage', null).filter(x => !x.parentId);
        var boost = 0;
        items.forEach(item => {
            var treeDamage = inventory.getParam(item, 'treeDamage').value;
            boost += treeDamage;
        });
        return 1 + (boost / 100);
    },
    addJobExp(player) {
        var skill = jobs.getJobSkill(player, 7);
        jobs.setJobExp(player, skill, skill.exp + this.exp);
    },
    isAx(item) {
        return item && [70, 76].includes(item.itemId);
    },
};
