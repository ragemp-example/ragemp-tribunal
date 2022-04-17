"use strict";
/// Модуль системы домов
let housesService = require("./index.js");
let money;
let timer;
let vehicles;
let notifications;
let utils;

let carPlaceVehicle = [];

module.exports = {
    /// Событие инициализации сервера
    "init": () => {
        money = call('money');
        timer = call("timer");
        vehicles = call("vehicles");
        notifications = call('notifications');
        utils = call('utils');
        housesService.init();
        inited(__dirname);
    },
    "player.joined": (player) => {
        player.house = {
            id: -1,
            place: 0
        };
    },
    "characterInit.done": async (player) => {
        housesService.loadBlips(player);
        let house = housesService.getHouseByCharId(player.character.id);
        if (house != null) {
            if (housesService.getDateDays(house.info.date) === 1) {
                notifications.info(player, "Ваш дом будет продан государству на следующий день за неуплату налогов", "Внимание");
            }
            if (housesService.getDateDays(house.info.date) === 0) {
                notifications.info(player, "Ваш дом будет продан государству сегодня за неуплату налогов", "Внимание");
            }
            if (house.info.characterNick != player.character.name) {
                house.info.characterNick = player.character.name;
                await house.info.save();
            }
        }
        if (player.character.admin < 5) return;
        housesService.initHouseAdding(player);

    },
    "player.name.changed": async (player) => {
        let house = housesService.getHouseByCharId(player.character.id);
        if(house != null) {
            house.info.characterNick = player.character.name;
            await house.info.save();
            player.call('house.menu.close',[true]);
        }
    },
    "playerEnterColshape": (player, shape) => {
        if (!shape.isHouse) return;
        player.house.place = shape.place;
        let house = housesService.getHouseById(shape.hId);
        let info = house.info;
        /// На улице
        if (shape.place === 0) {
            let houseInfo = {};

            if (info.characterId == null) {
                houseInfo = {
                    name: info.id,
                    class: info.Interior.class,
                    numRooms: info.Interior.numRooms,
                    garage: info.Interior.Garage != null,
                    carPlaces: info.Interior.Garage != null ? info.Interior.Garage.carPlaces : 1,
                    rent: housesService.getRent(house),
                    price: info.price,
                    pos: [info.pickupX, info.pickupY, info.pickupZ]
                };
            }
            else {
                houseInfo = {
                    name: info.id,
                    class: info.Interior.class,
                    numRooms: info.Interior.numRooms,
                    garage: info.Interior.Garage != null,
                    carPlaces: info.Interior.Garage != null ? info.Interior.Garage.carPlaces : 1,
                    rent: housesService.getRent(house),
                    owner: info.characterNick,
                    pos: [info.pickupX, info.pickupY, info.pickupZ]
                };
            }
            player.house.id = shape.hId;
            player.call('house.menu',[houseInfo]);
        }
        /// В доме / в гараже
        else {
            player.call('house.menu.enter',[shape.place, info.Interior.Garage != null]);
        }
    },
    "playerExitColshape": (player, shape) => {
        if (!shape.isHouse) return;
        if (shape.place === 0) {
            player.call('house.menu.close',[true]);
        }
        else {
            player.call('house.menu.enter.close',[true]);
        }
    },
    "house.enter": (player, place) => {
        if (player.house.id === -1 || player.house.id == null) return player.call('house.enter.ans', []);
        let info = housesService.getHouseById(player.house.id).info;
        if (info.characterId != null && info.characterId !== player.character.id && !info.isOpened) return player.call('house.enter.ans', []);

        let pos;
        let rot;

        if (place === 0) {
            player.dimension = 0;
            pos = new mp.Vector3(info.spawnX, info.spawnY, info.spawnZ);
            rot = info.angle;
        }
        else if (place === 1) {
            player.dimension = info.id;
            pos = new mp.Vector3(info.Interior.x, info.Interior.y, info.Interior.z);
            rot = info.Interior.rotation;

        }
        else if (place === 2) {
            if (info.Interior.Garage == null) return player.call('house.enter.ans', []);
            player.dimension = info.id;
            pos = new mp.Vector3(info.Interior.Garage.x, info.Interior.Garage.y, info.Interior.Garage.z);
            rot = info.Interior.Garage.rotation;
        }
        if (pos) {
            //utils.createAnticheatException(player);
            utils.setPlayerPosition(player, pos);
        }
        player.call('house.enter.ans', [player.house.place === 0, pos, rot]);
        player.house.place = place;
    },
    "house.buy": (player) => {
        if (money == null) return player.call('house.buy.ans', [0, ""]);
        if (player.house.id === -1 || player.house.id == null) return player.call('house.buy.ans', [0, ""]);
        let house = housesService.getHouseById(player.house.id);
        if (house == null) return player.call('house.buy.ans', [0, ""]);
        let info = house.info;
        if (info.characterId != null) return player.call('house.buy.ans', [0, ""]);
        if (player.dist(new mp.Vector3(info.pickupX, info.pickupY, info.pickupZ)) > 10) return player.call('house.buy.ans', [0, ""]);
        if (player.character.cash < info.price) return player.call('house.buy.ans', [0, ""]);
        if (housesService.isHaveHouse(player.character.id)) return player.call('house.buy.ans', [2, ""]);

        money.removeCash(player, info.price, async function(result) {
            if (!result) return player.call('house.buy.ans', [0, ""]);
            info.characterId = player.character.id;
            info.characterNick = player.character.name;
            info.date = housesService.getDropDate(1);
            await info.save();
            player.call('house.buy.ans', [1, player.character.name]);

            housesService.updateHouse(house);
            mp.events.call('player.house.changed', player);

            player.call('phone.app.add', ["house", housesService.getHouseInfoForApp(house)]);
            vehicles != null && vehicles.setPlayerCarPlaces(player);
            vehicles.destroyCharacterVehicles(player.character.id);
            vehicles.spawnStoredVehicles(player);
            notifications.info(player, "Оплатите имущество в банке в течение 24 часов, иначе оно будет продано", "Внимание");
        }, `Покупка дома #${info.id} у государства`);
    },
    /// Phone app events
    "house.lock": (player, id, isOpened) => {
        if (player == null) return;
        id = parseInt(id);
        if (isNaN(id)) return;
        let info = housesService.getHouseById(id).info;
        info.isOpened = isOpened;
        info.save();
    },
    "house.sell.toGov": (player, id) => {
        if (money == null) return player.call('house.sell.toGov.ans', [0]);
        if (player == null) return;
        // if (vehicles == null) return player.call('house.sell.toGov.ans', [0]);
        // if (vehicles.doesPlayerHaveHomeVehicles(player)) return player.call('house.sell.toGov.ans', [5]);
        id = parseInt(id);
        if (isNaN(id)) return player.call('house.sell.toGov.ans', [0]);
        let house = housesService.getHouseById(id);
        if (house == null) return player.call('house.sell.toGov.ans', [0]);
        let info = house.info;
        if (player.dist(new mp.Vector3(info.pickupX, info.pickupY, info.pickupZ)) > 10) return player.call('house.sell.toGov.ans', [3]);
        if (info.characterId !== player.character.id) return player.call('house.sell.toGov.ans', [0]);
        housesService.dropHouse(house, true);

        vehicles.destroyCharacterVehicles(player.character.id);
    },
    "house.sell.check": (player, idOrNick) => {
        let id = parseInt(idOrNick);
        if (isNaN(id)) {
            if (player.character.name === idOrNick) return player.call("house.sell.check.ans", [null]);

            let buyer = mp.players.toArray().find(x => x.character != null && x.character.name === idOrNick);
            if (buyer == null) return player.call("house.sell.check.ans", [null]);
            player.call("house.sell.check.ans", [buyer.character.name]);
            player.house.buyerId = buyer.id;
        }
        else {
            if (id > 1000000) return player.call("house.sell.check.ans", [null]);
            if (player.id === id) return player.call("house.sell.check.ans", [null]);
            if (!mp.players.exists(id)) return player.call("house.sell.check.ans", [null]);
            if (mp.players.at(id).character != null) {
                player.house.buyerId = id;
                player.call("house.sell.check.ans", [mp.players.at(id).character.name]);
            }
            else {
                player.call("house.sell.check.ans", [null]);
            }
        }
    },
    "house.sell": (player, name, cost) => {
        if (player.house.buyerId == null) return player.call("house.sell.ans", [0]);
        let buyer = mp.players.at(player.house.buyerId);
        if (buyer == null) return player.call("house.sell.ans", [0]);
        if (!mp.players.exists(buyer)) return player.call("house.sell.ans", [0]);
        // if (vehicles == null) return player.call('house.sell.ans', [0]);
        // if (vehicles.doesPlayerHaveHomeVehicles(player)) return player.call('house.sell.ans', [5]);
        name = parseInt(name);
        cost = parseInt(cost);
        if (isNaN(name) || isNaN(cost)) return player.call("house.sell.ans", [0]);
        if (buyer.character.cash < cost) return player.call("house.sell.ans", [6]);
        if (housesService.isHaveHouse(buyer.character.id)) return player.call("house.sell.ans", [7]);
        let house = housesService.getHouseById(name);
        if (house == null) return player.call("house.sell.ans", [0]);
        let info = house.info;
        if (player.dist(new mp.Vector3(info.pickupX, info.pickupY, info.pickupZ)) > 10 ||
            buyer.dist(new mp.Vector3(info.pickupX, info.pickupY, info.pickupZ)) > 10) return player.call("house.sell.ans", [3]);
        if (cost < info.price || cost > 1000000000) return player.call("house.sell.ans", [4]);
        buyer.house.sellerId = player.id;
        player.house.sellingHouseId = info.id;
        player.house.sellingHouseCost = cost;
        buyer.call('offerDialog.show', ["house_sell", {
            name: player.character.name,
            price: cost
        }]);
    },
    "house.sell.ans": (player, result) => {
        if (player.house.sellerId == null) return;
        let seller = mp.players.at(player.house.sellerId);
        if (seller == null) return;
        if (!mp.players.exists(seller)) return;
        if (seller.house == null) return;
        if (seller.house.buyerId == null) return;
        let house = housesService.getHouseById(seller.house.sellingHouseId);
        if (house == null) return seller.call("house.sell.ans", [0]);
        let info = house.info;
        if (info.characterId !== seller.character.id) return seller.call("house.sell.ans", [0]);
        if (player.dist(new mp.Vector3(info.pickupX, info.pickupY, info.pickupZ)) > 10 ||
            seller.dist(new mp.Vector3(info.pickupX, info.pickupY, info.pickupZ)) > 10) return seller.call("house.sell.ans", [3]);
        if (player.character.cash < info.price) return seller.call("house.sell.ans", [6]);
        if (housesService.isHaveHouse(player.character.id)) return seller.call("house.sell.ans", [7]);
        if (result === 2) return  seller.call("house.sell.ans", [2]);

        housesService.sellHouse(house, seller.house.sellingHouseCost, seller, player, (ans) => {
            if (ans) {
                seller.call("house.sell.ans", [1]);
                notifications.info(player, "Оплатите имущество в банке в течение 24 часов, иначе оно будет продано", "Внимание");
                vehicles.destroyCharacterVehicles(player.character.id);
            }
            else {
                seller.call("house.sell.ans", [0]);
            }
            seller.house.buyerId = null;
            seller.house.sellingHouseId = null;
            seller.house.sellingHouseCost = null;
            player.house.sellerId = null;
        });
    },
    "house.sell.stop": (player) => {
        if (player.house.buyerId != null) {
            if (!mp.players.exists(mp.players.at(player.house.buyerId))) return;
            mp.players.at(player.house.buyerId).call("offerDialog.hide");
            mp.players.at(player.house.buyerId).house.sellerId = null;
        }
        player.house.buyerId = null;
        player.house.sellingHouseId = null;
        player.house.sellingHouseCost = null;
    },
    "house.improvements.buy": (player, type) => {
        if (player.character == null) return player.call("house.improvements.buy.ans", [0]);
        let house = housesService.getHouseByCharId(player.character.id);
        if (house == null) return player.call("house.improvements.buy.ans", [0]);
        housesService.buyImprovments(player, house, type, function(result) {
            player.call("house.improvements.buy.ans", [result ? 1 : 2]);
        });
    },

    /// События для работы с экземплярами домов
    "house.add": (player, houseInfo) => {
        housesService.createHouse(JSON.parse(houseInfo));
    },
    "house.add.carSpawn": async (player, i, garage) => {
        if (vehicles == null) return;
        if (carPlaceVehicle[i] != null) {
            timer.remove(carPlaceVehicle[i].fuelTimer);
            carPlaceVehicle[i].destroy();
            carPlaceVehicle[i] = null;
        }

        let veh = {
            modelName: "turismor",
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
            spawnHeading: player.heading,
            color1: 54,
            color2: 54,
            license: 0,
            key: "admin",
            owner: 0,
            fuel: 40,
            mileage: 0,
            plate: vehicles.generateVehiclePlate(),
            //multiplier: 1
        };
        carPlaceVehicle[i] = await vehicles.spawnVehicle(veh);
        player.putIntoVehicle(carPlaceVehicle[i], 0);
        if (garage) player.call("house.add.carSpawn.ans", [i]);
    },
    "house.add.removeFromVehicle": (player) => {
        player.removeFromVehicle();
    },
    "house.add.carDrop": (player, i) => {
        if (carPlaceVehicle[i] == null) return;
        timer.remove(carPlaceVehicle[i].fuelTimer);
        carPlaceVehicle[i].destroy();
        carPlaceVehicle[i] = null;
    },
    "house.add.interior": (player, interiorInfo) => {
        housesService.createInterior(player, JSON.parse(interiorInfo));
    },
    "house.add.garage": (player, garageInfo) => {
        housesService.createGarage(player, JSON.parse(garageInfo));
    },
    "house.robbery.start": (id) => {
        let house = housesService.getHouseById(id);
        let info = house.info;
        info.isOpened = true;
        info.save();
        let player = housesService.getOwner(house);
        if (player != null) {
            player.call('house.lock', [id, true, true]);
        }
    },
};
