"use strict";
var fib = require('../fib')
var factions = require('../factions');
var inventory = require('../inventory');
var logger = call('logger');
var notifs = require('../notifications');

module.exports = {
    "init": () => {
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        if (!factions.isFibFaction(player.character.factionId)) return;
        mp.events.call(`mapCase.fib.init`, player);
    },
    "fib.storage.clothes.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад FIB`);
        if (!factions.isFibFaction(player.character.factionId)) return notifs.error(player, `Вы не агент`, `Склад FIB`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        var minRank = faction.clothesRanks.find(x => x.clothesIndex == index);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        if (faction.ammo < fib.clothesAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);
        if (player.inventory.items.length) return notifs.error(player, `Необходимо раздеться, чтобы надеть форму`, header);

        inventory.fullDeleteItemsByParams([6, 7, 8, 9, 10, 2, 14, 1], ["faction", "owner"], [character.factionId, character.id]);

        var hatParams, topParams, legsParams, feetsParams, earsParams, tiesParams, masksParams, glassesParams;
        if (character.gender == 0) { // муж.
            hatParams = { // prop 0
                sex: 1,
                variation: [-1, -1, -1, 124, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
            topParams = { // clothes 11 / 3 / 8
                sex: 1,
                torso: // /clothes 3
                    [11, 12, 12, 12, 12, 12][index],
                tTexture: [-1, -1, -1, -1, -1, -1][index],
                variation: // clothes 11
                    [26, 4, 111, 53, 142, 21][index],
                texture: [0, 0, 3, 1, 0, 0][index],
                undershirt: // clothes 8
                    [130, 11, 122, 122, 21, 22][index]
            };
            legsParams = { // clothes 4
                sex: 1,
                variation: [24, 28, 24, 24, 24, 24][index],
                texture: [0, 0, 0, 0, 0, 5][index]
            };
            feetsParams = { // clothes 6
                sex: 1,
                variation: [21, 21, 21, 25, 21, 21][index],
                texture: [7, 7, 0, 0, 0, 0][index]
            };
            earsParams = { // prop 2
                sex: 1,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
            tiesParams = { // clothes 7
                sex: 1,
                variation: [128, 125, 125, -1, -1, 125][index],
                texture: [0, 0, 0, -1, -1, 0][index]
            };
            masksParams = { // clothes 1
                sex: 1,
                variation: [-1, -1, -1, 52, -1, -1][index],
                texture: [-1, -1, -1, 1, -1, -1][index]
            };
            glassesParams = { // prop 1
                sex: 1,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
        } else {
            hatParams = { // prop 0
                sex: 0,
                variation: [-1, -1, -1, 123, -1, -1][index],
                texture: [-1, -1, -1, 0, -1, -1][index]
            };
            topParams = { // clothes 11 / 3 / 8
                sex: 0,
                torso: // /clothes 3
                    [0, 7, 1, 0, 1, 7][index],
                tTexture: [-1, -1, -1, -1, -1, -1][index],
                variation: // clothes 11
                    [27, 90, 103, 46, 139, 90][index],
                texture: [5, 1, 3, 1, 2, 0][index],
                undershirt: // clothes 8
                    [160, 39, 159, 159, 39, 64][index]
            };
            legsParams = { // clothes 4
                sex: 0,
                variation: [37, 51, 54, 30, 51, 51][index],
                texture: [2, 1, 2, 2, 0, 0][index]
            };
            feetsParams = { // clothes 6
                sex: 0,
                variation: [29, 29, 29, 25, 29, 29][index],
                texture: [0, 1, 0, 0, 1, 2][index]
            };
            earsParams = { // prop 2
                sex: 0,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
            tiesParams = { // clothes 7
                sex: 0,
                variation: [98, 95, -1, -1, 95, -1, 95][index],
                texture: [0, 0, -1, -1, 0, -1, 0][index]
            };
            masksParams = { // clothes 1
                sex: 0,
                variation: [-1, -1, -1, 52, -1, -1][index],
                texture: [-1, -1, -1, 1, -1, -1][index]
            };
            glassesParams = { // prop 1
                sex: 0,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
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
        factions.setAmmo(faction, faction.ammo - fib.clothesAmmo);
    },
    "fib.storage.armour.take": (player) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад FIB`);
        if (!factions.isFibFaction(player.character.factionId)) return notifs.error(player, `Вы не агент`, `Склад FIB`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        if (faction.ammo < fib.armourAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);
        var armours = inventory.getArrayByItemId(player, 3);

        var minRank = faction.itemRanks.find(x => x.itemId == 3);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        for (var key in armours) {
            var params = inventory.getParamsValues(armours[key]);
            if (factions.isFibFaction(params.faction)) return notifs.error(player, `Вы уже имеете бронежилет`, header);
        }

        inventory.fullDeleteItemsByParams(3, ["faction", "owner"], [character.factionId, character.id]);
        var params;
        if (character.gender == 0) { // муж.
            params = {
                variation: 12,
                texture: 1
            };
        } else {
            params = {
                variation: 12,
                texture: 1
            };
        }

        // params.faction = character.factionId;
        // params.owner = character.id;
        params.health = 100;
        params.pockets = '[3,3,3,3,3,3,3,3,10,5,3,5,10,3,3,3]';
        params.sex = character.gender ? 0 : 1;

        inventory.addItem(player, 3, params, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Выдан бронежилет (${fib.armourAmmo} мат.)`, header);
            factions.setAmmo(faction, faction.ammo - fib.armourAmmo);
        });
    },
    "fib.storage.items.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад FIB`);
        if (!factions.isFibFaction(player.character.factionId)) return notifs.error(player, `Вы не агент`, `Склад FIB`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;


        var itemIds = [28, 24, 4];
        let itemMaterials = [10, 10, 10];
        index = Math.clamp(index, 0, itemIds.length - 1);
        var itemId = itemIds[index];

        var minRank = faction.itemRanks.find(x => x.itemId == itemId);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        if (itemId == 24) {
            if (faction.medicines < fib.itemAmmo) return notifs.error(player, `Недостаточно медикаментов`, header);
        } else {
            if (faction.ammo < fib.itemAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);
        }

        var itemName = inventory.getInventoryItem(itemId).name;
        // var items = inventory.getArrayByItemId(player, itemId);
        // if (items.length > 0) return notifs.error(player, `Вы уже имеете ${itemName}`, header);

        // inventory.fullDeleteItemsByParams(itemId, ["faction", "owner"], [character.factionId, character.id]);
        var params = {
            // faction: character.factionId,
            // owner: character.id
        };
        if (itemId == 24) { // аптечка
            params.count = 2;
        }

        inventory.addItem(player, itemId, params, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вам выданы ${itemName} (${itemMaterials[index]} мат.)`, header);
            if (itemId == 24) factions.setMedicines(faction, faction.medicines - itemMaterials[index]);
            else factions.setAmmo(faction, faction.ammo - itemMaterials[index]);
        });
    },
    "fib.storage.guns.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад FIB`);
        if (!factions.isFibFaction(player.character.factionId)) return notifs.error(player, `Вы не агент`, `Склад FIB`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        if (faction.ammo < fib.gunAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);

        var itemIds = [107, 99, 88, 46, 19, 91];
        let gunMaterials = [15000, 50, 50, 40, 15, 80]
        var weaponIds = ["weapon_heavysniper", "weapon_carbinerifle_mk2", "weapon_combatpdw", "weapon_pistol50", "weapon_stungun", "weapon_pumpshotgun_mk2"];
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

            notifs.success(player, `Вам выдано оружие ${gunName} (${gunMaterials[index]} мат.)`, header);
            factions.setAmmo(faction, faction.ammo - gunMaterials[index]);
            logger.log(`Взял оружие ${gunName} со склада ${faction.name}`, `faction`, player);
        });
    },
    "fib.storage.ammo.take": (player, values) => {
        values = JSON.parse(values);
        var index = values[0];
        var ammo = values[1];
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад FIB`);
        if (!factions.isFibFaction(player.character.factionId)) return notifs.error(player, `Вы не агент`, `Склад FIB`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        var itemIds = [37, 38, 40, 39];
        let ammoMaterials = [1, 1, 1, 1];
        index = Math.clamp(index, 0, itemIds.length - 1);
        if (faction.ammo < fib.ammoAmmo * ammo) return notifs.error(player, `Недостаточно боеприпасов`, header);

        var minRank = faction.itemRanks.find(x => x.itemId == itemIds[index]);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        // inventory.fullDeleteItemsByParams(itemIds[index], ["faction", "owner"], [character.factionId, character.id]);
        var params = {
            count: ammo,
            // faction: character.factionId,
            // owner: character.id
        };
        inventory.addItem(player, itemIds[index], params, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вам выданы ${inventory.getInventoryItem(itemIds[index]).name} (${ammo} ед. - ${ammoMaterials[index] * ammo} мат.)`, header);
            factions.setAmmo(faction, faction.ammo - ammoMaterials[index] * ammo);
        });
    },
    "fib.spy": (player, data) => {
        if (typeof data == 'string') data = JSON.parse(data);
        var header = `Прослушка FIB`;

        var rec = (data.recId != null) ? mp.players.at(data.recId) : mp.players.getNear(player);
        if (!rec || !rec.character) return notifs.error(player, `Гражданин не найден`, header);
        var dist = player.dist(rec.position);
        if (dist > 3) return notifs.error(player, `${rec.name} далеко`, header);
        if (!factions.isFibFaction(player.character.factionId)) return notifs.error(player, `Вы не агент`, header);

        if (!rec.spy) {
            var spy = (data.itemSqlId) ? inventory.getItem(player, data.itemSqlId) : inventory.getItemByItemId(player, 4);
            if (!spy) return notifs.error(player, `Предмет ${inventory.getName(4)} не найден`, header);

            inventory.deleteItem(player, spy);
            rec.spy = {
                playerId: player.id,
                characterId: player.character.id,
            };
            notifs.success(player, `Прослушка на ${rec.name} установлена`, header);
        } else {
            var params = {
                faction: player.character.factionId,
                owner: player.character.id
            };
            inventory.addItem(player, 4, params, (e) => {
                if (e) return notifs.error(player, e, header);
            });

            delete rec.spy;
            notifs.success(player, `Прослушка с ${rec.name} снята`, header);
        }
    },
    "fib.vehicle.plate.set": (player, data) => {
        if (typeof data == 'string') data = JSON.parse(data);
        var header = `Смена номера`;

        var veh = mp.vehicles.at(data.vehId);
        if (!veh) return notifs.error(player, `Авто не найдено`, header);
        if (!veh.db || veh.db.key != "faction" || veh.db.owner != 4) return notifs.error(player, `Авто не принадлежит FIB`, header);
        var dist = player.dist(veh.position);
        if (dist > 3) return notifs.error(player, `Авто далеко`, header);

        veh.numberPlate = data.plate;
        notifs.success(player, `Номер изменен на ${data.plate}`, header);
    }
}
