let bizes = call('bizes');
let mafia = call('mafia');
let factions = call('factions');
let inventory = call('inventory');
let logger = call('logger');
let money = call('money');
let notifs = call('notifications');
let police = call('police');

module.exports = {
    "init": () => {
        mafia.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        player.call(`mafia.mafiaZones.init`, [mafia.convertToClientMafiaZones()]);

        var factionId = player.character.factionId;
        if (!factions.isMafiaFaction(factionId)) return;

        mp.events.call(`mapCase.crm.init`, player);

        var warZoneIds = Object.keys(mafia.wars);
        if (!warZoneIds.length) return;
        var war = mafia.wars[warZoneIds[0]];
        var time = mafia.haveTime(war) / 1000;
        if (war.mafia.id == factionId) player.call(`mafia.bizWar.start`, [factionId, war.enemyMafia.id, time, war.mafia.score, war.enemyMafia.score]);
        else if (war.enemyMafia.id == factionId) player.call(`mafia.bizWar.start`, [factionId, war.mafia.id, time, war.enemyMafia.score, war.mafia.score]);
    },
    "mafia.bizWar.show": (player) => {
        var factionId = player.character.factionId;
        if (!factions.isMafiaFaction(factionId)) return notifs.error(player, `Вы не член мафии`);

        var data = {
            bizes: bizes.getBizesForBizWar(factionId),
            names: factions.getMafiaFactions().map(x => x.name),
            bizCount: bizes.getBizCount(),
        };
        if (!data.bizes.length) return notifs.error(player, `Все бизнесы захвачены`);
        player.call(`mafia.bizWar.showMenu`, [data]);
    },
    "mafia.bizWar.start": (player, bizId) => {
        mafia.startBizWar(player, bizId);
    },
    "mafia.storage.guns.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад мафии`);
        if (!factions.isMafiaFaction(player.character.factionId)) return notifs.error(player, `Вы не член мафии`, `Склад мафии`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        var storage = factions.getStorage(player.insideFactionWarehouse);
        if (!storage.isOpen) return notifs.error(player, `Склад мафии закрыт`, header);

        if (faction.ammo < mafia.gunAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);

        var itemIds = [44, 46, 90, 48, 49, 96, 50, 22];
        var weaponIds = ["weapon_pistol", "weapon_pistol50", "weapon_minismg", "weapon_smg", "weapon_sawnoffshotgun", "weapon_dbshotgun", "weapon_assaultrifle", "weapon_carbinerifle"];
        let weaponMaterials = [50, 50, 70, 80, 60, 70, 150, 200];
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
    "mafia.storage.ammo.take": (player, values) => {
        values = JSON.parse(values);
        var index = values[0];
        var ammo = values[1];
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад мафии`);
        if (!factions.isMafiaFaction(player.character.factionId)) return notifs.error(player, `Вы не член мафии`, `Склад мафии`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var rank = factions.getRankById(faction, character.factionRank);
        var header = `Склад ${faction.name}`;

        var storage = factions.getStorage(player.insideFactionWarehouse);
        if (!storage.isOpen) return notifs.error(player, `Склад мафии закрыт`, header);

        var itemIds = [37, 38, 40, 39];
        let ammoMaterials = [1, 1, 1, 1];
        index = Math.clamp(index, 0, itemIds.length - 1);
        if (faction.ammo < mafia.ammoAmmo * ammo) return notifs.error(player, `Недостаточно боеприпасов`, header);

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

            notifs.success(player, `Вам выданы ${inventory.getInventoryItem(itemIds[index]).name} (${ammo} ед. - ${ammoMaterials[index] * ammo})`, header);
            factions.setAmmo(faction, faction.ammo - ammoMaterials[index] * ammo);
        });
    },
    "mafia.storage.lockPick.take": (player) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад мафии`);
        if (!factions.isMafiaFaction(player.character.factionId)) return notifs.error(player, `Вы не член группировки`, `Склад мафии`);

        let character = player.character;
        let faction = factions.getFaction(character.factionId);
        let rank = factions.getRankById(faction, character.factionRank);
        let header = `Склад ${faction.name}`;

        let storage = factions.getStorage(player.insideFactionWarehouse);
        if (!storage.isOpen) return notifs.error(player, `Склад мафии закрыт`, header);

        if (faction.ammo < mafia.lockPickAmmo) return notifs.error(player, `Недостаточно материалов`, header);

        if (mafia.lockPickRank > rank.rank) return notifs.error(player, `Доступно с ${mafia.lockPickRank} ранга`, header);

        inventory.addItem(player, 148, {}, (e) => {
            if (e) return notifs.error(player, e, header);

            notifs.success(player, `Вам выдана отмычка (${mafia.lockPickAmmo} мат.)`, header);
            factions.setAmmo(faction, faction.ammo - mafia.lockPickAmmo);
        });
    },
    "mafia.storage.cash.put": (player, sum) => {
        sum = Math.clamp(sum, 0, 1000000);
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Общак мафии`);

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
    "mafia.storage.cash.take": (player, sum) => {
        sum = Math.clamp(sum, 0, 1000000);
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Общак мафии`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var header = `Общак ${faction.name}`;

        if (!factions.isLeader(player)) return notifs.error(player, `Нет доступа`, header);
        if (faction.cash < sum) return notifs.error(player, `Общак не имеет $${sum}`, header);
        money.addCash(player, sum, (res) => {
            if (!res) return notifs.error(player, `Ошибка начисления наличных`, header);

            faction.cash -= sum;
            faction.save();
        }, `Снятие с общака ${faction.name}`);

        notifs.success(player, `Снято $${sum}`, header);

        mp.players.forEach(rec => {
            if (!rec.character) return;
            if (rec.character.factionId != player.character.factionId) return;

            notifs.info(rec, `${player.name} снял $${sum}`, header);
        });
    },
    "mafia.storage.state": (player, open) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Общак мафии`);

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

            notifs.info(rec, `${player.name} ${str} склад мафии`, header);
        });
    },
    "mafia.power.sell": (player, data) => {
        data = JSON.parse(data);
        data.sum = Math.clamp(data.sum, 100, 100000);
        var header = `Продажа крыши`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!factions.isMafiaFaction(player.character.factionId)) return out(`Вы не член мафии`);
        var rank = factions.getRank(player.character.factionId, mafia.bizWarRank);
        if (player.character.factionRank < rank.id) return out(`Доступно с ранга ${rank.name}`);
        var rec = mp.players.at(data.recId);
        if (!rec || !rec.character) return out(`Игрок #${data.recId} не найден`);
        if (player.dist(rec.position) > 10) return out(`${rec.name} далеко`);
        if (!factions.isMafiaFaction(rec.character.factionId)) return out(`${rec.name} не член мафии`);
        rank = factions.getRank(rec.character.factionId, mafia.bizWarRank);
        if (rec.character.factionRank < rank.id) return out(`${rec.name} еще мал для таких сделок`);
        if (player.character.factionId == rec.character.factionId) return out(`${rec.name} в вашей мафии`);

        var biz = bizes.getNearBiz(player);
        if (!biz) return out(`Необходимо находиться у бизнеса`);
        if (biz.info.type == 10) return out(`Нельзя продать крышу клуба`);
        if (biz.info.factionId != player.character.factionId) return out(`${biz.info.name} находится не под вашей крышей`);

        rec.offer = {
            type: "mafia_power_sell",
            playerId: player.id,
            bizId: biz.info.id,
            sum: data.sum
        };
        rec.call(`offerDialog.show`, [`mafia_power_sell`, {
            player: player.name,
            biz: biz.info.name,
            sum: data.sum
        }]);
    },
    "mafia.power.sell.accept": (player) => {
        var header = `Продажа крыши`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.offer || player.offer.type != "mafia_power_sell") return out(`Сделка не найдена`);
        var offer = player.offer;
        delete player.offer;

        var seller = mp.players.at(offer.playerId);
        if (!seller || !seller.character) return out(`Мафиозник не найден`);
        if (player.dist(seller.position) > 10) return out(`${seller.name} далеко`);
        if (player.character.cash < offer.sum) return out(`Необходимо $${sum}`);

        var biz = bizes.getBizById(offer.bizId);
        if (biz.info.type == 10) return out(`Нельзя продать крышу клуба`);
        if (biz.info.factionId != seller.character.factionId) return out(`${biz.info.name} не под крышей ${seller.name}`);

        money.removeCash(player, offer.sum, (res) => {
            if (!res) return out(`Ошибка списания наличных`);
            money.addCash(seller, offer.sum, (res) => {
                if (!res) return notifs.error(seller, `Ошибка начисления наличных`, header);

                bizes.setFactionId(offer.bizId, player.character.factionId);
            }, `Продажа крыши бизнеса #${biz.info.id} игроку ${player.name}`);
        }, `Покупка крыши бизнеса #${biz.info.id} у игрока ${seller.name}`);

        notifs.success(seller, `Крыша ${biz.info.name} продана`, header);
        notifs.success(player, `Крыша ${biz.info.name} куплена`, header);
    },
    "mafia.power.sell.cancel": (player) => {
        if (!player.offer) return;
        var inviter = mp.players.at(player.offer.playerId);
        delete player.offer;
        if (!inviter || !inviter.character) return;
        notifs.info(player, `Предложение отклонено`);
        notifs.info(inviter, `${player.name} отклонил предложение`);
    },
    // снять/надеть веревку
    "mafia.cuffs": (player, data) => {
        if (typeof data == 'string') data = JSON.parse(data);
        var header = `Веревка`;
        var rec = (data.recId != null) ? mp.players.at(data.recId) : mp.players.getNear(player);
        // rec = player; // for tests
        if (!rec || !rec.character) return notifs.error(player, `Игрок не найден`, header);
        var dist = player.dist(rec.position);
        if (dist > 5) return notifs.error(player, `${rec.name} далеко`, header);
        if (rec.getVariable("afk")) return notifs.error(player, `${rec.name} не активен`, `ANTI-AFK`);
        var character = player.character;
        if (rec.vehicle) return notifs.error(player, `${rec.name} находится в авто`, header);

        if (!rec.cuffs) {
            if (!factions.isCrimeFaction(character.factionId)) return notifs.error(player, `Вы не член мафии/банды`, header);
            var cuffs = (data.cuffsSqlId) ? inventory.getItem(player, data.cuffsSqlId) : inventory.getItemByItemId(player, 54);
            if (!cuffs) return notifs.error(player, `Предмет ${inventory.getName(54)} не найден`, header);
            inventory.deleteItem(player, cuffs);
            police.setCuffs(rec, cuffs);

            notifs.info(rec, `${player.name} связал вас`, header);
            notifs.success(player, `${rec.name} связан`, header);
        } else {
            if (!factions.isCrimeFaction(character.factionId) && !factions.isPoliceFaction(character.factionId) && !factions.isFibFaction(character.factionId)) return notifs.error(player, `Вы не член ОПГ/порядка`, header);
            if (rec.cuffs.itemId != 54) return notifs.error(player, `${rec.name} был обездижен с помощью ${inventory.getName(rec.cuffs.itemId)}`, header);
            inventory.addOldItem(player, rec.cuffs, (e) => {
                if (e) return notifs.error(player, e, header);
            });

            notifs.info(rec, `${player.name} развязал вас`, header);
            notifs.info(player, `${rec.name} развязан`, header);

            police.setCuffs(rec, null);
            delete rec.isFollowing;
            rec.call(`mafia.follow.stop`);
        }
    },
    // снять/надеть мешок на голову
    "mafia.bag": (player, data) => {
        if (typeof data == 'string') data = JSON.parse(data);
        var header = `Мешок`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var rec = (data.recId != null) ? mp.players.at(data.recId) : mp.players.getNear(player);
        // rec = player; // for tests

        if (!rec || !rec.character) return out(`Игрок не найден`);
        var dist = player.dist(rec.position);
        if (dist > 5) return out(`${rec.name} далеко`);
        var character = player.character;
        if (rec.vehicle) return notifs.error(player, `${rec.name} находится в авто`, header);

        if (!rec.bag) {
            if (!factions.isCrimeFaction(character.factionId)) return notifs.error(player, `Вы не член мафии/банды`, header);
            var bag = (data.bagSqlId) ? inventory.getItem(player, data.bagSqlId) : inventory.getItemByItemId(player, 55);
            if (!bag) return out(`Предмет ${inventory.getName(55)} не найден`);
            inventory.deleteItem(player, bag);
            mafia.setBag(rec, bag);

            notifs.info(rec, `${player.name} надел на вас мешок`, header);
            notifs.success(player, `${rec.name} с мешком на голове`, header);
        } else {
            if (!factions.isCrimeFaction(character.factionId) && !factions.isPoliceFaction(character.factionId) && !factions.isFibFaction(character.factionId)) return notifs.error(player, `Вы не член ОПГ/порядка`, header);
            if (rec.bag.itemId != 55) return out(`${rec.name} имеет на голове ${inventory.getName(rec.bag.itemId)}`);
            inventory.addOldItem(player, rec.bag, (e) => {
                if (e) return out(player, e, header);
            });

            notifs.info(rec, `${player.name} снял с вас мешок`, header);
            notifs.info(player, `${rec.name} без мешка на голове`, header);

            mafia.setBag(rec, null);
        }
    },
    "mafia.follow": (player, recId) => {
        var header = `Следование`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return out(`Гражданин не найден`);
        if (rec.getVariable("afk")) return notifs.error(player, `${rec.name} не активен`, `ANTI-AFK`);
        if (!factions.isCrimeFaction(player.character.factionId)) return out(`Нет прав для использования`);
        if (!rec.isFollowing) {
            if (!rec.cuffs || rec.cuffs.itemId != 54) return out(`${rec.name} не связан`);
            rec.isFollowing = true;
            rec.call(`mafia.follow.start`, [player.id]);
            notifs.success(player, `${rec.name} следует за вами`, header);
            notifs.info(rec, `Вы следуете за ${player.name}`, header);
        } else {
            delete rec.isFollowing;
            rec.call(`mafia.follow.stop`);
            notifs.success(player, `${rec.name} не следует за вами`, header);
            notifs.info(rec, `Вы не следуете за ${player.name}`, header);
        }
    },
    "mafia.vehicle.boot.put": (player, recId) => {
        var header = `Багажник`;
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return notifs.error(player, `Игрок не найден`, header);
        if (!rec.cuffs) return notifs.error(player, `${rec.name} не связан`, header);
        if (rec.getVariable("inBoot") != null) return notifs.error(player, `${rec.name} уже в багажнике`, header);
        if (!factions.isMafiaFaction(player.character.factionId)) return notifs.error(player, `Вы не член мафии`, header);

        var veh = mp.vehicles.getNear(player);
        if (!veh) return notifs.error(player, `Авто не найдено`, header);
        var dist = player.dist(veh.position);
        if (dist > 10) return notifs.error(player, `Авто далеко`, header);
        if (!veh.db || veh.key != 'faction' || veh.owner != player.character.factionId) return notifs.error(player, `Авто не принадлежит вашей мафии`, header);
        if (!veh.getVariable("trunk")) return notifs.error(player, `Багажник закрыт`, header);

        if (veh.getVariable("inBoot") != null) return notifs.error(player, `В багажнике нет места`, header);

        rec.setVariable("inBoot", veh.id);
        veh.setVariable("inBoot", rec.id);

        notifs.success(player, `${rec.name} посажен в багажник`, header);
        notifs.info(rec, `${player.name} посадил вас в багажник`, header);
    },
    "mafia.vehicle.boot.remove": (player, recId) => {
        var header = `Багажник`;
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return notifs.error(player, `Игрок не найден`, header);
        if (rec.getVariable("inBoot") == null) return notifs.error(player, `${rec.name} не в багажнике`, header);
        if (!factions.isMafiaFaction(player.character.factionId)) return notifs.error(player, `Вы не член мафии`, header);
        // TODO: проверка на багажник

        mp.vehicles.at(rec.getVariable("inBoot")).setVariable("inBoot", null);
        rec.setVariable("inBoot", null);

        notifs.success(player, `${rec.name} высажен из багажника`, header);
        notifs.info(rec, `${player.name} высадил вас из багажника`, header);
    },
    "player.faction.changed": (player, oldVal) => {
        if (!mafia.inWar(oldVal)) return;
        player.call(`mafia.bizWar.stop`);
    },
    "playerDeath": (player, reason, killer) => {
        if (player.bag) mafia.setBag(player, false);
        // killer = player; // for tests
        if (!killer || !killer.character) return;
        if (!player.character) return;
        if (!player.character.factionId) return;
        if (!factions.isMafiaFaction(player.character.factionId)) return;
        if (!mafia.inWar(player.character.factionId)) return;
        if (player.getVariable("knocked")) return;
        if (!killer.character.factionId) return;
        if (!factions.isMafiaFaction(killer.character.factionId)) return;
        if (killer.character.factionId == player.character.factionId) return;
        if (!mafia.inWar(killer.character.factionId)) return;

        var zone = mafia.getZoneByPos(player.position);
        if (!zone) return;
        if (!mafia.wars[zone.id]) return;

        var killerZone = mafia.getZoneByPos(killer.position);
        if (!killerZone) return;
        if (zone.id != killerZone.id) return;

        player.lastWarDeathTime = Date.now();

        mafia.checkReveangeKill(killer);
        mafia.giveScore(killer, player, reason, zone);
    },
    "customDeath": (player, reason, killer) => {
        if (player.bag) mafia.setBag(player, false);
        // killer = player; // for tests
        if (!killer || !killer.character) return;
        if (!player.character) return;
        if (!player.character.factionId) return;
        if (!factions.isMafiaFaction(player.character.factionId)) return;
        if (!mafia.inWar(player.character.factionId)) return;
        if (player.getVariable("knocked")) return;
        if (!killer.character.factionId) return;
        if (!factions.isMafiaFaction(killer.character.factionId)) return;
        if (killer.character.factionId == player.character.factionId) return;
        if (!mafia.inWar(killer.character.factionId)) return;

        var zone = mafia.getZoneByPos(player.position);
        if (!zone) return;
        if (!mafia.wars[zone.id]) return;

        var killerZone = mafia.getZoneByPos(killer.position);
        if (!killerZone) return;
        if (zone.id != killerZone.id) return;

        player.lastWarDeathTime = Date.now();

        mafia.checkReveangeKill(killer);
        mafia.giveScore(killer, player, reason, zone);
    },
    "mafia.treasury.menu.show": (player) => {
        if (!player.character) return;
        if (!factions.isMafiaFaction(player.character.factionId)) return;
        if (!factions.isLeader(player)) return notifs.warning(player, 'Управление казной доступно только лидеру');

        let cash = factions.getFaction(player.character.factionId).cash;
        player.call('mafia.treasury.menu.show', [cash]);
    },
    "mafia.treasury.cash.send": (player, data) => {
        if (!player.character) return;
        if (!factions.isMafiaFaction(player.character.factionId)) return;
        if (!factions.isLeader(player)) return notifs.warning(player, 'Управление казной доступно только лидеру');

        let { targetId, amount } = JSON.parse(data);
        let faction = factions.getFaction(player.character.factionId);

        if (targetId == player.character.factionId) {
            notifs.error(player, 'Нельзя перевести деньги себе');
            player.call('mafia.treasury.cash.send.finish');
            return;
        }
        if (amount > faction.cash) {
            notifs.error(player, 'В казне недостаточно средств');
            player.call('mafia.treasury.cash.send.finish');
            return;
        }
        factions.moveCash(player.character.factionId, targetId, amount);
        notifs.success(player, 'Вы перевели деньги другой организации');
        player.call('mafia.treasury.cash.send.finish');
    },
};
