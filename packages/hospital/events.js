"use strict";
var factions = require('../factions');
var inventory = require('../inventory');
var money = require('../money');
var notifs = require('../notifications');
var hospital = require('../hospital');

module.exports = {
    "init": () => {
        hospital.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        if (!factions.isHospitalFaction(player.character.factionId)) return;
        // player.call(`mapCase.init`, [player.name, player.character.factionId]);
        mp.events.call(`mapCase.ems.init`, player);
    },
    "hospital.storage.clothes.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад Hospital`);
        if (!factions.isHospitalFaction(player.character.factionId)) return notifs.error(player, `Вы не являетесь медиком`, `Склад Hospital`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank)
        var header = `Склад ${faction.name}`;

        var minRank = faction.clothesRanks.find(x => x.clothesIndex == index);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        if (faction.ammo < hospital.clothesAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);
        if (player.inventory.items.length) return notifs.error(player, `Необходимо раздеться, чтобы надеть форму`, header);

        inventory.fullDeleteItemsByParams([6, 7, 8, 9, 10, 2, 14, 1], ["faction", "owner"], [character.factionId, character.id]);

        var hatParams, topParams, legsParams, feetsParams, earsParams, tiesParams, masksParams, glassesParams;
        if (character.gender == 0) { // муж.
            hatParams = { // prop 0
                sex: 1,
                variation: [122, 122, 122, 122, -1, -1][index],
                texture: [0, 1, 0, 1, -1, -1][index]
            };
            topParams = { // clothes 11 / 3 / 8
                sex: 1,
                torso: // /clothes 3
                    [85, 85, 90, 90, 92, 11][index],
                tTexture: [-1, -1, -1, -1, -1, -1][index],
                variation: // clothes 11
                    [250, 250, 249, 249, 13, 25][index],
                texture: [0, 1, 0, 1, 0, 7][index],
                undershirt: // clothes 8
                    [129, 129, 74, 74, -1, 144][index],
                uTexture: [-1, -1, 3, 3, -1, -1][index],
                decal: // clothes 10
                    [58, 58, 57, 57, -1, -1][index],
                dTexture: [1, 0, 0, 0, -1, -1][index]
            };
            legsParams = { // clothes 4
                sex: 1,
                variation: [96, 96, 96, 96, 96, 96][index],
                texture: [0, 1, 0, 1, 1, 1][index]
            };
            feetsParams = { // clothes 6
                sex: 1,
                variation: [51, 51, 51, 51, 10, 10][index],
                texture: [0, 0, 0, 0, 0, 0][index]
            };
            earsParams = { // prop 2
                sex: 1,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
            tiesParams = { // clothes 7
                sex: 1,
                variation: [127, 126, 127, 126, 126, 126][index],
                texture: [0, 0, 0, 0, 0, 0][index]
            };
            masksParams = { // clothes 1
                sex: 1,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
            glassesParams = { // prop 1
                sex: 1,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
        } else {
            hatParams = { // prop 0
                sex: 0,
                variation: [121, 121, 121, 121, -1, -1][index],
                texture: [0, 1, 0, 1, -1, -1][index]
            };
            topParams = { // clothes 11 / 3 / 8
                sex: 0,
                torso: // /clothes 3
                    [109, 109, 104, 104, 98, 98][index],
                tTexture: [-1, -1, -1, -1, -1, -1][index],
                variation: // clothes 11
                    [73, 73, 106, 138, 27, 28][index],
                texture: [1, 1, 2, 9, 0, 5][index],
                undershirt: // clothes 8
                    [159, 159, 55, 55, -1, 24][index],
                uTexture: [-1, -1, 6, 6, -1, 0][index],
                decal: // clothes 10
                    [-1, -1, 65, 65, -1, -1][index],
            };
            legsParams = { // clothes 4
                sex: 0,
                variation: [99, 99, 99, 99, 99, 99][index],
                texture: [0, 1, 0, 1, 1, 1][index]
            };
            feetsParams = { // clothes 6
                sex: 0,
                variation: [64, 64, 64, 64, 13, 13][index],
                texture: [0, 0, 0, 0, 0, 0][index]
            };
            earsParams = { // prop 2
                sex: 0,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
            tiesParams = { // clothes 7
                sex: 0,
                variation: [97, 96, 97, 96, 96, 96][index],
                texture: [0, 0, 0, 0, 0, 0][index]
            };
            masksParams = { // clothes 1
                sex: 0,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
            glassesParams = { // prop 1
                sex: 0,
                variation: [-1, -1, -1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1, -1, -1][index]
            };
        }
        if (topParams.undershirt == -1) delete topParams.undershirt;
        if (topParams.uTexture == -1) delete topParams.uTexture;
        if (topParams.decal == -1) delete topParams.decal;
        if (topParams.dTexture == -1) delete topParams.dTexture;
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
        if (earsParams.variation != -1) inventory.addItem(player, 10, tiesParams, response);
        if (tiesParams.variation != -1) inventory.addItem(player, 2, tiesParams, response);
        if (masksParams.variation != -1) inventory.addItem(player, 14, masksParams, response);
        if (glassesParams.variation != -1) inventory.addItem(player, 1, glassesParams, response);

        notifs.success(player, `Форма выдана`, header);
        factions.setAmmo(faction, faction.ammo - hospital.clothesAmmo);
    },
    "hospital.storage.items.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад Hospital`);
        if (!factions.isHospitalFaction(player.character.factionId)) return notifs.error(player, `Вы не являетесь медиком`, `Склад Hospital`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        if (faction.medicines < hospital.itemMedicines) return notifs.error(player, `Недостаточно медикаментов`, header);

        var itemIds = [24, 27, 25, 26];
        let itemMaterials = [10, 20, 5, 30];
        index = Math.clamp(index, 0, itemIds.length - 1);
        var itemId = itemIds[index];

        var minRank = faction.itemRanks.find(x => x.itemId == itemId);
        if (minRank && minRank.rank > rank.rank) return notifs.error(player, `Доступно с ранга ${factions.getRank(faction, minRank.rank).name}`, header);

        var itemName = inventory.getInventoryItem(itemId).name;
        // var items = inventory.getArrayByItemId(player, itemId);
        // if (items.length > 0) return notifs.error(player, `Вы уже имеете ${itemName}`, header);

        // inventory.fullDeleteItemsByParams(itemId, ["faction", "owner"], [character.factionId, character.id]);
        var params = {
            // faction: character.factionId,
            // owner: character.id
        };
        if (itemId == 24) { // малая аптечка
            params.count = 2;
        } else if (itemId == 27) { // большая аптечка
            params.count = 5;
        } else if (itemId == 25) { // пластырь
            params.count = 5;
        } else if (itemId == 26) { // адреналин
            params.count = 3;
        }

        inventory.addItem(player, itemId, params, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вам выданы ${itemName} (${itemMaterials[index]} мат.)`, header);
            factions.setMedicines(faction, faction.medicines - itemMaterials[index]);
        });
    },
    // лечение игрока (пополнение ХП) | показ + принятие + отмена:
    "hospital.healing.show": (player, recId) => {
        var header = `Лечение`;
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return notifs.error(player, `Игрок #${recId} не найден`, header);
        if (player.dist(rec.position) > 10) return notifs.error(player, `${rec.name} далеко`, header);
        if (!factions.isHospitalFaction(player.character.factionId)) return notifs.error(player, `Вы не медик`, header);
        if (rec.health == 100) return notifs.error(player, `${rec.name} полностью здоров`, header);
        var med = inventory.getItemByItemId(player, [24, 27]);
        if (!med) return notifs.error(player, `Аптечка не найдена`, header);
        var count = inventory.getParam(med, 'count').value;
        if (!count) return notifs.error(player, `Количество: 0 ед.`, header);


        rec.offer = {
            type: "hospital_healing",
            inviterId: player.id,
            health: 100 - rec.health
        };
        rec.call(`offerDialog.show`, ["hospital_healing", {
            name: player.name,
            price: parseInt(hospital.healingPrice * rec.offer.health)
        }]);
        notifs.success(player, `Вы предложили игроку с ID: ${player.id} вылечиться`, header);
    },
    "hospital.healing.accept": (player) => {
        var header = `Лечение`;
        if (!player.offer || player.offer.type != "hospital_healing") return notifs.error(player, `Приглашение не найдено`, header);
        var offer = player.offer;
        delete player.offer;

        var inviter = mp.players.at(offer.inviterId);
        if (!inviter || !inviter.character) return notifs.error(player, `Медик не найден`, header);
        if (player.dist(inviter.position) > 10) return notifs.error(player, `${inviter.name} далеко`, header);
        if (!factions.isHospitalFaction(inviter.character.factionId)) return notifs.error(player, `${inviter.name} не медик`, header);
        if (player.health == 100) {
            notifs.error(player, `Вы полностью здоровы`, header);
            notifs.error(inviter, `${player.name} полностью здоров`, header);
            return;
        }
        var price = offer.health * hospital.healingPrice;
        if (player.character.cash < price) return notifs.error(player, `Необходимо $${price}`, header);
        var med = inventory.getItemByItemId(inviter, [24, 27]);
        if (!med) {
            notifs.error(player, `${inviter.name} не имеет аптечки`, header);
            notifs.error(inviter, `Аптечка не найдена`, header);
            return;
        }
        var count = inventory.getParam(med, 'count').value;
        if (!count) return notifs.error(inviter, `Количество: 0 ед.`, header);

        money.removeCash(player, price, (res) => {
            if (!res) return notifs.error(player, `Непредв. ошибка 1! Обратитесь к разработчикам.`, header);
            money.addCash(inviter, price, (res) => {
                if (!res) return notifs.error(player, `Непредв. ошибка 2! Обратитесь к разработчикам.`, header);

                count--;
                if (!count) inventory.deleteItem(inviter, med);
                else inventory.updateParam(inviter, med, 'count', count);

                player.health = Math.clamp(player.health + offer.health, 1, 100);
                notifs.success(inviter, `${player.name} вылечился`, header);
                notifs.success(player, `${inviter.name} вас вылечил`, header);
            }, `Вылечил игрока ${player.name}`);
        }, `Вылечился медиком ${inviter.name}`);
    },
    "hospital.healing.cancel": (player) => {
        if (!player.offer) return;
        var inviter = mp.players.at(player.offer.inviterId);
        delete player.offer;
        if (!inviter || !inviter.character) return;
        notifs.info(player, `Предложение отклонено`, `Лечение`);
        notifs.info(inviter, `${player.name} отклонил предложение`, `Лечение`);
    },
    "hospital.medCard.give": (player, data) => {
        data = JSON.parse(data);
        var header = `Медкарта`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var rec = mp.players.at(data.recId);
        if (!factions.isHospitalFaction(player.character.factionId)) return out(`Вы не медик`);

        var minRank = hospital.giveMedCardRank;
        var rank = factions.getRankById(player.character.factionId, player.character.factionRank);
        if (minRank > rank.rank) return out(`Доступно с ранга ${factions.getRank(player.character.factionId, minRank).name}`);

        if (!rec || !rec.character) return out(`Игрок не найден`);
        var character = rec.character;

        if (!character.medCardDate) {
            notifs.success(player, `Медкарта выдана ${rec.name}`, header);
            notifs.info(rec, `${player.name} выдал вам медкарту`, header);
        } else {
            notifs.success(player, `Медкарта ${rec.name} продлена`, header);
            notifs.info(rec, `${player.name} продлил вам медкарту`, header);
        }

        character.medCardDate = new Date(Date.now() + hospital.medCardDays * 24 * 60 * 60 * 1000);
        character.save();
    },
    "hospital.healing.heal": (player) => {
        let header = `Лечение`;
        if (player.health === 100) return notifs.warning(player, `Вы полностью здоровы`, header);

        let price = hospital.pedHealingPrice;
        if (player.character.cash < price) return notifs.error(player, `Необходимо $${price}`, header);

        money.removeCash(player, price, (res) => {
            if (!res) return notifs.error(player, `Ошибка`, header);
            player.health = 100;
            notifs.success(player, `Вы прошли курс лечения`, header);
        }, `Лечение у бота в больнице`);
    }
}
