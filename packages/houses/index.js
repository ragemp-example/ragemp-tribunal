"use strict";
/// Массив всех домов на сервере
let houses = [];
let interiors = [];
let garages = [];

let inventory;
let money;
let notifications;
let vehicles;
let carmarket;
let timer;
let utils;

/// Economic constants
let dropHouseMultiplier = 0.6;
let holderImprovmentMultiplier = 0.01;

/// Функции модуля системы домов
let changeBlip = function(house) {
    if (house.blip == null) return;
    if (house.info.characterId != null) {
        house.blip.color = 1;
    } else {
        house.blip.color = 2;
    }
    mp.players.forEach(player => {
        if (player && player.character) {
            if (player.character.id === house.info.characterId) {
                player.call("house.blip.color", [house.blip.id, 3]);
            } else {
                player.call("house.blip.color", [house.blip.id, house.blip.color]);
            }
        }
    });
};
let createBlip = function(house) {
    mp.players.forEach(player => {
        if (player && player.character) {
            if (player.character.id === house.info.characterId) {
                player.call("house.blip.create", [
                    [{
                        info: house.blip,
                        specialColor: 3
                    }]
                ]);
            } else {
                player.call("house.blip.create", [
                    [{
                        info: house.blip
                    }]
                ]);
            }
        }
    });
};
let loadBlips = function(player) {
    let blipsInfo = [];
    houses.forEach(house => {
        if (!house) return;
        if (player.character.id === house.info.characterId) {
            blipsInfo.push({
                info: house.blip,
                specialColor: 3
            });
        } else {
            blipsInfo.push({
                info: house.blip
            });
        }
    });
    player.call("house.blip.create", [blipsInfo]);
};
let dropHouse = function(house, sellToGov) {
    try {
        if (house.info.characterId == null) return changeBlip(house);
        let characterId = house.info.characterId;
        house.info.characterId = null;
        house.info.characterNick = null;
        house.info.date = null;
        house.info.isOpened = true;
        house.info.holder = 0;
        changeBlip(house);
        house.info.save().then(() => {
            if (money == null) return console.log("[HOUSES] House dropped " + house.info.id + ". But player didn't getmoney");
            /// Продажа всех авто в гараже
            //carmarket != null && carmarket.sellAllCharacterVehicles(characterId);

            /// Зачисление средств игроку
            money.addMoneyById(characterId, house.info.price * dropHouseMultiplier, function(result) {
                if (result) {
                    console.log("[HOUSES] House dropped " + house.info.id);
                    let player = mp.players.toArray().find(x => x != null && x.character != null && characterId === x.character.id);
                    if (player != null) {
                        mp.events.call('player.house.changed', player);
                        if (sellToGov) {
                            player.call('house.sell.toGov.ans', [1]);
                        } else {
                            notifications.warning(player, "Ваш дом отобрали за неуплату налогов", "Внимание");
                            player.call('phone.app.remove', ["house", house.info.id]);
                        }
                    } else {
                        notifications.save(characterId, "warning", "Ваш дом отобрали за неуплату налогов", "Внимание");
                    }
                } else {
                    console.log("[HOUSES] House dropped " + house.info.id + ". But player didn't getmoney");
                }
            }, sellToGov ? `Продажа дома #${house.info.id} государству` : `Слет дома #${house.info.id}`);
        });
    } catch (error) {
        console.log("[ERROR] " + error);
    }
};
let dropAllHouses = async () => {
    for (let i = 0; i < houses.length; i++) {
        houses[i].info.characterId = null;
        houses[i].info.characterNick = null;
        houses[i].info.date = null;
        houses[i].info.isOpened = true;
        houses[i].info.holder = 0;
        changeBlip(houses[i]);
        await houses[i].info.save();
    }
};

module.exports = {
    dropHouseMultiplier: dropHouseMultiplier,
    holderImprovmentMultiplier: holderImprovmentMultiplier,
    xmasTreesCreating: true,

    async init() {
        inventory = call('inventory');
        money = call('money');
        notifications = call('notifications');
        vehicles = call('vehicles');
        carmarket = call('carmarket');
        timer = call("timer");
        utils = call("utils");

        console.log("[HOUSES] load houses from DB");
        let infoHouses = await db.Models.House.findAll({
            include: [{
                model: db.Models.Interior,
                include: [{
                    model: db.Models.Garage,
                    include: [db.Models.GaragePlace]
                }]
            }]
        });
        for (let i = 0; i < infoHouses.length; i++) {
            let house = this.addHouse(infoHouses[i]);
            this.setTimer(house);
        }
        console.log("[HOUSES] " + infoHouses.length + " houses loaded");
        console.log("[HOUSES] load interiors from DB");
        interiors = await db.Models.Interior.findAll();
        console.log("[HOUSES] " + interiors.length + " interiors loaded");
        garages = await db.Models.Garage.findAll();
        console.log("[HOUSES] " + garages.length + " garages loaded");
    },
    getInteriors() {
        return interiors;
    },
    getGarages() {
        return garages;
    },
    getOwner(house) {
        let player = null;
        mp.players.forEach((current) => {
            if (current.character.id === house.info.characterId) {
                player = current;
            }
        });
        return player;
    },
    initHouseAdding(player) {
        let interiorsClasses = [];
        for (let i = 0; i < interiors.length; i++) {
            interiorsClasses.push({
                id: interiors[i].id,
                class: interiors[i].class
            });
        }

        let garagesIdCarPlaces = [];
        for (let i = 0; i < garages.length; i++) {
            garagesIdCarPlaces.push({
                id: garages[i].id,
                carPlaces: garages[i].carPlaces
            });
        }

        player.call('house.add.init', [interiorsClasses, garagesIdCarPlaces]);
    },
    async createHouse(houseInfo) {
        let house = await db.Models.House.create({
            interiorId: houseInfo.interiorId,
            price: houseInfo.price,
            isOpened: true,
            pickupX: houseInfo.pickupX,
            pickupY: houseInfo.pickupY,
            pickupZ: houseInfo.pickupZ,
            spawnX: houseInfo.spawnX,
            spawnY: houseInfo.spawnY,
            spawnZ: houseInfo.spawnZ,
            angle: houseInfo.angle,
            carX: houseInfo.carX,
            carY: houseInfo.carY,
            carZ: houseInfo.carZ,
            carAngle: houseInfo.carAngle,
        });
        house = await db.Models.House.findOne({
            where: {
                id: house.id
            },
            include: [{
                model: db.Models.Interior,
                include: [{
                    model: db.Models.Garage,
                    include: [db.Models.GaragePlace]
                }]
            }]
        });
        house = this.addHouse(house);
        this.setTimer(house);
        console.log("[HOUSES] added new house");
    },
    async removeHouse(id, player) {
        let house = this.getHouseById(id);
        if (house.info.characterId != null) {
            if (player != null) player.call('notifications.push.error', ["Нельзя удалить дом у которого есть владелец", "Ошибка"]);
            return;
        }
        if (house.timer != null) {
            timer.remove(house.timer);
            house.timer = null;
        }
        house.enter.destroy();
        house.enter.marker.destroy();
        house.exit.destroy();
        house.exit.marker.destroy();
        if (house.exitGarage != null) {
            house.exitGarage.destroy();
            house.exitGarage.marker.destroy();
        }
        house.blip.destroy();
        await house.info.destroy();

        let houseIndex = houses.findIndex(x => x.info.id === id);
        houseIndex !== -1 && houses.splice(houseIndex, 1);

        if (player != null) player.call('notifications.push.success', ["Вы удалили дом с id " + id, "Успешно"]);
    },
    async changePrice(id, price) {
        if (price <= 0) return false;
        let house = this.getHouseById(id);
        if (house == null) return false;
        if (house.info.characterId != null) return false;
        house.info.price = price;
        await house.info.save();
        return true;
    },
    async changeInterior(id, interiorId) {
        let house = this.getHouseById(id);
        if (house == null) return false;
        if (house.info.characterId != null) return false;

        house.enter.destroy();
        house.enter.marker.destroy();
        house.exit.destroy();
        house.exit.marker.destroy();
        if (house.exitGarage != null) {
            house.exitGarage.destroy();
            house.exitGarage.marker.destroy();
        }
        house.blip.destroy();
        let info = house.info;
        let houseIndex = houses.findIndex(x => x.info.id === id);
        houseIndex !== -1 && houses.splice(houseIndex, 1);

        info.interiorId = interiorId;
        await info.save();
        info = await db.Models.House.findOne({
            where: {
                id: info.id
            },
            include: [{
                model: db.Models.Interior,
                include: [{
                    model: db.Models.Garage,
                    include: [db.Models.GaragePlace]
                }]
            }]
        });

        house = this.addHouse(info);
        this.setTimer(house);
        /// Инициализация улучшений
        if (house.info.holder) {
            this.improvementLoad(house, "holder");
        }

        return true;
    },
    async createInterior(player, interiorInfo) {
        let interior = await db.Models.Interior.create({
            garageId: interiorInfo.garageId,
            class: interiorInfo.class,
            numRooms: interiorInfo.numRooms,
            rent: interiorInfo.rent,
            exitX: interiorInfo.exitX,
            exitY: interiorInfo.exitY,
            exitZ: interiorInfo.exitZ,
            x: interiorInfo.x,
            y: interiorInfo.y,
            z: interiorInfo.z,
            rotation: interiorInfo.rotation,
            hX: interiorInfo.hX,
            hY: interiorInfo.hY,
            hZ: interiorInfo.hZ
        });
        interiors.push(interior);
        this.initHouseAdding(player);
        console.log("[HOUSES] added new interior");
    },
    async createGarage(player, garageInfo) {
        let garage = await db.Models.Garage.create({
            carPlaces: garageInfo.carPlaces,
            x: garageInfo.x,
            y: garageInfo.y,
            z: garageInfo.z,
            rotation: garageInfo.rotation,
            exitX: garageInfo.exitX,
            exitY: garageInfo.exitY,
            exitZ: garageInfo.exitZ,
            GaragePlaces: garageInfo.GaragePlaces,
        }, {
            include: [db.Models.GaragePlace]
        });
        garages.push(garage);
        this.initHouseAdding(player);
        console.log("[HOUSES] added new garage");
    },
    addHouse(houseInfo) {
        let dimension = houseInfo.id;
        let houseBlipColor;
        if (houseInfo.characterId == null) {
            houseBlipColor = 2;
        } else {
            houseBlipColor = 1;
        }

        let enterMarker = mp.markers.new(2, new mp.Vector3(houseInfo.pickupX, houseInfo.pickupY, houseInfo.pickupZ), 0.75, {
            rotation: new mp.Vector3(0, 180, 0),
            dimension: 0
        });
        let exitMarker = mp.markers.new(2, new mp.Vector3(houseInfo.Interior.exitX, houseInfo.Interior.exitY, houseInfo.Interior.exitZ), 0.75, {
            rotation: new mp.Vector3(0, 180, 0),
            dimension: dimension
        });
        let exitGarageMarker = null;
        if (houseInfo.Interior.Garage != null) {
            exitGarageMarker = mp.markers.new(2, new mp.Vector3(houseInfo.Interior.Garage.exitX, houseInfo.Interior.Garage.exitY, houseInfo.Interior.Garage.exitZ), 0.75, {
                rotation: new mp.Vector3(0, 180, 0),
                dimension: dimension
            });
        }

        var holder = null;
        if (houseInfo.holder) {
            holder = this.createHolderMarker(houseInfo);
            inventory.initHouseInventory(holder);
        }

        let enterColshape = mp.colshapes.newTube(houseInfo.pickupX, houseInfo.pickupY, houseInfo.pickupZ, 2.0, 1.0, 0);
        let exitColshape = mp.colshapes.newSphere(houseInfo.Interior.exitX, houseInfo.Interior.exitY, houseInfo.Interior.exitZ, 1.0, dimension);
        let exitGarageColshape = null;
        if (houseInfo.Interior.Garage != null) {
            exitGarageColshape = mp.colshapes.newSphere(houseInfo.Interior.Garage.exitX, houseInfo.Interior.Garage.exitY, houseInfo.Interior.Garage.exitZ, 1.0, dimension);
        }
        let blip = {
            id: houseInfo.id,
            color: houseBlipColor,
            x: houseInfo.pickupX,
            y: houseInfo.pickupY,
            z: houseInfo.pickupZ,
            destroy() {
                mp.players.forEach(player => {
                    player.call("house.blip.destroy", [this.id]);
                });
            }
        };
        createBlip({
            blip: blip,
            info: houseInfo
        });
        // let blip = mp.blips.new(40, new mp.Vector3(houseInfo.pickupX, houseInfo.pickupY, houseInfo.pickupZ), {
        //     shortRange: true,
        //     dimension: 0,
        //     color: houseBlipColor
        // });

        enterColshape.marker = enterMarker;
        exitColshape.marker = exitMarker;
        if (exitGarageColshape != null) exitGarageColshape.marker = exitGarageMarker;
        enterColshape.hId = houseInfo.id;
        exitColshape.hId = houseInfo.id;
        if (exitGarageColshape != null) exitGarageColshape.hId = houseInfo.id;
        enterColshape.isHouse = true;
        exitColshape.isHouse = true;
        if (exitGarageColshape != null) exitGarageColshape.isHouse = true;
        enterColshape.place = 0;
        exitColshape.place = 1;
        if (exitGarageColshape != null) exitGarageColshape.place = 2;

        // if (this.xmasTreesCreating) {
        //     this.setXmasTree(houseInfo.Interior.id, houseInfo.id)
        // }
        houses.push({
            enter: enterColshape,
            exit: exitColshape,
            exitGarage: exitGarageColshape,
            blip: blip,
            info: houseInfo,
            holder: holder
        });
        return houses[houses.length - 1];
    },
    updateHouse(house) {
        changeBlip(house);
        this.setTimer(house);
    },
    getDropDate(daysNumber) {
        let date = new Date();
        date.setTime(Date.now() + (daysNumber * 1000 * 3600 * 24));
        return date;
    },
    setTimer(house) {
        if (house == null) return;
        if (house.info == null) return;
        if (house.info.characterId == null) return;
        if (house.info.date == null) return dropHouse(house);
        if (house.info.date.getTime() - new Date().getTime() <= 10000) return dropHouse(house);
        house.timer != null && timer.remove(house.timer);
        house.timer = timer.add(async function() {
            dropHouse(house);
        }, house.info.date.getTime() - new Date().getTime());
    },
    dropHouse: dropHouse,
    dropAllHouses: dropAllHouses,
    changeBlip: changeBlip,
    getHouseById(id) {
        return houses.find(x => {
            if (x == null) return false;
            return x.info.id === id;
        });
    },
    getHouseByCharId(id) {
        return houses.find(x => x.info.characterId === id);
    },
    getDateDays(date) {
        let dateNow = new Date();
        dateNow = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return Math.ceil(Math.abs(date.getTime() - dateNow.getTime()) / (1000 * 3600 * 24));
    },
    isHaveHouse(id) {
        return houses.findIndex(x => x.info.characterId === id) !== -1;
    },
    getHouseInfoForApp(house) {
        let info = house.info;
        return {
            name: info.id,
            class: info.Interior.class,
            numRooms: info.Interior.numRooms,
            garage: info.Interior.Garage != null,
            carPlaces: info.Interior.Garage != null ? info.Interior.Garage.carPlaces : 1,
            rent: this.getRent(house),
            isOpened: info.isOpened,
            improvements: [{
                name: 'Шкаф',
                type: 'holder',
                price: this.getImprovmentPrice('holder', house.info.price),
                isBuyed: info.holder
            }],
            price: info.price,
            days: this.getDateDays(info.date),
            pos: [info.pickupX, info.pickupY, info.pickupZ]
        };
    },
    getHouseInfoForBank(house) {
        if (house == null) return null;
        return {
            name: house.info.id,
            class: house.info.Interior.class,
            rent: this.getRent(house),
            days: this.getDateDays(house.info.date)
        };
    },
    getRent(house) {
        return parseInt(house.info.price * house.info.Interior.rent);
    },
    sellHouse(house, cost, seller, buyer, callback) {
        house.info.characterId = buyer.character.id;
        house.info.characterNick = buyer.character.name;
        house.info.save().then(() => {
            if (money == null) return;
            money.moveCash(buyer, seller, cost, (result) => {
                if (result) {
                    callback(true);
                    mp.events.call('player.house.changed', seller);
                    mp.events.call('player.house.changed', buyer);
                    this.updateHouse(house);
                    buyer.call('phone.app.add', ["house", {
                        name: house.info.id,
                        class: house.info.Interior.class,
                        numRooms: house.info.Interior.numRooms,
                        garage: house.info.Interior.Garage != null,
                        carPlaces: house.info.Interior.Garage != null ? house.info.Interior.Garage.carPlaces : 1,
                        rent: this.getRent(house),
                        isOpened: house.info.isOpened,
                        improvements: [],
                        price: house.info.price,
                        days: this.getDateDays(house.info.date),
                        pos: [house.info.pickupX, house.info.pickupY, house.info.pickupZ]
                    }]);
                    vehicles != null && vehicles.setPlayerCarPlaces(buyer);
                } else {
                    callback(false);
                }
            }, `Покупка дома #${house.info.id} у персонажа #${seller.character.id}`, `Продажа дома #${house.info.id} персонажу #${buyer.character.id}`);
        });
    },
    getImprovmentPrice(type, housePrice) {
        switch (type) {
            case "holder":
                return housePrice * holderImprovmentMultiplier;
            default:
                return null;
        }
    },
    buyImprovments(player, house, type, callback) {
        money.removeMoney(player, this.getImprovmentPrice(type, house.info.price), async (result) => {
            if (result) {
                house.info.holder = true;
                await house.info.save();
                this.improvementLoad(house, type);
            }
            callback(result);
        }, `Покупка улучшения "${type}" для дома #${house.info.id}`)
    },
    improvementLoad(house, type) {
        switch (type) {
            case "holder":
                let holder = null;
                if (house.info.holder) {
                    holder = this.createHolderMarker(house.info);
                    inventory.initHouseInventory(holder);
                }
                house.holder = holder;
                break;
        }
    },
    getHouseCarPlaces(id) {
        let house = this.getHouseByCharId(id).info;
        if (house == null) return null;

        let garagePlaces = [{
            x: house.carX,
            y: house.carY,
            z: house.carZ,
            h: house.carAngle,
            d: 0
        }];

        let garage = house.Interior.Garage;
        if (garage == null) return garagePlaces;

        house.Interior.Garage.GaragePlaces.forEach(place => {
            garagePlaces.push({
                x: place.x,
                y: place.y,
                z: place.z,
                h: place.angle,
                d: house.id
            });
        });
        return garagePlaces;
    },
    createHolderMarker(house) {
        let interior = house.Interior;
        let pos = new mp.Vector3(interior.hX, interior.hY, interior.hZ - 1);

        let holder = mp.markers.new(1, pos, 0.5, {
            color: [0, 187, 255, 70],
            dimension: house.id,
        });
        holder.inventory = {
            items: [], // предметы в шкафу
        };
        holder.houseInfo = house;

        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, holder.dimension);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (player.character.id !== house.characterId) return notifications.error(player, `Отказано в доступе`, `Шкаф`);

            player.call("prompt.showByName", [`house_items_holder`]);
            mp.events.call("house.holder.items.request", player, holder);
        };
        colshape.onExit = (player) => {
            player.call(`prompt.hide`);
            mp.events.call("house.holder.items.clear", player, holder);
        };
        holder.colshape = colshape;

        return holder;
    },
    setXmasTree(interiorId, dimension) {
        let pos = this.getTreePositionByInteriorId(interiorId);
        mp.objects.new(mp.joaat('prop_xmas_tree_int'), new mp.Vector3(pos[0], pos[1], pos[2]), {
            rotation: new mp.Vector3(0, 0, pos[3]),
            dimension: dimension
        });
    },
    getTreePositionByInteriorId(id) {
        switch(id) {
            case 1:
                return [152.3866424560547, -1000.8515014648438, -99.9, 178.06729125976562];
            case 2:
                return [264.3963928222656, -996.7416381835938, -99.9, 192.75595092773438];
            case 3:
                return [349.3298645019531, -1007.532470703125, -99.9, 92.3673095703125];
            case 4:
                return [-173.34803771972656, 491.5657958984375, 129.14367065429688, 12.562385559082031];
            case 5:
                return [-173.34803771972656, 491.5657958984375, 129.14367065429688, 12.562385559082031];
            case 7:
                return [119.1828842163086, 541.5076904296875, 182.9975067138672, 358.8365783691406];
            case 8:
                return [-926.083740234375, -371.86492919921875, 113.37455139160156, 303.1618957519531];
            case 9:
                return [-45.162803649902344, -585.3975830078125, 87.81224212646484, 267.11639404296875];
            case 10:
                return [-11.88645076751709, -1432.6400146484375, 30.21613655090332, 330.15673828125];
            case 11:
                return [-1910.1942138671875, -574.4353637695312, 18.197217559814453, 133.97935485839844];     
            default:
                return [152.3866424560547, -1000.8515014648438, -98.99999237060547, 178.06729125976562];
        }
    },
    getRobberyColshapeByInteriorId(id) {
        switch(id) {
            case 1:
                return new mp.Vector3(153.46836853027344, -1006.6397705078125, -98.99994659423828)
            case 2:
                return new mp.Vector3(265.5276184082031, -999.4505004882812, -99.00863647460938)
            case 3:
                return new mp.Vector3(350.8343505859375, -994.3084106445312, -99.147216796875)
            case 4:
                return new mp.Vector3(-164.57293701171875, 487.34808349609375, 137.443603515625)
            case 5:
                return new mp.Vector3(-164.57293701171875, 487.34808349609375, 137.443603515625)
            case 7:
                return new mp.Vector3(124.86784362792969, 548.12890625, 184.09690856933594)
            case 8:
                return new mp.Vector3(-913.2150268554688, -377.2799377441406, 113.47462463378906)
            case 9:
                return new mp.Vector3(-30.431917190551758, -576.282958984375, 88.71224212646484)
            case 10:
                return new mp.Vector3(-16.47047996520996, -1430.3072509765625, 31.101552963256836)
            case 11:
                return new mp.Vector3(-1909.82177734375, -571.5952758789062, 19.097219467163086)
            default:
                return new mp.Vector3(259.87664794921875, -1003.5370483398438, -99.00863647460938)
        }
    },
    loadBlips: loadBlips,
};
