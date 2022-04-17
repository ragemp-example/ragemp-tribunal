"use strict";

let notifs = call('notifications');
let timer = call('timer');
let utils = call('utils');

module.exports = {
    // Макс. вес предметов, переносимый игроком
    maxPlayerWeight: 30,
    // Общая информация о предметах
    inventoryItems: [],
    // Объект, подготовленный для отправки на клиент игрока
    clientInventoryItems: {},
    // Маски, при надевании которых, нужно скрывать волосы
    masksWithHideHairs: [114, 159, 158, 157, 156, 155, 154, 153, 152, 151, 150,
        149, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 135, 134,
        132, 131, 130, 129, 126, 125, 123, 122, 119, 118, 117, 115, 113, 110, 106,
        104, 109, 112, 110
    ],
    // Вайт-лист предметов, которые можно надеть
    bodyList: {
        // columnIndex: [itemId, ...]
        0: [1],
        1: [6],
        2: [14],
        3: [2],
        4: [3],
        5: [7],
        6: [11],
        7: [10],
        8: [12],
        9: [21, 22, 48, 49, 50, 52, /*70, 76, 91, 93, 96, 99, 100, 107, 136*/],
        10: [13],
        11: [8],
        12: [9],
        13: null, // в слот рук можно класть любой предмет
    },
    // Блек-лист предметов, которые не могут храниться в других предметах
    blackList: {
        // parentItemId: [cildItemId, ...]
        3: [13, 17, 56, 22],
        7: [13, 17, 56, 22],
        8: [13, 56, 22],
    },
    // Вайт-лист предметов, которые могут перетаскиваться друг на друга
    mergeList: {},
    // Кол-во предметов на земле от одного игрока
    groundMaxItems: 30,
    // Время жизни предмета на земле (ms)
    groundItemTime: 2 * 60 * 1000,
    // Макс. дистанция до предмета, чтобы поднять его
    groundMaxDist: 2,
    // Климат, при котором игрок может бегать голым
    playerClime: {
        head: [10, 40],
        body: [20, 40],
        legs: [20, 40],
        feets: [25, 45],
    },
    // Коэффицент урона игроку от климата (чем выше, тем больше урон) (при холоде -ХП, при жаре -жажда)
    climeK: 0.5,
    // Коэффиценты важности частей тела
    climeOpacity: {
        head: 0.1,
        body: 0.5,
        legs: 0.2,
        feets: 0.2,
    },

    async init() {
        await this.loadInventoryItemsFromDB();
    },

    // Загрузка общей информации о предметах из БД в данный модуль
    async loadInventoryItemsFromDB() {
        var dbItems = await db.Models.InventoryItem.findAll();
        this.inventoryItems = dbItems;
        this.clientInventoryItems = this.convertServerInventoryItemsToClient(dbItems);
        console.log(`[INVENTORY] Предметы инвентаря загружены (${dbItems.length} шт.)`);
    },
    convertServerInventoryItemsToClient(dbItems) {
        var client = {};
        for (var i = 0; i < dbItems.length; i++) {
            var item = dbItems[i];
            client[item.id] = this.convertServerInventoryItemToClient(item);
        }
        return client;
    },
    convertServerInventoryItemToClient(item) {
        return {
            name: item.name,
            description: item.description,
            height: item.height,
            width: item.width,
            weight: item.weight,
            chance: item.chance,
            model: item.model,
            attachInfo: item.attachInfo,
        };
    },
    // Отправка общей информации о настройках инвентаря игроку
    initInventoryConfig(player) {
        player.call(`inventory.setItemsInfo`, [this.clientInventoryItems]);
        player.call("inventory.setMaxPlayerWeight", [this.maxPlayerWeight]);
        player.call("inventory.setMergeList", [this.mergeList]);
        player.call("inventory.setBlackList", [this.blackList]);
        player.call("inventory.registerWeaponAttachments", [this.bodyList[9], this.getWeaponModels()]);
        console.log(`[INVENTORY] Для аккаунта ${player.account.login} загружена общая информация о настройках инвентаря`);
    },
    // Отправка общей информации о предмете
    updateItemInfo(item) {
        this.clientInventoryItems[item.id] = this.convertServerInventoryItemToClient(item);
        mp.players.forEach((rec) => {
            if (rec.character) rec.call(`inventory.setItemInfo`, [item.id, this.clientInventoryItems[item.id]]);
        });
    },
    async initPlayerInventory(player) {
        this.clearAllView(player);

        player.inventory = {
            denyUpdateView: false, // запрещено ли обновлять внешний вид игрока
            items: [], // предметы игрока
            ground: [], // объекты на земле, которые выкинул игрок
            search: null, // обыск игрока
            place: { // багажник/шкаф/холодильник и пр. при взаимодействии
                type: "",
                sqlId: 0,
                items: [],
            },
        };

        var dbItems = await this.loadCharacterItemsFromDB(player.character.id);
        player.inventory.items = dbItems;

        this.updateAllView(player);
        // this.loadWeapons(player);
        player.call(`inventory.initItems`, [this.convertServerToClientItems(dbItems)]);
        console.log(`[INVENTORY] Для игрока ${player.character.name} загружены предметы (${dbItems.length} шт.)`);

        this.fixIfParentItemDoesntExist(player);
    },
    async initVehicleInventory(vehicle) {
        vehicle.inventory = {
            items: [], // предметы в багажнике
        };

        var dbItems = await db.Models.VehicleInventory.findAll({
            where: {
                vehicleId: vehicle.db.id
            },
            order: [
                ['parentId', 'ASC']
            ],
            include: [{
                    model: db.Models.VehicleInventoryParam,
                    as: "params"
                },
                {
                    model: db.Models.InventoryItem,
                    as: "item"
                }
            ]
        });
        vehicle.inventory.items = dbItems;

        // console.log(`[INVENTORY] Для авто ${vehicle.db.modelName} загружены предметы (${dbItems.length} шт.)`);
    },
    async initFactionInventory(player, holder) {
        var oldHolder = call("factions").holders.find(x => x.inventory.items[player.character.id]);
        if (oldHolder) {
            holder.inventory.items[player.character.id] = oldHolder.inventory.items[player.character.id];
            // delete oldHolder.inventory.items[player.character.id];
            return;
        }
        holder.inventory.items[player.character.id] = [];

        var dbItems = await db.Models.FactionInventory.findAll({
            where: {
                playerId: player.character.id
            },
            order: [
                ['parentId', 'ASC']
            ],
            include: [{
                    model: db.Models.FactionInventoryParam,
                    as: "params"
                },
                {
                    model: db.Models.InventoryItem,
                    as: "item"
                }
            ]
        });
        holder.inventory.items[player.character.id] = dbItems;
        console.log(`[INVENTORY] Для ${player.name} загружены предметы организации (${dbItems.length} шт.)`);
    },
    async initFactionCommonInventory(holder) {
        holder.inventory.items = []; // предметы

        let dbItems = await db.Models.FactionCommonInventory.findAll({
            where: {
                factionId: holder.inventory.faction.id
            },
            order: [
                ['parentId', 'ASC']
            ],
            include: [{
                model: db.Models.FactionCommonInventoryParam,
                as: "params"
            },
                {
                    model: db.Models.InventoryItem,
                    as: "item"
                }
            ]
        });
        holder.inventory.items = dbItems;
        console.log(`[INVENTORY] Для фракции #${holder.inventory.faction.id} загружены общие предметы (${dbItems.length} шт.)`);
        return holder;
    },
    async initHouseInventory(holder) {
        holder.inventory.items = []; // предметы

        var dbItems = await db.Models.HouseInventory.findAll({
            where: {
                houseId: holder.houseInfo.id
            },
            order: [
                ['parentId', 'ASC']
            ],
            include: [{
                    model: db.Models.HouseInventoryParam,
                    as: "params"
                },
                {
                    model: db.Models.InventoryItem,
                    as: "item"
                }
            ]
        });
        holder.inventory.items = dbItems;
        console.log(`[INVENTORY] Для дома #${holder.houseInfo.id} загружены предметы (${dbItems.length} шт.)`);
    },
    async loadCharacterItemsFromDB(characterId) {
        var items = await db.Models.CharacterInventory.findAll({
            where: {
                playerId: characterId
            },
            order: [
                ['parentId', 'ASC']
            ],
            include: [{
                    model: db.Models.CharacterInventoryParam,
                    as: "params"
                },
                {
                    model: db.Models.InventoryItem,
                    as: "item"
                }
            ]
        });
        return items;
    },
    convertServerToClientItems(dbItems) {
        // console.log("convertServerToClientItems");
        var clientItems = {};
        for (var i = 0; i < dbItems.length; i++) {
            var dbItem = dbItems[i];
            if (!dbItem.parentId) clientItems[dbItem.index] = this.convertServerToClientItem(dbItems, dbItem);
        }
        return clientItems;
    },
    convertServerToClientItem(items, dbItem) {
        // console.log(`convertServerToClientItem`);
        var params = {};
        if (dbItem.params) {
            for (var i = 0; i < dbItem.params.length; i++) {
                var param = dbItem.params[i];
                params[param.key] = param.value;
            }
        }
        var clientItem = {
            sqlId: dbItem.id,
            itemId: dbItem.itemId,
            params: params
        };
        if (params.pockets) {
            params.pockets = JSON.parse(params.pockets);
            clientItem.pockets = [];
            for (var j = 0; j < params.pockets.length; j += 2) {
                clientItem.pockets.push({
                    cols: params.pockets[j],
                    rows: params.pockets[j + 1],
                    items: {}
                });
            }
            delete params.pockets;
        }
        if (params.clime) params.clime = JSON.parse(params.clime);
        var children = this.getChildren(items, dbItem);
        if (children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                clientItem.pockets[child.pocketIndex].items[child.index] = this.convertServerToClientItem(items, child);
            }
        }
        return clientItem;
    },
    cantAdd(player, itemId, params) {
        var slot = this.findFreeSlot(player, itemId);
        if (!slot) return `Нет места для ${this.getInventoryItem(itemId).name}`;
        if (params.sex != null && params.sex != !player.character.gender) return `Предмет противоположного пола`;
        var nextWeight = this.getCommonWeight(player) + (this.getInventoryItem(itemId).weight * params.count || 1);
        //console.log("nextWeight");
        //console.log(nextWeight);
        if (nextWeight > this.maxPlayerWeight) return `Превышение по весу (${nextWeight.toFixed(2)} из ${this.maxPlayerWeight} кг)`;
        // if (params.weaponHash) {
        //     var weapon = this.getItemByItemId(player, itemId);
        //     if (weapon) return `Оружие ${this.getName(itemId)} уже имеется`;
        // }
        return null;
    },
    async addItem(player, itemId, params, callback = () => {}) {
        var cantAdd = this.cantAdd(player, itemId, params);
        if (cantAdd) return callback(cantAdd);
        var slot = this.findFreeSlot(player, itemId);
        var struct = [];
        for (var key in params) {
            struct.push({
                key: key,
                value: params[key]
            });
        }
        var item = db.Models.CharacterInventory.build({
            playerId: player.character.id,
            itemId: itemId,
            pocketIndex: slot.pocketIndex,
            index: slot.index,
            parentId: slot.parentId,
            params: struct,
        }, {
            include: [{
                model: db.Models.CharacterInventoryParam,
                as: "params",
            }]
        });

        player.inventory.items.push(item);
        if (!item.parentId) {
            if (item.index == 13) this.syncHandsItem(player, item);
            else this.updateView(player, item);
        }
        callback();
        await item.save();
        player.call("inventory.addItem", [this.convertServerToClientItem(player.inventory.items, item), item.pocketIndex, item.index, item.parentId]);
    },
    async addOldItem(player, item, callback = () => {}) {
        let slot = this.findFreeSlot(player, item.itemId);
        if (!slot) return callback(`Свободный слот для ${this.getInventoryItem(item.itemId).name} не найден`);
        let params = this.getParamsValues(item);
        if (params.sex != null && params.sex != !player.character.gender) return callback(`Предмет противоположного пола`);
        let nextWeight = this.getCommonWeight(player) + this.getItemWeight(player, item);
        if (nextWeight > this.maxPlayerWeight) return callback(`Превышение по весу (${nextWeight.toFixed(2)} из ${this.maxPlayerWeight} кг)`);
        // if (params.weaponHash) {
        //     let weapon = this.getItemByItemId(player, item.itemId);
        //     if (weapon) return callback(`Оружие ${this.getName(item.itemId)} уже имеется`);
        //     // if (slot.parentId != null) this.giveWeapon(player, params.weaponHash, params.ammo);
        // }

        item.playerId = player.character.id;
        item.pocketIndex = slot.pocketIndex;
        item.index = slot.index;
        item.parentId = slot.parentId;

        player.inventory.items.push(item);
        if (!item.parentId) {
            if (item.index == 13) this.syncHandsItem(player, item);
            else this.updateView(player, item);
        }
        item.restore();
        player.call("inventory.addItem", [this.convertServerToClientItem(player.inventory.items, item), item.pocketIndex, item.index, item.parentId]);
        callback();
    },
    // при перемещении предмета из игрока в окруж. среду
    async addEnvironmentItem(player, item, pocketIndex, index) {
        // console.log(`addEnvironmentItem`)

        if (!item.parentId) {
            if (item.index == 13) this.syncHandsItem(player, null);
            else this.clearView(player, item.itemId);
        }

        var place = player.inventory.place;
        var params = this.getParamsValues(item);
        var struct = [];
        for (var key in params) {
            if (key == 'pockets' || key == 'clime') params[key] = JSON.stringify(params[key]);
            struct.push({
                key: key,
                value: params[key]
            });
        }
        var conf = {
            itemId: item.itemId,
            pocketIndex: pocketIndex,
            index: index,
            parentId: null,
            params: struct,
        };
        var key;
        if (place.type == "Vehicle") key = "vehicleId";
        else if (place.type == "Faction") key = "playerId";
        else if (place.type == "FactionCommon") key = "factionId";
        else if (place.type == "House") key = "houseId";
        else return notifs.error(player, `Вы далеко от окружения`, `Инвентарь`);
        conf[key] = -place.sqlId;
        var table = `${place.type}Inventory`;
        var newItem = db.Models[table].build(conf, {
            include: [{
                model: db.Models[`${table}Param`],
                as: "params",
            }]
        });
        place.items.push(newItem);
        await newItem.save();
        player.call(`inventory.setEnvironmentItemSqlId`, [item.id, newItem.id]);
    },
    // при перемещении предмета из окруж. среды в игрока
    async addPlayerItem(player, item, parentId, pocketIndex, index) {
        // console.log(`addPlayerItem`)
        var nextWeight = this.getCommonWeight(player) + this.getItemWeight(player, item);
        // if (nextWeight > this.maxPlayerWeight) return debug(`Превышение по весу (${nextWeight.toFixed(2)} из ${this.maxPlayerWeight} кг)`);
        var place = player.inventory.place;
        var params = this.getParamsValues(item);
        if (params.weaponHash) {
            var weapon = this.getItemByItemId(player, item.itemId);
            // if (weapon) return notifs.error(player, `Оружие ${this.getName(item.itemId)} уже имеется`, `Инвентарь`);
            // if (parentId != null) this.giveWeapon(player, params.weaponHash, params.ammo);
        }
        var struct = [];
        for (var key in params) {
            if (key == 'pockets' || key == 'clime') params[key] = JSON.stringify(params[key]);
            struct.push({
                key: key,
                value: params[key]
            });
        }
        var conf = {
            playerId: player.character.id,
            itemId: item.itemId,
            pocketIndex: pocketIndex,
            index: index,
            parentId: parentId,
            params: struct,
        };
        var newItem = db.Models.CharacterInventory.build(conf, {
            include: [{
                model: db.Models.CharacterInventoryParam,
                as: "params",
            }]
        });

        player.inventory.items.push(newItem);
        if (!newItem.parentId) {
            if (newItem.index == 13) this.syncHandsItem(player, newItem);
            else this.updateView(player, newItem);
        }
        await newItem.save();
        player.call(`inventory.setItemSqlId`, [item.id, newItem.id]);
    },
    // переместить предмет от одного игрока к другому
    moveItemToPlayer(playerFrom, playerTo, item, callback = () => {}) {
        if (playerFrom.inventory.items.indexOf(item) == -1) return;

        let cantAdd = this.cantAdd(playerTo, item.itemId, this.getParamsValues(item));
        if (cantAdd) return callback(cantAdd);

        if (!item.parentId) this.clearView(playerFrom, item.itemId);
        if (!item.parentId && item.index == 13) this.syncHandsItem(playerFrom, null);
        playerFrom.call("inventory.deleteItem", [item.id]);
        this.clearArrayItems(playerFrom, item);

        var slot = this.findFreeSlot(playerTo, item.itemId);
        item.playerId = playerTo.character.id;
        item.pocketIndex = slot.pocketIndex;
        item.index = slot.index;
        item.parentId = slot.parentId;

        playerTo.inventory.items.push(item);
        if (!item.parentId) this.updateView(playerTo, item);
        item.save();
        playerTo.call("inventory.addItem", [this.convertServerToClientItem(playerTo.inventory.items, item), item.pocketIndex, item.index, item.parentId]);
        callback();
    },
    deleteItem(player, item) {
        if (typeof item == 'number') item = this.getItem(player, item);
        if (!item) return console.log(`[inventory.deleteItem] Предмет #${item} у ${player.name} не найден`);
        var params = this.getParamsValues(item);
        // if (params.weaponHash) this.removeWeapon(player, params.weaponHash);
        if (!item.parentId) {
            if (item.index == 13) this.syncHandsItem(player, null);
            else this.clearView(player, item.itemId);
        }
        item.destroy();
        player.call("inventory.deleteItem", [item.id]);

        this.clearArrayItems(player, item);
    },
    clearItems(player) {
        var items = player.inventory.items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item.parentId) {
                this.deleteItem(player, item);
                i--;
            }
        }
    },
    clearArrayItems(player, item) {
        var items = player.inventory.items;
        var children = this.getChildren(items, item);
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.destroy(); // из-за paranoid: true
            var params = this.getParamsValues(child);
            // if (params.weaponHash) this.removeWeapon(player, params.weaponHash);
            this.clearArrayItems(player, child);
        }
        var index = items.indexOf(item);
        if (index != -1) items.splice(index, 1);
    },
    getArrayItems(player, item, result = []) {
        var items = player.inventory.items;
        var children = this.getChildren(items, item);
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            result.push(child);
            result = this.getArrayItems(player, child, result);
        }
        return result;
    },
    getArrayWeapons(player) {
        return this.findArrayWeapons(player.inventory.items);
    },
    findArrayWeapons(items) {
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            // if (!item.parentId) continue;
            var params = this.getParamsValues(item);
            if (params.weaponHash) result.push(item);
        }
        return result;
    },
    getWeaponModels() {
        return this.bodyList[9].map(x => this.getInventoryItem(x).model);
    },
    getInventoryItem(itemId) {
        return this.inventoryItems[itemId - 1];
    },
    getName(itemId) {
        return this.inventoryItems[itemId - 1].name;
    },
    getItem(player, sqlId) {
        for (var i = 0; i < player.inventory.items.length; i++) {
            var item = player.inventory.items[i];
            if (item.id == sqlId) return item;
        }
        return null;
    },
    getChildren(items, item) {
        var children = [];
        if (!item.id) return children;
        for (var i = 0; i < items.length; i++) {
            var child = items[i];
            if (child.parentId == item.id) children.push(child);
        }
        return children;
    },
    getChildrenInPocket(items, item, pocketIndex) {
        var children = [];
        for (var i = 0; i < items.length; i++) {
            var child = items[i];
            if (child.parentId == item.id && child.pocketIndex == pocketIndex) children.push(child);
        }
        return children;
    },
    getView(items) {
        var list = {
            "clothes": [],
            "props": [],
        };
        var clothesIndexes = {
            "2": 7,
            "3": 9,
            "8": 4,
            "9": 6,
            "13": 5,
        };
        var propsIndexes = {
            "6": 0,
            "1": 1,
            "10": 2,
            "11": 6,
            "12": 7
        };
        items.forEach(item => {
            var params = this.getParamsValues(item);

            if (clothesIndexes[item.itemId] != null) {
                list.clothes.push([clothesIndexes[item.itemId], params.variation, params.texture]);
            } else if (propsIndexes[item.itemId] != null) {
                list.props.push([propsIndexes[item.itemId], params.variation, params.texture]);
            } else if (item.itemId == 7) {
                list.clothes.push([3, params.torso || 0, params.tTexture || 0]);
                list.clothes.push([11, params.variation, params.texture]);
                if (params.undershirt != null) list.clothes.push([8, params.undershirt, params.uTexture || 0]);
                if (params.decal != null) list.clothes.push([10, params.decal, params.dTexture || 0]);
            } else if (item.itemId == 14) {
                if (this.masksWithHideHairs.includes(params.variation)) list.clothes.push([2, 0, 0]);
                list.clothes.push([1, params.variation, params.texture]);
            }
        });
        return list;
    },
    updateView(player, item) {
        if (player.inventory.denyUpdateView) return;
        if (player.character.id != item.playerId) return;

        var params = this.getParamsValues(item);

        var clothesIndexes = {
            "2": 7,
            "8": 4,
            "9": 6,
            "13": 5
        };
        var propsIndexes = {
            "6": 0,
            "1": 1,
            "10": 2,
            "11": 6,
            "12": 7
        };
        var otherItems = {
            "3": () => {
                var oldVal = player.getClothes(9);
                if (oldVal.drawable != params.variation || oldVal.texture != params.texture) {
                    player.armour = parseInt(params.health);
                    player.setClothes(9, params.variation, params.texture, 0);
                }
            },
            "7": () => {
                var texture = params.tTexture || 0;
                player.setClothes(3, params.torso || 0, texture, 0);
                player.setClothes(11, params.variation, params.texture, 0);
                var texture = params.uTexture || 0;
                if (params.undershirt != null) player.setClothes(8, params.undershirt, texture, 0);
                var texture = params.dTexture || 0;
                if (params.decal != null) player.setClothes(10, params.decal, texture, 0);
            },
            "14": (params) => {
                if (this.masksWithHideHairs.includes(params.variation)) player.setClothes(2, 0, 0, 0);
                player.setClothes(1, params.variation, params.texture, 0);
            }
        };

        if (clothesIndexes[item.itemId] != null) {
            player.setClothes(clothesIndexes[item.itemId], params.variation, params.texture, 0);
        } else if (propsIndexes[item.itemId] != null) {
            player.setProp(propsIndexes[item.itemId], params.variation, params.texture);
        } else if (otherItems[item.itemId] != null) {
            otherItems[item.itemId](params);
        } else if (this.bodyList[9].includes(item.itemId)) {
            timer.add(() => player.addAttachment(`weapon_${item.itemId}`), 300);
            // this.removeWeapon(player, params.weaponHash);
        } else return debug(`Неподходящий тип предмета для тела, item.id: ${item.id}`);

    },
    clearView(player, itemId) {
        if (player.inventory && player.inventory.denyUpdateView) return;
        var clothesIndexes = {
            "2": 7,
            "13": 5
        };
        var propsIndexes = {
            "6": 0,
            "1": 1,
            "10": 2,
            "11": 6,
            "12": 7
        };
        var otherItems = {
            "3": () => {
                if (player.inventory) {
                    for (var i = 0; i < player.inventory.items.length; i++) {
                        var item = player.inventory.items[i];
                        if (!item.parentId && item.itemId == itemId && item.index == 4) {
                            this.updateParam(player, item, "health", parseInt(player.armour));
                        }
                    }
                }
                player.armour = 0;
                player.setClothes(9, 0, 0, 0);
            },
            "7": () => {
                // 0 - муж, 1 - жен
                var index = (player.character.gender == 0) ? 15 : 18;
                var undershirtDefault = (player.character.gender == 0) ? 15 : 3;
                player.setClothes(3, 15, 0, 0);
                player.setClothes(11, index, 0, 0);
                player.setClothes(8, undershirtDefault, 0, 0);
                player.setClothes(10, 0, 0, 0);
            },
            "8": () => {
                if (player.character.gender == 0) player.setClothes(4, 18, 8, 0);
                else player.setClothes(4, 17, 0, 0);
            },
            "9": () => {
                var index = (player.character.gender == 0) ? 34 : 35;
                player.setClothes(6, index, 0, 0);
            },
            "14": () => {
                player.setClothes(2, player.character.hair, 0, 0);
                player.setClothes(1, 0, 0, 0);
            }
        };

        if (clothesIndexes[itemId] != null) {
            player.setClothes(clothesIndexes[itemId], 0, 0, 0);
        } else if (propsIndexes[itemId] != null) {
            player.setProp(propsIndexes[itemId], -1, 0);
        } else if (otherItems[itemId] != null) {
            otherItems[itemId]();
        } else if (this.bodyList[9].includes(itemId)) {
            player.addAttachment(`weapon_${itemId}`, true);
        } else return console.log(`Неподходящий тип предмета для тела, itemId: ${itemId}`);
    },
    updateAllView(player) {
        for (var i = 0; i < player.inventory.items.length; i++) {
            var item = player.inventory.items[i];
            if (item.parentId) continue;
            if (item.index == 13) continue;
            this.updateView(player, item);
        }
        var handsItem = this.getHandsItem(player);
        this.syncHandsItem(player, handsItem);
    },
    clearAllView(player) {
        for (var index in this.bodyList) {
            var itemIds = this.bodyList[index];
            if (!itemIds) continue;
            itemIds.forEach((itemId) => {
                this.clearView(player, itemId);
            });
        }
    },
    getParam(item, key) {
        for (var i = 0; i < item.params.length; i++) {
            var param = item.params[i];
            if (param.key == key) return param;
        }
        return null;
    },
    getParamsValues(item) {
        var params = {};
        for (var i = 0; i < item.params.length; i++) {
            var param = item.params[i];
            params[param.key] = param.value;
            if (param.key == 'pockets' || param.key == 'clime') params[param.key] = JSON.parse(params[param.key]);
        }
        return params;
    },
    updateParam(player, item, key, value) {
        var param = this.getParam(item, key);
        if (!param) return;
        param.value = value;
        param.save();
        player.call(`inventory.setItemParam`, [item.id, key, value]);
    },
    findFreeSlot(player, itemId) {
        // debug(`findFreeSlot | itemId: ${itemId}`)
        var items = player.inventory.items;
        if (!this.getHandsItem(player)) return {
            pocketIndex: null,
            index: 13,
            parentId: null
        };
        for (var bodyIndex in this.bodyList) {
            var list = this.bodyList[bodyIndex];
            if (!list) continue;
            if (list.includes(itemId)) { // предмет, можно надеть
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (!item.parentId && item.index == bodyIndex) break; // другой предмет на тело уже надет
                }
                var isFind = !items.length || (i && i == items.length);
                if (isFind) return {
                    pocketIndex: null,
                    index: bodyIndex,
                    parentId: null
                };
            }
        }

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item.id) continue; // предмет еще не сохранен в БД
            var params = this.getParamsValues(item);
            if (item.parentId || !params.pockets) continue; // предмет в предмете или не имеет карманы
            if (item.itemId == itemId) continue; // тип предмета совпадает (рубашку в рубашку нельзя и т.д.)
            if (this.blackListExists(item.itemId, itemId)) continue; // предмет в черном списке (сумку в рубашку нельзя и т.д.)
            for (var j = 0; j < params.pockets.length / 2; j++) {
                var matrix = this.genMatrix(player, item, j);
                // console.log(`itemId: ${item.itemId}`);
                // console.log(`pocketIndex: ${j}`);
                // console.log(`matrix:`);
                // console.log(matrix);
                if (!matrix) continue;

                var freeIndex = this.findFreeIndexMatrix(matrix, itemId);
                // console.log(`freeIndex: ${freeIndex}`)
                if (freeIndex == -1) continue;

                return {
                    pocketIndex: j,
                    index: freeIndex,
                    parentId: item.id
                };
            }
        }
        return null;
    },
    blackListExists(parentId, childId) {
        if (!this.blackList[parentId]) return false;
        return this.blackList[parentId].includes(childId);
    },
    genMatrix(player, item, pocketIndex) {
        var params = this.getParamsValues(item);
        if (!params.pockets) return null;

        var matrix = [];
        var cols = params.pockets[pocketIndex * 2];
        var rows = params.pockets[pocketIndex * 2 + 1];
        // Создаем пустую матрицу
        for (var i = 0; i < rows; i++) {
            matrix[i] = [];
            for (var j = 0; j < cols; j++) {
                matrix[i][j] = 0;
            }
        }

        var children = this.getChildrenInPocket(player.inventory.items, item, pocketIndex);
        // console.log(`------------ children:`);
        // console.log(children);
        // Наполняем матрицу занятами ячейками
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var coord = this.indexToXY(rows, cols, child.index);
            if (!coord) continue;

            var info = this.getInventoryItem(child.itemId);
            for (var x = 0; x < info.width; x++) {
                for (var y = 0; y < info.height; y++) {
                    matrix[coord.y + y][coord.x + x] = 1;
                }
            }
        }

        return matrix;
    },
    indexToXY(rows, cols, index) {
        if (!rows || !cols) return null;
        var x = index % cols;
        var y = (index - x) / cols;
        if (x >= cols || y >= rows) return null;
        return {
            x: Math.clamp(x, 0, cols - 1),
            y: Math.clamp(y, 0, rows - 1),
        };
    },
    xyToIndex(rows, cols, coord) {
        if (!rows || !cols) return -1;
        return coord.y * cols + coord.x;
    },
    findFreeIndexMatrix(matrix, itemId) {
        var info = this.getInventoryItem(itemId);
        if (!info || !matrix) return -1;
        var w = info.width;
        var h = info.height;

        for (var i = 0; i < matrix.length - h + 1; i++) {
            for (var j = 0; j < matrix[i].length - w + 1; j++) {
                var doBreak = false;
                for (var y = 0; y < h; y++) {
                    for (var x = 0; x < w; x++) {
                        if (matrix[i + y][j + x] == 1) {
                            doBreak = true;
                            break;
                        }
                    }
                    if (doBreak) break;
                }
                if (!doBreak) return this.xyToIndex(matrix.length, matrix[0].length, {
                    x: j,
                    y: i
                });
            }
        }

        return -1;
    },
    getItemByItemId(player, itemIds) {
        if (!Array.isArray(itemIds)) itemIds = [itemIds];
        let items = player.inventory.items;
        return items.find(item => itemIds.includes(item.itemId));
    },
    getArrayByItemId(player, itemIds) {
        if (!Array.isArray(itemIds)) itemIds = [itemIds];
        var items = (!Array.isArray(player)) ? player.inventory.items : player;
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (itemIds.includes(item.itemId)) result.push(item);
        }
        return result;
    },
    getBodyItemByIndex(player, index) {
        return player.inventory.items.find(x => !x.parentId && x.index == index);
    },
    getHandsItem(player) {
        return this.getBodyItemByIndex(player, 13);
    },
    isInHands(item) {
        return !item.parentId && item.index == 13;
    },
    isWeaponItem(item) {
        return item && this.getParam(item, 'weaponHash');
    },
    getItemWeight(player, items, weight = 0) {
        if (!Array.isArray(items)) items = [items];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let info = this.getInventoryItem(item.itemId);
            weight += info.weight;
            let params = this.getParamsValues(item);
            if (params.weight) weight += params.weight;
            if (params.count) weight += (params.count - 1) * info.weight;
            if (params.litres) weight += params.litres;
            if (params.weaponHash && params.ammo) {
                let ammoId = this.getAmmoItemId(item.itemId);
                if (ammoId) weight += this.getInventoryItem(ammoId).weight * params.ammo;
            }
            let children = this.getChildren(player.inventory.items, item);
            if (children.length) {
                for (let j = 0; j < children.length; j++) {
                    let child = children[j];
                    weight += this.getItemWeight(player, child, 0);
                }
            }
        }

        return +weight.toFixed(3);
    },
    getCommonWeight(player) {
        let bodyItems = player.inventory.items.filter(x => !x.parentId);
        // console.log("bodyItems");
        // console.log(bodyItems);
        return this.getItemWeight(player, bodyItems);
    },
    // Полное удаление предметов инвентаря с сервера
    fullDeleteItemsByParams(itemIds, keys, values) {
        if (itemIds && !Array.isArray(itemIds)) itemIds = [itemIds];
        if (!Array.isArray(keys)) keys = [keys];
        if (!Array.isArray(values)) values = [values];

        // у всех игроков онлайн
        mp.players.forEach((rec) => {
            if (!rec.character) return;

            this.deleteByParams(rec, itemIds, keys, values);
        });
        // у всех багажников авто онлайн
        mp.vehicles.forEach((veh) => {
            if (!veh.inventory) return;

            var items = this.getItemsByParams(veh.inventory.items, itemIds, keys, values);
            items.forEach(item => {
                item.destroy();
                var i = veh.inventory.items.indexOf(item);
                if (i != -1) veh.inventory.items.splice(i, 1);
                if (veh.bootPlayerId != null) {
                    var rec = mp.players.at(veh.bootPlayerId);
                    if (!rec || !rec.character) return;
                    rec.call(`inventory.deleteEnvironmentItem`, [item.id]);
                }
            });
        });
        // у всех шкафов организаций
        call('factions').holders.forEach(holder => {
            for (var characterId in holder.inventory.items) {
                var list = holder.inventory.items[characterId];
                if (!list.length) return;
                var items = this.getItemsByParams(list, itemIds, keys, values);
                if (!items.length) return;
                items.forEach(item => {
                    item.destroy();
                    var i = list.indexOf(item);
                    if (i != -1) list.splice(i, 1);
                });
                mp.players.forEachInRange(holder.position, 5, (rec) => {
                    mp.events.call("faction.holder.items.clear", rec);
                });
            }
        });
        // предметы на земле
        mp.objects.forEach((obj) => {
            if (!obj.getVariable("groundItem")) return;
            var item = obj.item;
            for (var j = 0; j < obj.children.length; j++) {
                var child = obj.children[j];
                if (itemIds && !itemIds.includes(child.itemId)) continue;
                var doDelete = true;
                var params = this.getParamsValues(child);
                for (var i = 0; i < keys.length; i++) {
                    var param = params[keys[i]];
                    if (!param) {
                        doDelete = false;
                        break;
                    }
                    if (param && param != values[i]) {
                        doDelete = false;
                        break;
                    }
                }
                if (doDelete) {
                    obj.children.splice(j, 1);
                    j--;
                }
            }
            if (itemIds && !itemIds.includes(item.itemId)) return;
            var doDelete = true;
            var params = this.getParamsValues(item);
            for (var i = 0; i < keys.length; i++) {
                var param = params[keys[i]];
                if (!param) {
                    doDelete = false;
                    break;
                }
                if (param && param != values[i]) {
                    doDelete = false;
                    break;
                }
            }
            if (doDelete) {
                timer.remove(obj.destroyTimer);
                obj.destroy();
                var rec = mp.players.at(obj.playerId);
                if (!rec || !rec.character) return;
                var i = rec.inventory.ground.indexOf(obj);
                if (i != -1) rec.inventory.ground.splice(i, 1);
            }
        });
    },
    deleteByParams(player, itemIds, keys, values) {
        // debug(`deleteByParams: ${player.name}`)
        if (itemIds && !Array.isArray(itemIds)) itemIds = [itemIds];
        if (!Array.isArray(keys)) keys = [keys];
        if (!Array.isArray(values)) values = [values];

        if (keys.length != values.length) return;

        if (typeof player == 'number') { // удаление у игрока оффлайн
            // db.Models.CharacterInventory.destroy({
            //     where: {
            //         playerId: player
            //     },
            //     include: [{
            //         model: db.Models.CharacterInventoryParam,
            //         where: {
            //             key: keys,
            //             value: values
            //         }
            //     }]
            // });
            debug(`Было вызвано удаление предметов у персонажа оффлайн с ID: ${player}`);

            db.Models.CharacterInventory.findAll({
                where: {
                    playerId: player
                },
                include: [{
                    as: "params",
                    model: db.Models.CharacterInventoryParam
                }]
            }).then(allItems => {
                debug(`Все предметы персонажа:`)
                debug(allItems.map(x => x.id))

                var items = this.getItemsByParams(allItems, itemIds, keys, values);

                debug(`Предметы по типу: ${itemIds}, ключу: ${keys}, значению: ${values}`)
                debug(items.map(x => x.id))

                items.forEach(item => {
                    var children = this.getChildren(allItems, item);
                    if (children.length) {
                        debug(`В предмете ${item.id} хранятся:`)
                        debug(children.map(x => x.id))
                    }

                    children.forEach(child => {
                        var children2 = this.getChildren(allItems, child);
                        if (children2.length) {
                            debug(`В предмете ${child.id} хранятся:`)
                            debug(children2.map(x => x.id))
                        }

                        children2.forEach(child2 => {
                            child2.destroy();
                        });
                        child.destroy();
                    });
                    item.destroy();
                });

            });

            return;
        }

        var items = (itemIds) ? this.getArrayByItemId(player, itemIds) : player.inventory.items;
        if (!items.length) return;

        var list = [];
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var params = this.getParamsValues(item);
            var doDelete = true;
            for (var i = 0; i < keys.length; i++) {
                var param = params[keys[i]];
                if (!param) {
                    doDelete = false;
                    break;
                }
                if (param != values[i]) {
                    doDelete = false;
                    break;
                }
            }
            if (doDelete) list.push(item);
        }
        list.forEach(item => {
            this.deleteItem(player, item);
        });
    },
    getItemsByParams(items, itemIds, keys, values) {
        // console.log(`deleteByParams: ${player.name}`)
        if (itemIds && !Array.isArray(itemIds)) itemIds = [itemIds];
        if (!Array.isArray(keys)) keys = [keys];
        if (!Array.isArray(values)) values = [values];

        var list = [];
        if (keys.length != values.length) return list;

        var items = (itemIds) ? this.getArrayByItemId(items, itemIds) : items;
        if (!items.length) return list;

        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var params = this.getParamsValues(item);
            var isFind = true;
            for (var i = 0; i < keys.length; i++) {
                var param = params[keys[i]];
                if (!param) {
                    isFind = false;
                    break;
                }
                if (param && param != values[i] && values[i] != null) {
                    isFind = false;
                    break;
                }
            }
            if (isFind) list.push(item);
        }
        return list;
    },
    getPocketsByType(type, trunkType) {
        switch (type) {
            case "Vehicle":
                if (trunkType == 1) {
                    return [{
                        cols: 12,
                        rows: 20,
                        items: {}
                    },];
                } else if (trunkType == 2) {
                    return [{
                        cols: 12,
                        rows: 30,
                        items: {}
                    },];
                } else {
                    return [{
                        cols: 12,
                        rows: 10,
                        items: {}
                    },];
                }
            case "Faction":
                return [{
                        cols: 12,
                        rows: 20,
                        items: {}
                    },
                    {
                        cols: 8,
                        rows: 9,
                        items: {}
                    },
                    {
                        cols: 8,
                        rows: 9,
                        items: {}
                    },
                ];
            case "FactionCommon":
                return [{
                    cols: 12,
                    rows: 20,
                    items: {}
                },
                    {
                        cols: 8,
                        rows: 9,
                        items: {}
                    },
                    {
                        cols: 8,
                        rows: 9,
                        items: {}
                    },
                ];
            case "House":
                return [{
                        cols: 12,
                        rows: 25,
                        items: {}
                    },
                    {
                        cols: 12,
                        rows: 9,
                        items: {}
                    },
                ];
        }

        return [];
    },
    getEnvironmentClientPockets(dbItems, type, trunkType) {
        var pockets = this.getPocketsByType(type, trunkType);
        for (var i = 0; i < dbItems.length; i++) {
            var dbItem = dbItems[i];
            if (dbItem.parentId) continue;
            var clientItem = this.convertServerToClientItem(dbItems, dbItem);
            pockets[dbItem.pocketIndex].items[dbItem.index] = clientItem
        }
        return pockets;
    },
    // Загрузка оружия у игрока на основе предметов-оружия в инвентаре
    loadWeapons(player) {
        // теперь у игрока есть только оружие из слота для рук
        // var weapons = this.getArrayWeapons(player);
        // weapons.forEach(weapon => {
        //     var params = this.getParamsValues(weapon);
        //     this.giveWeapon(player, params.weaponHash, params.ammo);
        // });
    },
    giveWeapon(player, hash, ammo) {
        if (!hash) return;
        player.setWeaponAmmo(hash, 0);
        player.giveWeapon(hash, 0);
        player.setWeaponAmmo(hash, parseInt(ammo));
        player.call(`weapons.giveWeapon`, [hash.toString()]);
    },
    removeWeapon(player, hash) {
        // удалять, если в слотах рук
        var item = this.getHandsItem(player);
        if (!item) return;
        var param = this.getParam(item, 'weaponHash');
        if (!param || param.value != hash) return;
        if (player.weapon == hash) this.updateParam(player, item, 'ammo', player.weaponAmmo);
        player.removeWeapon(hash);
        player.call(`weapons.removeWeapon`, [hash.toString()]);
    },
    canMerge(itemId, targetId) {
        return this.mergeList[itemId] && this.mergeList[itemId].includes(targetId);
    },
    putGround(player, item, pos, dimension = null) {
        if (dimension == null) dimension = player.dimension;
        var children = this.getArrayItems(player, item);
        this.deleteItem(player, item);

        var info = this.getInventoryItem(item.itemId);
        pos.z += info.deltaZ;

        var newObj = mp.objects.new(mp.joaat(info.model), pos, {
            rotation: new mp.Vector3(info.rX, info.rY, player.heading),
            dimension: dimension
        });
        newObj.playerId = player.id;
        newObj.item = item;
        newObj.children = children;
        newObj.setVariable("groundItem", true);
        player.inventory.ground.push(newObj);


        var objId = newObj.id;
        var sqlId = item.id;
        newObj.destroyTimer = timer.add(() => {
            try {
                var obj = mp.objects.at(objId);
                if (!obj || !obj.item || obj.item.id != sqlId) return;
                obj.destroy();
                var rec = mp.players.at(obj.playerId);
                if (!rec || !rec.character) return;
                var i = rec.inventory.ground.indexOf(obj);
                if (i != -1) rec.inventory.ground.splice(i, 1);
            } catch (e) {
                console.log(e);
            }
        }, this.groundItemTime);

        var ground = player.inventory.ground;
        if (ground.length > this.groundMaxItems) {
            var obj = ground.shift();
            timer.remove(obj.destroyTimer);
            obj.destroy();
        }
    },
    async addGroundItem(itemId, params, pos) {
        var info = this.getInventoryItem(itemId);
        var struct = [];
        for (var key in params) {
            struct.push({
                key: key,
                value: params[key]
            });
        }
        var newObj = mp.objects.new(mp.joaat(info.model), pos, {
            rotation: new mp.Vector3(pos.rX || info.rX, pos.rY || info.rY, pos.rZ || 0),
        });
        var item = await db.Models.CharacterInventory.create({
            playerId: null,
            itemId: itemId,
            pocketIndex: null,
            index: 0,
            parentId: null,
            params: struct,
        }, {
            include: [{
                model: db.Models.CharacterInventoryParam,
                as: "params",
            }]
        });
        newObj.item = item;
        newObj.children = [];
        newObj.setVariable("groundItem", true);

        var objId = newObj.id;
        var sqlId = item.id;
        newObj.destroyTimer = timer.add(() => {
            try {
                var obj = mp.objects.at(objId);
                if (!obj || !obj.item || obj.item.id != sqlId) return;
                obj.destroy();
            } catch (e) {
                console.log(e);
            }
        }, this.groundItemTime);
    },
    // урон климата (если игрок одет не по погоде)
    checkClimeDamage(player, temp, out) {
        if (player.vehicle || player.dimension || player.godmode || player.farmJob) return;

        var clime = Object.assign({}, this.playerClime);

        var hat = player.inventory.items.find(x => x.itemId == 6 && !x.parentId);
        var top = player.inventory.items.find(x => x.itemId == 7 && !x.parentId);
        var pants = player.inventory.items.find(x => x.itemId == 8 && !x.parentId);
        var shoes = player.inventory.items.find(x => x.itemId == 9 && !x.parentId);

        if (hat) clime.head = this.getParamsValues(hat).clime || this.playerClime.head;
        if (top) clime.body = this.getParamsValues(top).clime || this.playerClime.body;
        if (pants) clime.legs = this.getParamsValues(pants).clime || this.playerClime.legs;
        if (shoes) clime.feets = this.getParamsValues(shoes).clime || this.playerClime.feets;

        var damage = 0,
            thirst = 0;

        if (temp < clime.head[0]) {
            damage += this.climeOpacity.head * (clime.head[0] - temp) * this.climeK;
            // out(`У вас мерзнет голова`);
        } else if (temp > clime.head[1]) {
            thirst += this.climeOpacity.head * (temp - clime.head[1]) * this.climeK;
            // out(`У вас вспотела голова`);
        }

        if (temp < clime.body[0]) {
            damage += this.climeOpacity.body * (clime.body[0] - temp) * this.climeK;
            // out(`У вас мерзнет тело`);
        } else if (temp > clime.body[1]) {
            thirst += this.climeOpacity.body * (temp - clime.body[1]) * this.climeK;
            // out(`У вас вспотело тело`);
        }

        if (temp < clime.legs[0]) {
            damage += this.climeOpacity.legs * (clime.legs[0] - temp) * this.climeK;
            // out(`У вас мерзнут ноги`);
        } else if (temp > clime.legs[1]) {
            thirst += this.climeOpacity.legs * (temp - clime.legs[1]) * this.climeK;
            // out(`У вас вспотели ноги`);
        }

        if (temp < clime.feets[0]) {
            damage += this.climeOpacity.feets * (clime.feets[0] - temp) * this.climeK;
            // out(`У вас мерзнут ступни`);
        } else if (temp > clime.feets[1]) {
            thirst += this.climeOpacity.feets * (temp - clime.feets[1]) * this.climeK;
            // out(`У вас вспотели ступни`);
        }

        player.health -= damage;
        if (thirst) call("satiety").set(player, player.character.satiety, player.character.thirst - thirst);

        var data = {};
        if (damage) data.cold = true;
        if (thirst) data.heat = true;
        if (Object.keys(data).length) player.call(`hud.setData`, [data]);
    },
    // получить ID предмета патронов по ID предмета оружия
    getAmmoItemId(itemId) {
        for (var ammoId in this.mergeList) {
            var list = this.mergeList[ammoId];
            if (list.includes(itemId)) return parseInt(ammoId);
        }
        return null;
    },
    // вкл выкл синхру предмета в руках
    syncHandsItem(player, item) {
        // debug(`[inventory] sync hands at ${player.name}, item.id: ${item ? item.id : null}`);

        if (item) { // вкл. синх. предмета/гана в руках
            var params = this.getParamsValues(item);
            if (params.weaponHash) {
                var ammo = params.ammo;
                // if (player.weapon == params.weaponHash && ammo != player.weaponAmmo) {
                //     this.updateParam(player, item, 'ammo', player.weaponAmmo);
                //     ammo = player.weaponAmmo;
                // }
                this.giveWeapon(player, params.weaponHash, ammo);
            } else player.setVariable("hands", item.itemId);
        } else { // выкл. синх. предмета/гана в руках
            var handsItem = this.getHandsItem(player);
            if (!handsItem) return;

            var params = this.getParamsValues(handsItem);
            if (params.weaponHash) this.removeWeapon(player, params.weaponHash);
            else player.setVariable("hands", null);
        }
    },
    notifyOverhead(player, text) {
        mp.players.forEachInRange(player.position, 20, rec => {
            if (rec.id == player.id) return;
            rec.call(`addOverheadText`, [player.id, text, [221, 144, 255, 255]]);
        });
    },
    // получить предметы для обыска
    getItemsForSearch(player) {
        var searchItems = [];
        player.inventory.items.forEach(item => {
            if (!item.parentId) searchItems.push(item);
            else {
                var randChance = utils.randomInteger(1, 100);
                var itemChance = this.getItemChance(item);
                if (randChance < itemChance) searchItems.push(item);
            }
        });
        return searchItems;
    },
    getItemChance(item) {
        return this.getInventoryItem(item.itemId).chance;
    },
    // фикс ситуации, когда у игрока остаются предметы, которые хранятся в родителе, но родителя больше нет у игрока
    fixIfParentItemDoesntExist(player) {
        var items = player.inventory.items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item.parentId) continue;
            if (items.findIndex(x => x.id == item.parentId) != -1) continue;
            this.deleteItem(player, item);
            i--;
            call("terminal").error(`FIX: У игрока ${player.name} удален предмет #${item.id} (родитель не найден)`);
        }
    },
};
