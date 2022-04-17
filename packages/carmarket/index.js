"use strict";
let vehicles = call("vehicles");
let money = call("money");
let inventory = call("inventory");
let timer = call("timer");
let notify = call("notifications");

var marketSpots = [];
var carMarketData;
var marketCapacity;
var dbMarket;
var shape;
var carMarket = {
    x: -2187.197509765625,
    y: -409.32806396484375,
    z: 13.121573448181152
}

const PRICE_CONFIG = {
    BUY: 0.8,
    SELL: 0.7
}

module.exports = {
    async init() {
        await this.createCarMarket();

    },
    createCarMarket() {
        mp.blips.new(225, new mp.Vector3(carMarket.x, carMarket.y, carMarket.z), {
            name: "Авторынок",
            shortRange: true,
            color: 74
        });
        mp.markers.new(1, new mp.Vector3(carMarket.x, carMarket.y, carMarket.z - 3.4), 3.2, {
            direction: new mp.Vector3(carMarket.x, carMarket.y, carMarket.z),
            rotation: 0,
            color: [92, 141, 255, 200],
            visible: true,
            dimension: 0
        });
        shape = mp.colshapes.newSphere(carMarket.x, carMarket.y, carMarket.z, 3.5);
        shape.pos = new mp.Vector3(carMarket.x, carMarket.y, carMarket.z);
        shape.isCarMarket = true;

        let label = mp.labels.new(`Продажа транспорта`, new mp.Vector3(carMarket.x, carMarket.y, carMarket.z + 0.5), {
            los: false,
            font: 0,
            drawDistance: 10,
        });
        label.isCarMarket = true;
    },
    async loadCarMarketData() { /// Загрузка точек спавна авто из БД
        carMarketData = await db.Models.CarMarketData.findAll();
        for (var i = 0; i < carMarketData.length; i++) {
            marketSpots.push({
                sqlId: carMarketData[i].id,
                x: carMarketData[i].x,
                y: carMarketData[i].y,
                z: carMarketData[i].z,
                h: carMarketData[i].h
            });
        }
        for (var i = 0; i < marketSpots.length; i++) {
            marketSpots[i].isFree = true;
        }
        marketCapacity = i;

        console.log(`[CARMARKET] Загружено мест для авторынка: ${i}`);
    },
    async loadCarMarketVehicles() { /// Загрузка точек спавна авто из БД

        dbMarket = await db.Models.Vehicle.findAll({
            where: {
                key: "market"
            }
        });

        for (var i = 0; i < dbMarket.length; i++) {
            if (i >= marketCapacity) return;
            this.addMarketVehicle(dbMarket[i]);
        }
    },
    addMarketVehicle(veh) {
        for (var i = 0; i < marketSpots.length; i++) {
            if (marketSpots[i].isFree) {
                marketSpots[i].vehicle = veh;
                veh.x = marketSpots[i].x;
                veh.y = marketSpots[i].y;
                veh.z = marketSpots[i].z;
                veh.h = marketSpots[i].h;
                veh.marketSpot = i;

                if (!veh.sqlId) {
                    vehicles.spawnVehicle(veh, 0);
                } else {
                    vehicles.spawnVehicle(veh, 1);
                }
                marketSpots[i].isFree = false;
                return;
            }
        }
        let spotIndex = this.getRandomCarSpot();
        if (marketSpots[spotIndex].vehicle.db) {
            marketSpots[spotIndex].vehicle.db.destroy();
            this.destroyMarketVehicleById(marketSpots[spotIndex].vehicle.sqlId);
        } else {
            marketSpots[spotIndex].vehicle.destroy();
            this.destroyMarketVehicleById(marketSpots[spotIndex].vehicle.id);
        }

        marketSpots[spotIndex].vehicle = veh;
        veh.x = marketSpots[spotIndex].x;
        veh.y = marketSpots[spotIndex].y;
        veh.z = marketSpots[spotIndex].z;
        veh.h = marketSpots[spotIndex].h;
        veh.marketSpot = spotIndex;

        if (!veh.sqlId) {
            vehicles.spawnVehicle(veh, 0);
        } else {
            vehicles.spawnVehicle(veh, 1);
        }
        return;
    },
    isPlayerInCarMarketColshape(player) {
        if (shape.isPointWithin(player.position)) {
            return true;
        } else {
            return false;
        }
    },
    sellCar(vehicle) {
        vehicle.key = "market";
        vehicle.db.update({
            key: "market",
        });
        try {
            this.addMarketVehicle(vehicle);
        } catch (err) {
            console.log(err);
        }  
        if (vehicle.fuelTimer) {
            timer.remove(vehicle.fuelTimer);
        }
        vehicle.destroy();
    },
    getRandomCarSpot() {
        return Math.floor(Math.random() * (marketCapacity));
    },
    destroyMarketVehicleById(id) {
        mp.vehicles.forEach((current) => {
            if (current.sqlId == id) {
                timer.remove(current.fuelTimer);
                current.destroy();
            }
        });
    },
    setMarketSpotFree(spotId) {
        marketSpots[spotId].isFree = true;
    },
    async sellAllCharacterVehicles(id) {
        let vehs = await db.Models.Vehicle.findAll({
            where: {
                key: "private",
                owner: id,
                parkingDate: null
            }
        })
        if (vehs.length == 0) return;

        let fullPrice = 0;
        for (let i = 0; i < vehs.length; i++) {
            let props = vehicles.getVehiclePropertiesByModel(vehs[i].modelName);
            await vehs[i].update({
                key: "market",
                owners: vehs[i].owners + 1
            });
            fullPrice += parseInt(props.price * PRICE_CONFIG.SELL);
            this.addMarketVehicle(vehs[i]);
        }
        //let player = mp.players.toArray().find(x => x.character && x.character.id == id);

        let player = mp.players.toArray().find(x => {
            if (!x.character) return;
            if (x.character.id == id) return true;
        });

        mp.vehicles.forEach((veh) => {
            if (veh.key == 'private' && veh.owner == id) {
                inventory.fullDeleteItemsByParams(33, 'vehId', veh.db.id);
                if (player) {
                    timer.remove(veh.fuelTimer);
                    veh.destroy();
                    vehicles.removeVehicleFromPlayerVehicleList(player, veh.sqlId);
                    vehicles.removeVehicleFromCarPlace(player, veh);

                    // inventory.deleteByParams(player, 33, 'vehId', veh.db.id);
                } else inventory.deleteByParams(id, 33, 'vehId', veh.db.id);
            }
        })
        money.addMoneyById(id, fullPrice, function(result) {
            if (result) {
                if (player) {
                    player.call('chat.message.push', [`!{#f3c800} Ваш дом продан государству за неуплату`]);
                    player.call('chat.message.push', [`!{#f3c800} Весь транспорт из гаража продан государству за !{#80c102}$${fullPrice}`]);
                    player.call('chat.message.push', [`!{#f3c800} Деньги поступили на ваш банковский счет`]);
                } else {
                    notify.warning(id, `За неуплату налогов на дом транспорт из гаража был продан государству`);
                    notify.warning(id, `Деньги за транспорт ($${fullPrice}) поступили на ваш счет`);
                }
            } else {
                console.log(`Ошибка начисления денег за авто, слетевшее в гос для игрока с ID ${id}`);
            }
        }, `Слет автомобилей в гос после слета дома`);
    },
    getPriceConfig() {
        return PRICE_CONFIG;
    }
}
