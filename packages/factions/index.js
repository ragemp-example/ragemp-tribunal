"use strict";
var bands = require('../bands');
var inventory = call('inventory');
var mafia = call('mafia');
var money = require('../money')
var notifs = require('../notifications');
var vehicles = call('vehicles');
var utils = call('utils');

module.exports = {
    // Организации
    factions: [],
    // Маркеры организаций
    markers: [],
    // Блипы организаций
    blips: [],
    // Маркеры складов организаций
    warehouses: [],
    // Маркеры выдачи предметов организаций
    storages: [],
    // Маркеры шкафов организаций
    holders: [],
    // Маркеры общих шкафов организаций
    commonHolders: [],
    // Склад нескончаемых боеприпасов (навешен blip)
    ammoWarehouse: null,
    // Склад нескончаемых медикаментов (навешен blip)
    medicinesWarehouse: null,
    // Кол-во боеприпасов в ящике
    ammoBox: 500,
    // Кол-во медикаментов в ящике
    medicinesBox: 500,
    // Кол-во материалов в ящике
    materialsBox: 500,
    // TODO: Добавить адекватные модели авто
    // Модели авто, в которые можно грузить боеприпасы
    ammoVehModels: ["barracks", "barracks3", "moonbeam", "youga2", "insurgent2"],
    // Модели авто, в которые можно грузить медикаменты
    medicinesVehModels: ["granger", "fbi2"],
    // Макс. кол-во боеприпасов в авто
    ammoVehMax: 3000,
    // Макс. кол-во медикаментов в авто
    medicinesVehMax: 3000,
    // Белый лист организаций, которые могут пополнять склады
    whiteListWarehouse: {
        "ammo": {
            2: [4],
            3: [4],
            6: [1, 2, 3, 6],
            // банды
            8: [8],
            9: [9],
            10: [10],
            11: [11],
            // мафии
            12: [8, 9, 10, 11, 12],
            13: [8, 9, 10, 11, 13],
            14: [8, 9, 10, 11, 14],
        },
        "medicines": {
            5: [2, 3, 4, 5, 6]
        }
    },
    // Кол-во минут онлайна, необходимых для получения ЗП
    payMins: 15,
    // Стоимость респавна авто
    vehRespawnPrice: 1000,
    // Мин. время простоя, чтобы авто зареспавнилось лидером
    vehWaitSpawn: 5 * 60 * 1000,
    // Бонус к ЗП (1 - x1)
    bonusPay: 1,

    async init() {
        await this.loadFactionsFromDB();
        await this.initFactionMarkers();
        this.createAmmoWarehouseMarker();
        this.createMedicinesWarehouseMarker();
        mp.events.call('factions.loaded');
    },
    async loadFactionsFromDB() {
        var dbFactions = await db.Models.Faction.findAll({
            include: [{
                    model: db.Models.FactionRank,
                    as: "ranks",
                },
                {
                    model: db.Models.FactionClothesRank,
                    as: "clothesRanks",
                },
                {
                    model: db.Models.FactionItemRank,
                    as: "itemRanks",
                },
            ],
            order: ['id']
        });
        dbFactions.forEach(faction => {
            faction.ranks.sort((a, b) => {
                return a.id - b.id;
            });
            faction.clothesRanks.sort((a, b) => {
                return a.id - b.id;
            });
            faction.itemRanks.sort((a, b) => {
                return a.id - b.id;
            });
        });
        this.factions = dbFactions;
        console.log(`[FACTIONS] Организации загужены (${dbFactions.length} шт.)`);
    },
    async initFactionMarkers() {
        for (var i = 0; i < this.factions.length; i++) {
            var faction = this.factions[i];
            this.createFactionMarker(faction);
            this.createWarehouseMarker(faction);
            this.createStorageMarker(faction);
            this.createHolderMarker(faction);
            await this.createCommonHolderMarker(faction);
        }
    },
    createFactionMarker(faction) {
        var pos = new mp.Vector3(faction.x, faction.y, faction.z - 1);

        this.markers.push(mp.markers.new(1, pos, 0.5, {
            color: [255, 255, 255, 70],
            dimension: faction.d
        }));
        this.blips.push(mp.blips.new(faction.blip, pos, {
            color: faction.blipColor,
            name: faction.name,
            shortRange: 10,
            scale: 1,
            dimension: faction.d
        }));
    },
    createWarehouseMarker(faction) {
        if (!faction.wX) return;
        var header = `Склад ${faction.name}`;
        var pos = new mp.Vector3(faction.wX, faction.wY, faction.wZ - 1);

        var warehouse = mp.markers.new(1, pos, 0.5, {
            color: [0, 187, 255, 70],
            dimension: faction.wD
        });

        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, warehouse.dimension);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;

            player.call("factions.insideFactionWarehouse", [true]);
            player.insideFactionWarehouse = faction;
        };
        colshape.onExit = (player) => {
            player.call("factions.insideFactionWarehouse", [false]);
            delete player.insideFactionWarehouse;
        };
        warehouse.colshape = colshape;

        var pos = warehouse.position;
        pos.z += 1.5;
        warehouse.label = mp.labels.new(this.getWarehouseLabelText(faction),
            pos, {
                los: false,
                font: 0,
                drawDistance: 10,
                dimension: warehouse.dimension
            });
        this.warehouses.push(warehouse);
    },
    createStorageMarker(faction) {
        var pos = new mp.Vector3(faction.sX, faction.sY, faction.sZ - 1);

        var storage = mp.markers.new(1, pos, 0.5, {
            color: [0, 187, 255, 70],
            dimension: faction.sD
        });
        storage.isOpen = false;
        this.storages.push(storage);

        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, storage.dimension);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (player.character.factionId != faction.id) return notifs.error(player, `Отказано в доступе`, faction.name);

            if (this.isBandFaction(faction.id)) bands.sendStorageInfo(player);
            else if (this.isMafiaFaction(faction.id)) mafia.sendStorageInfo(player);

            player.call("factions.storage.showMenu", [faction.id]);
            player.insideFactionWarehouse = faction.id;
        };
        colshape.onExit = (player) => {
            player.call("selectMenu.hide");
            delete player.insideFactionWarehouse;
        };
        storage.colshape = colshape;
    },
    createHolderMarker(faction) {
        var pos = new mp.Vector3(faction.hX, faction.hY, faction.hZ - 1);

        var holder = mp.markers.new(1, pos, 0.5, {
            color: [0, 187, 255, 70],
            dimension: faction.hD
        });
        holder.inventory = {
            items: {}, // предметов игроков в шкафе
        };
        this.holders.push(holder);

        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, holder.dimension);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (player.character.factionId != faction.id) return notifs.error(player, `Отказано в доступе`, faction.name);

            player.call("prompt.showByName", [`faction_items_holder`]);
            mp.events.call("faction.holder.items.request", player, faction);
        };
        colshape.onExit = (player) => {
            player.call(`prompt.hide`);
            mp.events.call("faction.holder.items.clear", player);
        };
        holder.colshape = colshape;
    },
    async createCommonHolderMarker(faction) {
        let pos = new mp.Vector3(faction.chX, faction.chY, faction.chZ - 1);

        let holder = mp.markers.new(1, pos, 0.5, {
            color: [255, 64, 150, 70],
            dimension: faction.chD
        });
        holder.inventory = {
            faction: faction,
            items: [],
        };
        holder.isOpen = false;
        holder = await inventory.initFactionCommonInventory(holder);
        this.commonHolders.push(holder);
        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
        colshape.dimension = holder.dimension;
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (player.character.factionId !== faction.id) return notifs.error(player, `Отказано в доступе`, faction.name);
            if (!holder.isOpen) return notifs.error(player, `Общий шкаф закрыт`, faction.name);
            player.call("prompt.showByName", [`faction_items_common_holder`]);
            mp.events.call("faction.holder.common.items.request", player, faction);
        };
        colshape.onExit = (player) => {
            player.call(`prompt.hide`);
            mp.events.call("faction.holder.common.items.clear", player, holder);
        };
        holder.colshape = colshape;
    },
    createAmmoWarehouseMarker() {
        var pos = new mp.Vector3(211.51, -3091.53, 7.01 - 1);

        this.ammoWarehouse = mp.markers.new(1, pos, 0.5, {
            color: [255, 187, 0, 100]
        });
        this.ammoWarehouse.blip = mp.blips.new(473, pos, {
            color: 1,
            name: "Боеприпасы",
            shortRange: 10,
            scale: 1
        });
        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (!this.isArmyFaction(player.character.factionId)) return notifs.error(player, `Нет доступа`, `Склад боеприпасов`);
            player.call("factions.insideWarehouse", [true, "ammo"]);
            player.insideWarehouse = true;
        };
        colshape.onExit = (player) => {
            player.call("factions.insideWarehouse", [false]);
            delete player.insideWarehouse;
        };
    },
    createMedicinesWarehouseMarker() {
        var pos = new mp.Vector3(3608, 3720.03, 29.69 - 2);

        this.ammoWarehouse = mp.markers.new(1, pos, 2, {
            color: [255, 187, 0, 100]
        });
        this.ammoWarehouse.blip = mp.blips.new(153, pos, {
            color: 1,
            name: "Медикаменты",
            shortRange: 10,
            scale: 1
        });
        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 2.5);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (!this.isHospitalFaction(player.character.factionId)) return notifs.error(player, `Нет доступа`, `Склад медикаментов`);
            player.call("factions.insideWarehouse", [true, "medicines"]);
            player.insideWarehouse = true;
        };
        colshape.onExit = (player) => {
            player.call("factions.insideWarehouse", [false]);
            delete player.insideWarehouse;
        };
    },
    getFaction(id) {
        return this.factions[id - 1];
    },
    getMarker(id) {
        return this.markers[id - 1];
    },
    getWarehouse(id) {
        return this.warehouses[id - 1];
    },
    getStorage(id) {
        return this.storages[id - 1];
    },
    getHolder(id) {
        return this.holders[id - 1];
    },
    getCommonHolder(id) {
        return this.commonHolders[id - 1];
    },
    getBlip(id) {
        return this.blips[id - 1];
    },
    getBlipsPos(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        if (!faction) return null;
        var positions = {
            "holder": this.getHolder(faction.id).position,
            "storage": this.getStorage(faction.id).position,
            //"warehouse": this.getWarehouse(faction.id).position,
            "commonHolder": this.getCommonHolder(faction.id).position,
            "blipColor": faction.blipColor
        };
        let warehouse = this.getWarehouse(faction.id);
        if (warehouse) {
            positions.warehouse = warehouse.position;
            positions.warehouse.d = warehouse.dimension;
        }
        positions.holder.d = this.getHolder(faction.id).dimension;
        positions.storage.d = this.getStorage(faction.id).dimension;
        //positions.warehouse.d = this.getWarehouse(faction.id).dimension;
        positions.commonHolder.d = this.getCommonHolder(faction.id).dimension;
        return positions;
    },
    getFactionName(player) {
        if (!player.character.factionId) return null;
        return this.getFaction(player.character.factionId).name;
    },
    getFactionNameById(factionId) {
        let faction = this.getFaction(factionId);
        if (faction == null) return null;
        return faction.name;
    },
    getRank(faction, rank) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction.ranks[rank - 1];
    },
    getRankById(faction, rankId) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        var ranks = faction.ranks;
        for (var i = 0; i < ranks.length; i++) {
            if (ranks[i].id == rankId) return ranks[i];
        }
        return null;
    },
    getRankName(player) {
        if (!player.character.factionId) return null;
        return this.getRankById(player.character.factionId, player.character.factionRank).name;
    },
    getMinRank(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction.ranks[0];
    },
    getMaxRank(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction.ranks[faction.ranks.length - 1];
    },
    getRankNames(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        var names = [];
        for (var i = 0; i < faction.ranks.length; i++) {
            names.push(faction.ranks[i].name);
        }
        return names;
    },
    getRanks(faction) {
        if (!faction) return null;
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction.ranks;
    },
    getClientRanks(faction) {
        if (!faction) return null;
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction.ranks.map(x => {
            return {
                id: x.id,
                name: x.name,
                rank: x.rank,
                pay: x.pay,
                salary: x.pay
            }
        });
    },
    setLeader(faction, player) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        var character = player.character;
        var oldVal = character.factionId;
        character.factionId = faction.id;
        character.factionRank = this.getMaxRank(faction).id;
        character.save();

        player.setVariable("factionId", character.factionId);
        player.call(`factions.faction.set`, [character.factionId, this.getClientRanks(faction), this.getBlipsPos(faction)]);
        // player.call(`mapCase.init`, [player.name, faction.id]);
        if (this.isGovernmentFaction(faction)) mp.events.call(`mapCase.gover.init`, player);
        else if (this.isPoliceFaction(faction)) mp.events.call(`mapCase.pd.init`, player);
        else if (this.isArmyFaction(faction)) mp.events.call(`mapCase.army.init`, player);
        else if (this.isFibFaction(faction)) mp.events.call(`mapCase.fib.init`, player);
        else if (this.isHospitalFaction(faction)) mp.events.call(`mapCase.ems.init`, player);
        else if (this.isNewsFaction(faction)) mp.events.call(`mapCase.news.init`, player);
        else if (this.isCrimeFaction(faction)) mp.events.call(`mapCase.crm.init`, player);

        mp.events.call(`player.faction.changed`, player, oldVal);
        player.call('player.faction.changed', []);
    },
    isLeader(player, factionId = null) {
        if (!factionId) factionId = player.character.factionId;
        if (!factionId) return false;

        var maxRank = this.getMaxRank(factionId);
        return player.character.factionRank == maxRank.id;
    },
    setBlip(faction, type, color) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        var blip = this.getBlip(faction.id);
        blip.model = type;
        blip.color = color;
        faction.blip = type;
        faction.blipColor = color;
        faction.save();
    },
    setAmmoRank(faction, rank) {
        if (typeof faction == 'number') faction = this.getFaction(faction);

        faction.ammoRank = rank;
        faction.save();
    },
    addMember(faction, player) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        var character = player.character;
        if (character.factionId) this.fullDeleteItems(character.id, character.factionId);
        var oldVal = character.factionId;
        character.factionId = faction.id;
        character.factionRank = this.getMinRank(faction).id;
        character.save();

        player.setVariable("factionId", character.factionId);
        player.call(`factions.faction.set`, [character.factionId, this.getClientRanks(faction), this.getBlipsPos(faction)]);
        // player.call(`mapCase.init`, [player.name, faction.id]);
        if (this.isGovernmentFaction(faction)) mp.events.call(`mapCase.gover.init`, player);
        else if (this.isPoliceFaction(faction)) mp.events.call(`mapCase.pd.init`, player);
        else if (this.isFibFaction(faction)) mp.events.call(`mapCase.fib.init`, player);
        else if (this.isArmyFaction(faction)) mp.events.call(`mapCase.army.init`, player);
        else if (this.isHospitalFaction(faction)) mp.events.call(`mapCase.ems.init`, player);
        else if (this.isNewsFaction(faction)) mp.events.call(`mapCase.news.init`, player);
        else if (this.isCrimeFaction(faction)) mp.events.call(`mapCase.crm.init`, player);

        mp.events.call(`player.faction.changed`, player, oldVal);
        player.call('player.faction.changed', []);
        if (player.character.job) mp.events.call(`jobs.leave`, player);
    },
    deleteMember(player) {
        var character = player.character;
        if (this.isGovernmentFaction(character.factionId)) require('../mapCase').removeGoverMember(player);
        else if (this.isPoliceFaction(character.factionId)) require('../mapCase').removePoliceMember(player);
        else if (this.isFibFaction(character.factionId)) require('../mapCase').removeFibMember(player);
        else if (this.isArmyFaction(character.factionId)) require('../mapCase').removeArmyMember(player);
        else if (this.isHospitalFaction(character.factionId)) require('../mapCase').removeHospitalMember(player);
        else if (this.isNewsFaction(character.factionId)) require('../mapCase').removeNewsMember(player);
        else if (this.isCrimeFaction(character.factionId)) require('../mapCase').removeCrmMember(player);
        this.fullDeleteItems(character.id, character.factionId);
        var oldVal = character.factionId;
        character.factionId = null;
        character.factionRank = null;
        character.save();

        player.setVariable("factionId", character.factionId);
        player.call(`factions.faction.set`, [null, []]);
        player.call(`mapCase.enable`, [false]);

        mp.events.call(`player.faction.changed`, player, oldVal);
        player.call('player.faction.changed', []);
    },
    deleteOfflineMember(character) {
        this.fullDeleteItems(character.id, character.factionId);

        // db.Models.CharacterInventory.destroy({
        //     where: {
        //         playerId: character.id
        //     },
        //     include: {
        //         model: db.Models.CharacterInventoryParam,
        //         where: {
        //             [Op.or]: [{
        //                     key: "owner",
        //                     value: character.id
        //                 },
        //                 {
        //                     key: "faction",
        //                     value: character.factionId
        //                 }
        //             ]
        //         }
        //     }
        // });
        inventory.deleteByParams(character.id, null, ['owner', 'faction'], [character.id, character.factionId]);

        character.factionId = null;
        character.factionRank = null;
        character.save();
    },
    getMembers(player) {
        var members = [];
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (rec.character.factionId != player.character.factionId) return;
            members.push(rec);
        });
        return members;
    },
    async getAllMembers(player) {
        const members = await db.Models.Character.findAll({
            where: {factionId: player.character.factionId},
            raw: true
        });
        return members;
    },
    getVehicles(player) {
        var vehicles = [];
        mp.vehicles.forEach(veh => {
            if (!veh.db || veh.db.key != 'faction') return;
            if (veh.db.owner != player.character.factionId) return;
            vehicles.push(veh);
        });
        return vehicles;
    },
    setRank(player, rank) {
        var character = player.character;
        if (typeof rank == 'number') rank = this.getRank(character.factionId, rank);

        character.factionRank = rank.id;
        character.save();

        mp.events.call("player.factionRank.changed", player);

        var type = "";
        if (this.isGovernmentFaction(character.factionId)) type = "gover";
        else if (this.isPoliceFaction(character.factionId)) type = "pd";
        else if (this.isFibFaction(character.factionId)) type = "fib";
        else if (this.isArmyFaction(character.factionId)) type = "army";
        else if (this.isHospitalFaction(character.factionId)) type = "ems";
        else if (this.isNewsFaction(character.factionId)) type = "news";
        else if (this.isCrimeFaction(character.factionId)) type = "crm";
        if (!type) return;

        var rank = this.getRankById(character.factionId, character.factionRank).rank;
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (rec.character.factionId != character.factionId) return;

            rec.call(`mapCase.${type}.members.rank.set`, [character.id, rank]);
        });
    },
    setOfflineRank(character, rank) {
        if (typeof rank == 'number') rank = this.getRank(factionId, rank);

        character.factionRank = rank.id;
        character.save();
    },
    isGovernmentFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && faction.id == 1;
    },
    isPoliceFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && (faction.id == 2 || faction.id == 3);
    },
    isFibFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && faction.id == 4;
    },
    isHospitalFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && faction.id == 5;
    },
    isArmyFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && (faction.id == 6 || faction.id == 15);
    },
    isNewsFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && faction.id == 7;
    },
    isStateFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && ((faction.id >= 1 && faction.id <= 7) || faction.id == 15);
    },
    isCrimeFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && (this.isBandFaction(faction.id) || this.isMafiaFaction(faction.id));
    },
    isBandFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && ((faction.id >= 8 && faction.id <= 11) || faction.id == 16);
    },
    isMafiaFaction(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        return faction && ((faction.id >= 12 && faction.id <= 14) || faction.id == 17);
    },
    getBandFactions() {
        return this.factions.filter(x => x.id >= 8 && x.id <= 11);
    },
    getMafiaFactions() {
        return this.factions.filter(x => (x.id >= 12 && x.id <= 14) || x.id == 17);
    },
    takeBox(player, type) {
        var header = "";
        if (type == 'ammo') {
            header = "Склад боеприпасов";
            if (!this.isArmyFaction(player.character.factionId) &&
                !this.isMafiaFaction(player.character.factionId)) return notifs.error(player, `Нет доступа`, header);
        } else if (type == 'medicines') {
            header = "Склад медикаментов";
            if (!this.isHospitalFaction(player.character.factionId)) return notifs.error(player, `Нет доступа`, header);
        }
        if (!player.insideWarehouse) return notifs.error(player, `Вы далеко`, header);
        var haveBox = player.hasAttachment("ammoBox") || player.hasAttachment("medicinesBox") || player.hasAttachment("materialsBox");
        if (haveBox) return notifs.error(player, `[S] Нельзя нести больше`, header);
        if (inventory.getHandsItem(player)) return notifs.error(player, `Освободите руки`, header);
        player.addAttachment(type + "Box");
    },
    putBox(player) {
        var faction = player.insideFactionWarehouse;
        if (!faction) return notifs.error(player, `Вы далеко`, `Склад организации`);
        var header = `Склад ${faction.name}`;
        if (player.hasAttachment("ammoBox")) {
            this.setAmmo(faction, faction.ammo + this.ammoBox);
            player.addAttachment("ammoBox", true);
            notifs.info(player, `Боеприпасы: ${faction.ammo} из ${faction.maxAmmo} ед.`, header);
            if (faction.ammo == faction.maxAmmo) notifs.warning(player, `Склад заполнен`, header);
        } else if (player.hasAttachment("medicinesBox")) {
            this.setMedicines(faction, faction.medicines + this.medicinesBox);
            player.addAttachment("medicinesBox", true);
            notifs.info(player, `Медикаменты: ${faction.medicines} из ${faction.maxMedicines} ед.`, header);
            if (faction.medicines == faction.maxMedicines) notifs.warning(player, `Склад заполнен`, header);
        } else if (player.hasAttachment("materialsBox")) {
            this.setAmmo(faction, faction.ammo + this.materialsBox);
            player.addAttachment("materialsBox", true);
            notifs.info(player, `Боеприпасы: ${faction.ammo} из ${faction.maxAmmo} ед.`, header);
            mp.events.call('materialWar.box.putInFaction', player);
            if (faction.ammo == faction.maxAmmo) notifs.warning(player, `Склад заполнен`, header);
        } else {
            var type = "";
            if (faction.maxAmmo) type = "ammo";
            else if (faction.maxMedicines) type = "medicines";
            if (!type) return notifs.error(player, `Подходящий товар не найден`, header);

            if (faction[type] < this[type + "Box"]) return notifs.error(player, `Склад пустой`, header);
            if (!this.canTakeWarehouse(player, type, faction)) return notifs.error(player, `Нет доступа`, header);

            this.setProducts(faction, type, faction[type] - this[type + "Box"]);
            player.addAttachment(type + "Box");
        }
    },
    canSetStorageState(player) {
        var maxRank = this.getMaxRank(player.character.factionId);
        return player.character.factionRank == maxRank.id || player.character.factionRank == maxRank.id - 1;
    },
    canFillWarehouse(player, boxType, faction) {
        if (!this.whiteListWarehouse[boxType]) return false;
        if (!this.whiteListWarehouse[boxType][player.character.factionId]) return false;
        return this.whiteListWarehouse[boxType][player.character.factionId].includes(faction.id)
    },
    canTakeWarehouse(player, boxType, faction) {
        // банды тырят у армейцев
        if (this.isBandFaction(player.character.factionId) && this.isArmyFaction(faction)) return true;
        // игрок может брать в своей организации с определенного ранга
        return player.character.factionId == faction.id && player.character.factionRank >= this.getRank(faction, faction.ammoRank).id;
    },
    canInvite(player) {
        if (!player.character.factionId) return false;
        var faction = this.getFaction(player.character.factionId);
        var rank = this.getRankById(faction, player.character.factionRank);
        return rank.rank >= faction.inviteRank;
    },
    canUval(player) {
        if (!player.character.factionId) return false;
        var faction = this.getFaction(player.character.factionId);
        var rank = this.getRankById(faction, player.character.factionRank);
        return rank.rank >= faction.uvalRank;
    },
    canGiveRank(player) {
        if (!player.character.factionId) return false;
        var faction = this.getFaction(player.character.factionId);
        var rank = this.getRankById(faction, player.character.factionRank);
        return rank.rank >= faction.giveRankRank;
    },
    sayRadio(player, text, isNonRp = false) {
        var factionId = player.character.factionId;
        if (!factionId) return notifs.error(player, `Вы не состоите в организации`, `Рация`);
        // if (!this.isStateFaction(factionId)) return notifs.error(player, `Вы не в гос. структуре`, `Рация`);

        var rank = this.getRankById(factionId, player.character.factionRank);
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (rec.character.factionId != factionId) return;

            if (isNonRp) {
                rec.call('chat.message.push', [`!{#33cc66}[F] ${rank.name} ${player.name}[${player.id}]: (( ${text} ))`]);
            } else {
                rec.call('chat.action.walkietalkie', [player.name, player.id, rank.name, text]);
            }
        });
    },
    pay(player) {
        if (!player.character.factionId) return;

        var faction = this.getFaction(player.character.factionId);
        var pay = this.getRankById(faction, player.character.factionRank).pay;

        var minutes = parseInt((Date.now() - player.authTime) / 1000 / 60);
        if (minutes < this.payMins) return notifs.warning(player, `Зарплата не получена из-за низкой активности`, faction.name);

        if (this.isMafiaFaction(faction)) {
            if (faction.cash < pay) return notifs.error(player, `В общаке недостаточно средств для получения зарплаты`, faction.name);

            // TODO: не многовато запросов в БД получится?
            // faction.cash -= pay;
            // faction.save();
        } else if (this.isBandFaction(faction)) pay += parseInt(bands.bandZonesPrice * bands.getPowerBand(faction.id));

        if (!pay) return;
        money.addMoney(player, pay * this.bonusPay, (res) => {
            if (!res) return console.log(`[factions] Ошибка выдачи ЗП для ${player.name}`);
            notifs.info(player, `Получена зарплата`, faction.name);
        }, `Зарплата организации x${this.bonusPay} ${faction.name}`);
    },
    fullDeleteItems(owner, faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);
        inventory.fullDeleteItemsByParams(null, ["owner", "faction"], [owner, faction.id]);
    },
    setAmmo(faction, count) {
        faction.ammo = count;
        faction.save();
        this.updateWarehosueLabel(faction);
    },
    setMedicines(faction, count) {
        faction.medicines = count;
        faction.save();
        this.updateWarehosueLabel(faction);
    },
    setProducts(faction, type, count) {
        if (type == "ammo") this.setAmmo(faction, count);
        else if (type == "medicines") this.setMedicines(faction, count);
    },
    setMaxAmmo(faction, count) {
        faction.maxAmmo = count;
        faction.save();
        this.updateWarehosueLabel(faction);
    },
    setMaxMedicines(faction, count) {
        faction.maxMedicines = count;
        faction.save();
        this.updateWarehosueLabel(faction);
    },
    updateWarehosueLabel(faction) {
        var text = this.getWarehouseLabelText(faction);
        var label = this.getWarehouse(faction.id).label;
        label.text = text;
    },
    getWarehouseLabelText(faction) {
        var text = ``;
        if (faction.maxAmmo) text += `~y~Боеприпасы:\n~w~${faction.ammo} из ${faction.maxAmmo}`;
        if (faction.maxMedicines) text += `\n~b~Медикаменты:\n~w~${faction.medicines} из ${faction.maxMedicines}`;
        return text;
    },
    addCash(faction, count) {
        if (typeof faction == 'number') faction = this.getFaction(faction);

        faction.cash += count;
        faction.save();
    },
    removeCash(faction, count) {
        if (typeof faction == 'number') faction = this.getFaction(faction);

        faction.cash -= count;
        faction.save();
    },
    destroyHolderItems(player) {
        var count = 0;
        this.holders.forEach(holder => {
            var items = holder.inventory.items[player.character.id];
            if (!items) return;
            count += items.length;
            items.forEach(item => item.destroy());
            delete holder.inventory.items[player.character.id];
        });

        if (!count) return;
        notifs.warning(player, `Предмет из шкафа потеряны (${count} шт.)`, `Организация`);
    },
    respawnVehicles(faction) {
        if (typeof faction == 'number') faction = this.getFaction(faction);

        var start = new Date();
        mp.vehicles.forEach(veh => {
            if (!veh.db) return;
            if (!veh.lastPlayerTime) return;
            if (veh.db.key == 'private' || veh.db.key == 'market') return;
            if (start.getTime() - veh.lastPlayerTime < this.vehWaitSpawn) return;
            if (vehicles.getOccupants(veh).length) return;

            var spawnPos = new mp.Vector3(veh.db.x, veh.db.y, veh.db.z);
            var vehPos = veh.position;
            var dist = utils.vdist(spawnPos, vehPos);
            var isDead = vehicles.isDead(veh);
            if (dist > 10 || isDead) {
                vehicles.respawn(veh);
            }
        });
    },
    setVehicleMinRank(veh, rank) {
        if (!veh.db.minRank) veh.db.minRank = db.Models.FactionVehicleRank.build({
            vehicleId: veh.db.id,
            rank: rank
        });
        veh.db.minRank.rank = rank;
        veh.db.minRank.save();
    },
    moveCash(senderId, targetId, amount) {
        let sender = this.getFaction(senderId);
        let target = this.getFaction(targetId);
        if (!sender || !target) return;
        if (sender.cash < amount) return;
        sender.cash -= amount;
        target.cash += amount;
        sender.save();
        target.save();
    }
};
