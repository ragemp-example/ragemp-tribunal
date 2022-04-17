let bands = call('bands');
let factions = call('factions');
let inventory = call('inventory');
let logger = call('logger');
let money = call('money');
let notifs = call('notifications');
let drugs = call('drugs');

module.exports = {
    "init": async () => {
        await bands.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        player.call(`bands.bandZones.init`, [bands.convertToClientBandZones()]);
        var factionId = player.character.factionId;
        if (!factions.isBandFaction(factionId)) return;

        mp.events.call(`mapCase.crm.init`, player);
        var warZoneIds = Object.keys(bands.wars);
        if (!warZoneIds.length) return;
        var war = bands.wars[warZoneIds[0]];
        var time = bands.haveTime(war) / 1000;
        if (war.band.id == factionId) player.call(`bands.capture.start`, [factionId, war.enemyBand.id, time, war.band.score, war.enemyBand.score]);
        else if (war.enemyBand.id == factionId) player.call(`bands.capture.start`, [factionId, war.band.id, time, war.enemyBand.score, war.band.score]);
    },
    "bands.capture.start": (player) => {
        bands.startCapture(player);
    },
    "bands.rob": (player, recId) => {
        var header = `Ограбление`;
        var out = (text) => {
            notifs.error(player, text, header);
        };

        if (!factions.isBandFaction(player.character.factionId) && !factions.isMafiaFaction(player.character.factionId)) return out(`Вы не член банды/мафии`);
        var rank = factions.getRank(player.character.factionId, bands.robRank);
        if (player.character.factionRank < rank.id) return out(`Доступно с ранга ${rank.name}`);

        if (bands.robLogs[player.character.id]) {
            var diff = Date.now() - bands.robLogs[player.character.id];
            var wait = bands.robBandWaitTime;
            if (diff < wait) return out(`Повторное ограбление доступно через ${parseInt((wait - diff) / 1000)} сек.`);
        }

        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return out(`Игрок #${recId} не найден`);
        if (player.dist(rec.position) > 10) return out(`Игрок далеко`);
        //if (factions.isBandFaction(rec.character.factionId) || factions.isMafiaFaction(rec.character.factionId)) return out(`Нельзя ограбить члена банды/мафии`);

        if (bands.robbedLogs[rec.character.id]) {
            var diff = Date.now() - bands.robbedLogs[rec.character.id];
            var wait = bands.robVictimWaitTime;
            if (diff < wait) return out(`Ограбить игрока можно через ${parseInt((wait - diff) / 1000)} сек.`);
        }

        var price = Math.clamp(parseInt(rec.character.cash * bands.robK), 0, bands.robMaxPrice);
        if (!price) return out(`Игрок нищий`);

        money.moveCash(rec, player, price, (res) => {
            if (!res) return notifs.error(player, `Ошибка передачи денег`, header);
        }, `Ограблен игроком ${player.name}`, `Ограбил игрока ${rec.name}`);

        bands.robLogs[player.character.id] = Date.now();
        bands.robbedLogs[rec.character.id] = Date.now();
        notifs.success(player, `Вы ограбили игрока`, header);
        notifs.warning(rec, `Вас ограбили`, header);
    },
    "bands.vehicle.rob": (player, vehId) => {
        var header = `Ограбление`;
        var out = (text) => {
            notifs.error(player, text, header);
        };

        if (!factions.isBandFaction(player.character.factionId)) return out(`Вы не член банды`);
        var rank = factions.getRank(player.character.factionId, bands.robRank);
        if (player.character.factionRank < rank.id) return out(`Доступно с ранга ${rank.name}`);

        var veh = mp.vehicles.at(vehId);
        if (!veh) return out(`Авто #${vehId} не найдено`);
        if (player.dist(veh.position) > 50) return out(`Авто далеко`);
        if (!bands.canRobVehicle(veh)) return out(`Авто нельзя ограбить`);
        if (veh.getVariable("robbed")) return out(`Авто уже ограблено`);

        var zone = bands.getZoneByPos(veh.position);
        if (!zone) return out(`Вы не в гетто`);
        if (zone.factionId != player.character.factionId) return out(`Нельзя ограбить на территории, захваченной другой бандой`);

        bands.giveRobVehItem(player, veh, (e) => {
            if (e) return out(e);

            veh.setVariable("robbed", true);
            notifs.success(player, `Вы ограбили авто`, header);
        });
    },
    "bands.storage.guns.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад банды`);
        if (!factions.isBandFaction(player.character.factionId)) return notifs.error(player, `Вы не член группировки`, `Склад банды`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        var storage = factions.getStorage(player.insideFactionWarehouse);
        if (!storage.isOpen) return notifs.error(player, `Склад банды закрыт`, header);

        if (faction.ammo < bands.gunAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);

        var itemIds = [41, 21, 44, 20, 47, 89, 84];
        var weaponIds = ["weapon_bat", "weapon_pumpshotgun", "weapon_pistol", "weapon_combatpistol", "weapon_microsmg", "weapon_machinepistol", "weapon_revolver"];
        let weaponMaterials = [50, 70, 50, 60, 70, 100, 250]
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

            notifs.success(player, `Вам выдано оружие ${gunName} (${weaponMaterials[index]} мат.)`, header);
            factions.setAmmo(faction, faction.ammo - weaponMaterials[index]);
            logger.log(`Взял оружие ${gunName} со склада ${faction.name}`, `faction`, player);
        });
    },
    "bands.storage.ammo.take": (player, values) => {
        values = JSON.parse(values);
        var index = values[0];
        var ammo = values[1];
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад банды`);
        if (!factions.isBandFaction(player.character.factionId)) return notifs.error(player, `Вы не член группировки`, `Склад банды`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        var storage = factions.getStorage(player.insideFactionWarehouse);
        if (!storage.isOpen) return notifs.error(player, `Склад банды закрыт`, header);

        var itemIds = [37, 38, 40];
        let ammoMaterials = [1, 1, 1];
        index = Math.clamp(index, 0, itemIds.length - 1);
        if (faction.ammo < bands.ammoAmmo * ammo) return notifs.error(player, `Недостаточно боеприпасов`, header);

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
    "bands.storage.lockPick.take": (player) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад банды`);
        if (!factions.isBandFaction(player.character.factionId)) return notifs.error(player, `Вы не член группировки`, `Склад банды`);

        let character = player.character;
        let faction = factions.getFaction(character.factionId);
        let rank = factions.getRankById(faction, character.factionRank);
        let header = `Склад ${faction.name}`;

        let storage = factions.getStorage(player.insideFactionWarehouse);
        if (!storage.isOpen) return notifs.error(player, `Склад банды закрыт`, header);

        if (faction.ammo < bands.lockPickAmmo) return notifs.error(player, `Недостаточно материалов`, header);

        if (bands.lockPickRank > rank.rank) return notifs.error(player, `Доступно с ${bands.lockPickRank} ранга`, header);

        inventory.addItem(player, 148, {}, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вам выдана отмычка (${bands.lockPickAmmo} мат.)`, header);
            factions.setAmmo(faction, faction.ammo - bands.lockPickAmmo);
        });
    },
    "bands.storage.cash.put": (player, sum) => {
        sum = Math.clamp(sum, 0, 1000000);
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Общак банды`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var header = `Общак ${faction.name}`;

        if (character.cash < sum) return notifs.error(player, `Необходимо $${sum}`, header);
        money.removeCash(player, sum, (res) => {
            if (!res) return notifs.error(player, `Ошибка списания наличных`, header);

            faction.cash += sum;
            faction.save();
        }, `Пополнение общака ${faction.name}`);

        notifs.success(player, `Пополнено на $${sum}`, header);

        mp.players.forEach(rec => {
            if (!rec.character) return;
            if (rec.character.factionId != player.character.factionId) return;

            notifs.info(rec, `${player.name} пополнил на $${sum}`, header);
        });
    },
    "bands.storage.cash.take": (player, sum) => {
        sum = Math.clamp(sum, 0, 1000000);
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Общак банды`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var header = `Общак ${faction.name}`;

        if (!factions.isLeader(player)) return notifs.error(player, `Нет доступа`, header);
        if (faction.cash < sum) return notifs.error(player, `Общак не имеет $${sum}`, header);
        money.addCash(player, sum, (res) => {
            if (!res) return notifs.error(player, `Ошибка начисления наличных`, header);

            faction.cash -= sum;
            faction.save();
        }, `Снятие из общака ${faction.name}`);

        notifs.success(player, `Снято $${sum}`, header);

        mp.players.forEach(rec => {
            if (!rec.character) return;
            if (rec.character.factionId != player.character.factionId) return;

            notifs.info(rec, `${player.name} снял $${sum}`, header);
        });
    },
    "bands.storage.state": (player, open) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Общак банды`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var header = `Склад ${faction.name}`;

        if (!factions.canSetStorageState(player)) return notifs.error(player, `Нет доступа`, header);

        var storage = factions.getStorage(player.insideFactionWarehouse);

        if (storage.isOpen == open) {
            if (open) return notifs.error(player, `Склад уже открыт`, header);
            else return notifs.error(player, `Склад уже закрыт`, header);
        }

        storage.isOpen = open;
        var str = (open) ? "открыл" : "закрыл";

        mp.players.forEach(rec => {
            if (!rec.character) return;
            if (rec.character.factionId != player.character.factionId) return;

            notifs.info(rec, `${player.name} ${str} склад банды`, header);
        });
    },
    "bands.drugsStash.drugs.buy": (player, data) => {
        data = JSON.parse(data);

        var header = `Наркопритон`;
        if (!player.insideDrugsStash) return notifs.error(player, `Вы далеко`, header);
        if (!factions.isBandFaction(player.character.factionId)) return notifs.error(player, `Вы не член группировки`, header);
        if (drugs.drugsStash.resources < parseInt(data.count * drugs.resourcesPerGr)) return notifs.error(player, `Недостаточно ресурсов на складе`, header);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);

        var itemIds = [29, 30, 31, 32];
        data.index = Math.clamp(data.index, 0, itemIds.length - 1);
        var price = bands.drugsPrice[data.index] * data.count;
        var power = bands.getPowerBand(faction.id);
        // стоимость зависит от уровня влияния
        price -= parseInt(price * power);
        price = Math.clamp(price, bands.drugsPriceMin[data.index] * data.count, price);
        if (character.cash < price) return notifs.error(player, `Необходимо $${price}`, header);

        // inventory.fullDeleteItemsByParams(itemIds[index], ["faction", "owner"], [character.factionId, character.id]);
        var params = {
            count: data.count,
        };
        money.removeCash(player, price, (res) => {
            if (!res) return notifs.error(player, `Ошибка списания наличных`, header);
        }, `Покупка нарко в притоне`);
        inventory.addItem(player, itemIds[data.index], params, async (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вы приобрели ${inventory.getInventoryItem(itemIds[data.index]).name} (${data.count} г.)`, header);
            player.call(`prompt.show`, [`Влияние вашей банды снизило цену на ${parseInt(power * 100)}%`]);
            const countResources = Math.clamp(drugs.drugsStash.resources - data.count * drugs.resourcesPerGr, 0, drugs.drugsStash.resourcesMax);
            await drugs.setDrugsStashResources(countResources);
            drugs.drugsStashLabelUpdate();
        });
    },
    "player.faction.changed": (player, oldVal) => {
        if (!bands.inWar(oldVal)) return;
        player.call(`bands.capture.stop`);
    },
    "playerDeath": (player, reason, killer) => {
        // killer = player; // for tests
        if (!killer || !killer.character) return;
        if (!player.character) return;
        if (!player.character.factionId) return;
        if (!factions.isBandFaction(player.character.factionId)) return;
        if (!bands.inWar(player.character.factionId)) return;
        if (player.getVariable("knocked")) return;
        if (!killer.character.factionId) return;
        if (!factions.isBandFaction(killer.character.factionId)) return;
        if (killer.character.factionId == player.character.factionId) return;
        if (!bands.inWar(killer.character.factionId)) return;

        if (!bands.isInBandZones(player.position)) return;
        if (!bands.isInBandZones(killer.position)) return;
        /*
        // Засчитывать килл только в зоне капта
        var zone = bands.getZoneByPos(player.position);
        if (!zone) return;
        if (!bands.wars[zone.id]) return;

        var killerZone = bands.getZoneByPos(killer.position);
        if (!killerZone) return;
        if (zone.id != killerZone.id) return;*/
        var zoneId = parseInt(Object.keys(bands.wars)[0]);

        player.lastWarDeathTime = Date.now();

        bands.checkReveangeKill(killer);
        bands.giveScore(killer, player, reason, zoneId);
    },
    "customDeath": (player, reason, killer) => {
        // killer = player; // for tests
        if (!killer || !killer.character) return;
        if (!player.character) return;
        if (!player.character.factionId) return;
        if (!factions.isBandFaction(player.character.factionId)) return;
        if (!bands.inWar(player.character.factionId)) return;
        if (player.getVariable("knocked")) return;
        if (!killer.character.factionId) return;
        if (!factions.isBandFaction(killer.character.factionId)) return;
        if (killer.character.factionId == player.character.factionId) return;
        if (!bands.inWar(killer.character.factionId)) return;

        if (!bands.isInBandZones(player.position)) return;
        if (!bands.isInBandZones(killer.position)) return;
        /*
        // Засчитывать килл только в зоне капта
        var zone = bands.getZoneByPos(player.position);
        if (!zone) return;
        if (!bands.wars[zone.id]) return;

        var killerZone = bands.getZoneByPos(killer.position);
        if (!killerZone) return;
        if (zone.id != killerZone.id) return;*/
        var zoneId = parseInt(Object.keys(bands.wars)[0]);

        player.lastWarDeathTime = Date.now();

        bands.checkReveangeKill(killer);
        bands.giveScore(killer, player, reason, zoneId);
    },
    "bands.vehicle.hack": (player, vehId) => {
        let header = 'Взлом замка';
        let vehicle = mp.vehicles.at(vehId);
        if (!vehicle) return notifs.error(player, 'Автомобиль не найден', header);
        if (!vehicle.locked) return notifs.warning(player, 'Автомобиль уже открыт', header);

        let diff = Date.now() - vehicle.lastLockPickTime;
        if (vehicle.lastLockPickTime && diff < bands.lockPickCooldown)
            return notifs.warning(player, `Ожидайте ${Math.round((bands.lockPickCooldown - diff) / 1000)} сек.`, header);

        let lockPick = inventory.getItemByItemId(player, 148);
        if (!lockPick) return notifs.error(player, 'У вас нет отмычки', header);

        let rand = Math.random();
        if (rand <= bands.lockPickChance) {
            vehicle.locked = false;
            notifs.success(player, 'Вы взломали замок автомобиля', header);
        } else {
            notifs.error(player, 'Отмычка сломалась при взломе', header);
        }
        vehicle.lastLockPickTime = Date.now();
        inventory.deleteItem(player, lockPick);
    }
};
