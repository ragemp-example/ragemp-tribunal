"use strict";
let government = require('../government');
let factions = require('../factions');
let inventory = require('../inventory');
let logger = call('logger');
let money = call('money');
let notifs = require('../notifications');
let police = call('police');
let bizes = call('bizes');


module.exports = {
    "init": () => {
        government.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        if (!factions.isGovernmentFaction(player.character.factionId)) return;
        // player.call(`mapCase.init`, [player.name, player.character.factionId]);
        mp.events.call(`mapCase.gover.init`, player);
    },
    "government.storage.clothes.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад Government`);
        if (!factions.isGovernmentFaction(player.character.factionId)) return notifs.error(player, `Вы не из правительства`, `Склад Government`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        var minRank = faction.clothesRanks.find(x => x.clothesIndex == index);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        if (faction.ammo < government.clothesAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);
        if (player.inventory.items.length) return notifs.error(player, `Необходимо раздеться, чтобы надеть форму`, header);

        inventory.fullDeleteItemsByParams([6, 7, 8, 9, 10, 2, 14, 1], ["faction", "owner"], [character.factionId, character.id]);

        var hatParams, topParams, legsParams, feetsParams, earsParams, tiesParams, masksParams, glassesParams;
        if (character.gender == 0) { // муж.
            hatParams = { // prop 0
                sex: 1,
                variation: [-1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1][index]
            };
            topParams = { // clothes 11 / 3 / 8
                sex: 1,
                torso: // /clothes 3
                    [11, 11, 12, 11, 11][index],
                tTexture: [-1, -1, -1, -1, -1][index],
                variation: // clothes 11
                    [26, 21, 4, 25, 120][index],
                texture: [0, 0, 3, 0, 0][index],
                undershirt: // clothes 8
                    [130, 144, 25, 144, 144][index]
            };
            legsParams = { // clothes 4
                sex: 1,
                variation: [25, 25, 25, 28, 28][index],
                texture: [0, 0, 1, 8, 13][index]
            };
            feetsParams = { // clothes 6
                sex: 1,
                variation: [20, 20, 20, 21, 21][index],
                texture: [0, 2, 0, 9, 9][index]
            };
            earsParams = { // prop 2
                sex: 1,
                variation: [0, 0, -1, -1, -1][index],
                texture: [0, 0, -1, -1, -1][index]
            };
            tiesParams = { // clothes 7
                sex: 1,
                variation: [-1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1][index]
            };
            masksParams = { // clothes 1
                sex: 1,
                variation: [-1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1][index]
            };
            glassesParams = { // prop 1
                sex: 1,
                variation: [8, -1, 4, -1, 4][index],
                texture: [0, -1, 2, -1, 0][index]
            };
        } else {
            hatParams = { // prop 0
                sex: 0,
                variation: [-1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1][index]
            };
            topParams = { // clothes 11 / 3 / 8
                sex: 0,
                torso: // /clothes 3
                    [0, 0, 1, 1, 1][index],
                tTexture: [-1, -1, -1, -1, -1][index],
                variation: // clothes 11
                    [27, 181, 57, 25, 57][index],
                texture: [0, 0, 0, 2, 2][index],
                undershirt: // clothes 8
                    [160, 178, 37, 37, 37][index]
            };
            legsParams = { // clothes 4
                sex: 0,
                variation: [54, 54, 54, 51, 51][index],
                texture: [2, 2, 2, 0, 1][index]
            };
            feetsParams = { // clothes 6
                sex: 0,
                variation: [29, 29, 29, 20, 23][index],
                texture: [0, 0, 0, 2, 0][index]
            };
            earsParams = { // prop 2
                sex: 0,
                variation: [2, 0, -1, -1, -1][index],
                texture: [0, 0, -1, -1, -1][index]
            };
            tiesParams = { // clothes 7
                sex: 0,
                variation: [-1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1][index]
            };
            masksParams = { // clothes 1
                sex: 0,
                variation: [-1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1][index]
            };
            glassesParams = { // prop 1
                sex: 0,
                variation: [-1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1][index]
            };
        }
        if (topParams.undershirt == -1) delete topParams.undershirt;
        if (topParams.uTexture == -1) delete topParams.uTexture;
        if (topParams.tTexture == -1) delete topParams.tTexture;

        // hatParams.faction = faction.id;
        // topParams.faction = faction.id;
        // legsParams.faction = faction.id;
        // feetsParams.faction = faction.id;
        // earsParams.faction = faction.id;
        // tiesParams.faction = faction.id;
        // masksParams.faction = faction.id;
        // glassesParams.faction = faction.id;

        topParams.pockets = '[5,5,5,5,10,5]';
        legsParams.pockets = '[5,5,5,5,10,5]';
        hatParams.clime = '[-10,15]';
        topParams.clime = '[-10,15]';
        legsParams.clime = '[-10,15]';
        feetsParams.clime = '[-10,15]';
        topParams.name = `Рубашка ${faction.name}`;
        legsParams.name = `Брюки ${faction.name}`;

        // hatParams.owner = character.id;
        // topParams.owner = character.id;
        // legsParams.owner = character.id;
        // feetsParams.owner = character.id;
        // earsParams.owner = character.id;
        // tiesParams.owner = character.id;
        // masksParams.owner = character.id;
        // glassesParams.owner = character.id;

        var response = (e) => {
            if (e) notifs.error(player, e, header);
        };

        if (hatParams.variation != -1) inventory.addItem(player, 6, hatParams, response);
        if (topParams.variation != -1) inventory.addItem(player, 7, topParams, response);
        if (legsParams.variation != -1) inventory.addItem(player, 8, legsParams, response);
        if (feetsParams.variation != -1) inventory.addItem(player, 9, feetsParams, response);
        if (earsParams.variation != -1) inventory.addItem(player, 10, earsParams, response);
        if (tiesParams.variation != -1) inventory.addItem(player, 2, tiesParams, response);
        if (masksParams.variation != -1) inventory.addItem(player, 14, masksParams, response);
        if (glassesParams.variation != -1) inventory.addItem(player, 1, glassesParams, response);

        notifs.success(player, `Форма выдана`, header);
        factions.setAmmo(faction, faction.ammo - government.clothesAmmo);
    },
    "government.storage.items.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад Government`);
        if (!factions.isGovernmentFaction(player.character.factionId)) return notifs.error(player, `Вы не охрана`, `Склад Government`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;


        var itemIds = [24, 28];
        var types = ["medicines", "ammo"];

        index = Math.clamp(index, 0, itemIds.length - 1);
        var itemId = itemIds[index];
        var type = types[index];

        var minRank = faction.itemRanks.find(x => x.itemId == itemId);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        if (faction[type] < government.itemAmmo) return notifs.error(player, `Недостаточно на складе`, header);
        var itemName = inventory.getInventoryItem(itemId).name;
        // var items = inventory.getArrayByItemId(player, itemId);
        // if (items.length > 0) return notifs.error(player, `Вы уже имеете ${itemName}`, header);

        // inventory.fullDeleteItemsByParams(itemId, ["faction", "owner"], [character.factionId, character.id]);
        var params = {
            // faction: character.factionId,
            // owner: character.id,
        };
        if (index == 0) params.count = 2;

        inventory.addItem(player, itemId, params, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вам выданы ${itemName} (${government.itemAmmo} мат.)`, header);
            factions.setProducts(faction, type, faction[type] - government.itemAmmo);
        });
    },
    "government.storage.guns.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад Government`);
        if (!factions.isGovernmentFaction(player.character.factionId)) return notifs.error(player, `Вы не служите`, `Склад Government`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        if (faction.ammo < government.gunAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);

        var itemIds = [19, 80, 87, 100, 93];
        var weaponIds = ["weapon_stungun", "weapon_heavypistol", "weapon_assaultsmg", "weapon_advancedrifle", "weapon_bullpupshotgun"];
        index = Math.clamp(index, 0, itemIds.length - 1);
        var itemId = itemIds[index];

        var minRank = faction.itemRanks.find(x => x.itemId == itemId);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);


        var gunName = inventory.getInventoryItem(itemId).name;
        var guns = inventory.getArrayByItemId(player, itemId);

        if (guns.length > 0) return notifs.error(player, `Вы уже имеете ${gunName}`, header);

        inventory.fullDeleteItemsByParams(itemId, ["faction", "owner"], [character.factionId, character.id]);
        var params = {
            weaponHash: mp.joaat(weaponIds[index]),
            ammo: 0,
            // faction: character.factionId,
            // owner: character.id
        };

        inventory.addItem(player, itemId, params, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вам выдано оружие ${gunName}  (${government.gunAmmo} мат.)`, header);
            factions.setAmmo(faction, faction.ammo - government.gunAmmo);
            logger.log(`Взял оружие ${gunName} со склада ${faction.name}`, `faction`, player);
        });
    },
    "government.storage.ammo.take": (player, values) => {
        values = JSON.parse(values);
        var index = values[0];
        var ammo = values[1];
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад Government`);
        if (!factions.isGovernmentFaction(player.character.factionId)) return notifs.error(player, `Вы не служите`, `Склад Government`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank)
        var header = `Склад ${faction.name}`;

        var itemIds = [37, 38, 40, 39];
        index = Math.clamp(index, 0, itemIds.length - 1);

        var minRank = faction.itemRanks.find(x => x.itemId == itemIds[index]);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        if (faction.ammo < government.ammoAmmo * ammo) return notifs.error(player, `Недостаточно боеприпасов`, header);

        // inventory.fullDeleteItemsByParams(itemIds[index], ["faction", "owner"], [character.factionId, character.id]);
        var params = {
            count: ammo,
            // faction: character.factionId,
            // owner: character.id
        };
        inventory.addItem(player, itemIds[index], params, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вам выданы ${inventory.getInventoryItem(itemIds[index]).name} (${ammo} ед. - ${government.ammoAmmo * ammo} мат.))`, header);
            factions.setAmmo(faction, faction.ammo - government.ammoAmmo * ammo);
        });
    },
    "government.service.fines.pay": (player, index) => {
        var fines = player.character.Fines;
        var header = `Оплата штрафа`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!fines.length) return out(`У вас нет штрафов`);
        index = Math.clamp(index, 0, fines.length - 1);
        var fine = fines[index];
        if (player.character.cash < fine.price) return out(`Необходимо $${fine.price}`);

        money.removeCash(player, fine.price, (res) => {
            if (!res) return out(`Ошибка списания наличных`);

            fine.destroy();
            fines.splice(index, 1);
            mp.events.call("player.fines.changed", player);
        }, `Оплата штрафа от офицера #${fine.copId}`);

        notifs.success(player, `Штраф #${fine.id} оплачен`, header);
    },
    "government.service.keys.veh.restore": (player, data) => {
        if (typeof data == 'string') data = JSON.parse(data);

        var vehicles = player.vehicleList;
        var header = `Восстановление ключей`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!vehicles.length) return out(`У вас нет авто`);
        data.index = Math.clamp(data.index, 0, vehicles.length - 1);
        var veh = vehicles[data.index];
        var price = government.restoreVehKeysPrice;
        if (player.character.cash < price) return out(`Необходимо $${price}`);

        if (!data.isDublicate) {
            var items = inventory.getItemsByParams(player.inventory.items, 33, 'vehId', veh.id);
            if (items.length) return out(`Вы уже имеете ключи от ${veh.name}`);
        }

        var params = {
            owner: player.character.id,
            vehId: veh.id,
            vehName: veh.name
        };
        var cant = inventory.cantAdd(player, 33, params);
        if (cant) return out(cant);

        money.removeCash(player, price, (res) => {
            if (!res) return out(`Ошибка списания наличных`);

            if (!data.isDublicate) inventory.fullDeleteItemsByParams(33, 'vehId', veh.id);
            // выдача ключей в инвентарь
            inventory.addItem(player, 33, params, (e) => {
                if (e) out(e);
            });
        }, `Восстановление ключей от ${veh.name} (#${veh.id})`);

        notifs.success(player, `Получены ключи от ${veh.name}`, header);
    },
    "government.unarrest.offer": (player, recId) => {
        var header = `Освобождение`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var rec = mp.players.at(recId);

        if (!factions.isGovernmentFaction(player.character.factionId)) return notifs.error(player, `Вы не сотрудник GOV`, header);
        let rank = factions.getRankById(player.character.factionId, player.character.factionRank);
        if (rank.rank < government.freeRank) return notifs.error(player, `Доступно с ${government.freeRank} ранга`, header);

        if (!rec || !rec.character) return out(`Игрок #${recId} не найден`);
        if (!rec.character.arrestTime) return out(`${rec.name} не отбывает срок`);

        var price = police.getUnarrestPrice(rec.character.arrestTime);

        rec.offer = {
            type: "unarrest",
            playerId: player.id
        };
        rec.call(`offerDialog.show`, [`unarrest`, {
            name: player.name,
            price: price
        }]);
    },
    "government.unarrest.accept": (player) => {
        var header = `Освобождение`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var offer = player.offer;
        delete player.offer;
        if (!offer || offer.type != "unarrest") return out(`Предложение не найдено`);
        var rec = mp.players.at(offer.playerId);
        if (!rec || !rec.character) return out(`Игрок #${recId} не найден`);
        if (!player.character.arrestTime) return out(`Вы не отбываете срок`);

        var price = police.getUnarrestPrice(player.character.arrestTime);
        if (player.character.cash < price) return out(`Необходимо $${price}`);

        money.removeCash(player, price, (res) => {
            if (!res) return out(`Ошибка списания наличных`);

            police.stopCellArrest(player);

            notifs.success(rec, `${player.name} на свободе`, header);
            notifs.success(player, `${rec.name} освободил вас`, header);

            var pay = parseInt(price * police.unarrestPayK);

            money.addCash(rec, pay, (res) => {
                if (!res) return notifs.error(rec, `Ошибка начисления наличных`, header);
            }, `Освобождение заключенного ${player.name}`);
        }, `Освобождение через адвоката ${rec.name}`);
    },
    "government.unarrest.cancel": (player, recId) => {
        if (!player.offer || player.offer.type != "unarrest") return;
        var rec = mp.players.at(player.offer.playerId);
        if (rec && rec.character) notifs.warning(rec, `${player.name} отклонил предложение`);
        delete player.offer;
    },
    "government.licenses.gun.give": (player, recId) => {
        let header = `Лицензия на оружие`;
        let rec = mp.players.at(recId);
        if (!factions.isGovernmentFaction(player.character.factionId)) return notifs.error(player, `Вы не сотрудник GOV`, header);
        let rank = factions.getRankById(player.character.factionId, player.character.factionRank);
        if (rank.rank < government.giveGunLicenseRank) return notifs.error(player, `Нет прав`, header);

        if (!rec || !rec.character) return notifs.error(player, `Гражданин не найден`, header);
        let character = rec.character;
        if (character.gunLicenseDate) return notifs.error(player, `${rec.name} уже имеет лицензию`, header);

        character.gunLicenseDate = new Date();
        character.save();

        notifs.success(player, `Выдана лицензия ${rec.name}`, header);
        notifs.info(rec, `${player.name} выдал вам лицензию`, header);
    },
    "government.licenses.veh.give": (player, recId) => {
        let header = `Лицензии на транспорт`;
        let rec = mp.players.at(recId);
        if (!factions.isGovernmentFaction(player.character.factionId)) return notifs.error(player, `Вы не сотрудник GOV`, header);
        let rank = factions.getRankById(player.character.factionId, player.character.factionRank);
        if (rank.rank < police.giveGunLicenseRank) return notifs.error(player, `Нет прав`, header);

        if (!rec || !rec.character) return notifs.error(player, `Гражданин не найден`, header);
        let character = rec.character;

        character.carLicense = 1;
        character.passengerLicense = 1;
        character.bikeLicense = 1;
        character.truckLicense = 1;
        character.airLicense = 1;
        character.boatLicense = 1;
        character.save();

        notifs.success(player, `Выдан пакет лицензий ${rec.name}`, header);
        notifs.info(rec, `${player.name} выдал вам пакет лицензий`, header);
    },
    "government.tax.set": (player, biz, value) => {
        value = parseFloat(value);
        if (player.character.factionId != 1 || !factions.isLeader(player)) return notifs.error(player, 'Доступно только губернатору');
        if (!government.taxBizes.find(x => x.module == biz)) return notifs.error(player, 'Неверный тип бизнеса');
        if (value < 0 || value > 0.05) return notifs.error(player, 'Неверное значение');

        let result = bizes.setBizRentMultiplier(biz, value);

        if (result) {
            notifs.success(player, 'Вы изменили налог');
        } else {
            notifs.error(player, 'Неизвестная ошибка');
        }
    },
    "government.treasury.menu.show": (player) => {
        if (!player.character) return;
        if (!factions.isGovernmentFaction(player.character.factionId)) return;
        if (!factions.isLeader(player)) return notifs.warning(player, 'Управление казной доступно только губернатору');

        let cash = factions.getFaction(player.character.factionId).cash;
        player.call('government.treasury.menu.show', [cash]);
    },
    "government.treasury.cash.send": (player, data) => {
        if (!player.character) return;
        if (!factions.isGovernmentFaction(player.character.factionId)) return;
        if (!factions.isLeader(player)) return notifs.warning(player, 'Управление казной доступно только губернатору');

        let { targetId, amount } = JSON.parse(data);
        let faction = factions.getFaction(player.character.factionId);
        if (amount > faction.cash) {
            notifs.error(player, 'В казне недостаточно средств');
            player.call('government.treasury.cash.send.finish');
            return;
        }
        factions.moveCash(player.character.factionId, targetId, amount);
        notifs.success(player, 'Вы перевели деньги другой организации');
        player.call('government.treasury.cash.send.finish');
    },
    "government.nickname.change": async (player, name) => {
        if (player.character.cash < government.changeNamePrice) return notifs.error(player, 'Недостаточно денег');

        let reg = /^[A-z]{2,15} [A-z]{2,15}$/;
        if (!reg.test(name)) return notifs.error(player, `Имя и фамилия должны состоять из 2-15 латинских букв каждое`);

        let character = await db.Models.Character.findOne({
            attributes: ["id"],
            where: {
                name: name
            }
        });

        if (character) return notifs.error(player, `Никнейм ${name} занят`);

        money.removeCash(player, government.changeNamePrice, (result) => {
            if (result) {
                let oldName = player.name;
                player.name = name;
                player.character.name = name;
                player.character.save();
                notifs.success(player, `Никнейм персонажа изменен`);
                mp.events.call("player.name.changed", player, oldName);
            } else {
                notifs.error(player, `Финансовая ошибка`);
            }

        }, 'Смена никнейма в GOV');
    }
}
