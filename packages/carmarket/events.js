var carmarket = require('./index.js');
var money = call('money');
var vehicles = call('vehicles');
var houses = call('houses');
var inventory = call('inventory');

let PRICE_CONFIG = carmarket.getPriceConfig();

module.exports = {
    "init": async () => {
        await carmarket.init();
        inited(__dirname);
    },
    "vehicles.loaded": async () => {
        await carmarket.loadCarMarketData();
        await carmarket.loadCarMarketVehicles();
    },
    "playerEnterColshape": (player, shape) => {
        if (shape.isCarMarket) {
            player.call('carmarket.colshape.enter');
            if (!player.vehicle) {
                player.call('prompt.showByName', ['carmarket_noveh']);
            } else {
                player.call('prompt.showByName', ['carmarket_control']);
            }
        }
    },
    "playerExitColshape": (player, shape) => {
        if (shape.isCarMarket) {
            player.call('carmarket.colshape.leave');
        }
    },
    "carmarket.sellmenu.show": (player) => {
        if (!player.vehicle) return;
        if (!carmarket.isPlayerInCarMarketColshape(player)) return;
        if (player.vehicle.key != 'private' || player.vehicle.owner != player.character.id) return player.call('notifications.push.error', ['Это не ваш транспорт', 'Ошибка']);
        player.call('notifications.push.info', [`За этот транспорт вы получите $${(player.vehicle.properties.price * PRICE_CONFIG.SELL).toFixed()}`, `Авторынок`]);
        player.call('carmarket.sellmenu.show');
    },
    "carmarket.car.sell": (player) => {
        if (!player.vehicle) return player.call('carmarket.car.sell.ans, [0]');
        if (!carmarket.isPlayerInCarMarketColshape(player)) return player.call('carmarket.car.sell.ans', [1]);;
        if (player.vehicle.key != 'private' || player.vehicle.owner != player.character.id) return player.call('carmarket.car.sell.ans', [0]);

        let price = (player.vehicle.properties.price * PRICE_CONFIG.SELL).toFixed();
       
        let info = {
            name: player.vehicle.properties.name,
            id: player.vehicle.sqlId,
            plate: player.vehicle.plate
        }

        money.addCash(player, price, function(result) {
            if (result) {
                try {
                    vehicles.removeVehicleFromPlayerVehicleList(player, player.vehicle.sqlId);
                    vehicles.removeVehicleFromCarPlace(player, player.vehicle);
                } catch (err) {
                    console.log(err);
                }
                player.vehicle.d = 0;
                let vehicleId = player.vehicle.db.id;
                carmarket.sellCar(player.vehicle);
                player.call('carmarket.car.sell.ans', [3, price]);
                // удаление ключей
                // inventory.deleteByParams(player, 33, 'vehId', vehicleId);
                inventory.fullDeleteItemsByParams(33, 'vehId', vehicleId);
            } else {
                console.log(`${player.name} не смог продать авто на рынке (addcash error)`)
                player.call('carmarket.car.sell.ans', [2]);
            }
        }, `Продажа на авторынке т/с ${info.name} (ID ${info.id} | PLATE ${info.plate})`);
    },
    "playerEnterVehicle": (player, vehicle, seat) => {
        if (vehicle.key == 'market' && seat == 0) {
            let data = {
                name: vehicle.properties.name,
                price: vehicle.properties.price * PRICE_CONFIG.BUY,
                mileage: vehicle.mileage,
                owners: vehicle.owners,
                regDate: vehicle.regDate
            }
            player.call('carmarket.buymenu.show', [data]);
        }
    },
    "playerExitVehicle": (player, vehicle) => {
        if (vehicle.key == 'market') {
            player.call('carmarket.buymenu.close');
        }
    },
    "carmarket.car.buy": (player) => {

        if (!player.vehicle || player.vehicle.key != 'market' || player.seat != 0) return player.call('carmarket.car.buy.ans', [0]);


        let price = (player.vehicle.properties.price * PRICE_CONFIG.BUY).toFixed();

        if (player.character.cash < price) return player.call('carmarket.car.buy.ans', [3]);

        let hasHouse = houses.isHaveHouse(player.character.id);
        // if (!hasHouse) {
        //     if (player.vehicleList.length > 1) return player.call('carmarket.car.buy.ans', [4]);
        // } else {
        //     if (player.vehicleList.length + 1 > player.carPlaces.length - 1) return player.call('carmarket.car.buy.ans', [4]);
        // }
        if (!vehicles.isAbleToBuyVehicle(player)) return player.call('carmarket.car.buy.ans', [4]);

        var params = {
            owner: player.character.id,
            vehId: player.vehicle.db.id,
            vehName: player.vehicle.properties.name
        };
        var cant = inventory.cantAdd(player, 33, params);
        if (cant) return player.call('carmarket.car.buy.ans', [5, {
            text: cant
        }]);

        let info = {
            name: player.vehicle.properties.name,
            id: player.vehicle.sqlId,
            plate: player.vehicle.plate
        }

        money.removeCash(player, price, function(result) {
            if (result) {

                inventory.fullDeleteItemsByParams(33, 'vehId', params.vehId);
                // выдача ключей в инвентарь
                inventory.addItem(player, 33, params, (e) => {
                    if (e) player.call('carmarket.car.buy.ans', [5, {
                        text: e
                    }]);
                });

                let carInfo = {
                    name: player.vehicle.properties.name,
                    price: price
                }

                player.vehicle.key = 'private';
                player.vehicle.owner = player.character.id;

                player.vehicle.db.update({
                    key: 'private',
                    owner: player.character.id,
                    owners: player.vehicle.owners + 1,
                });
                player.vehicle.owners = player.vehicle.owners + 1;
                player.call('vehicles.enter.private', [true]);
                if (hasHouse) vehicles.setVehicleHomeSpawnPlace(player);
                carmarket.setMarketSpotFree(player.vehicle.marketSpot);

                let veh = player.vehicle;
                player.vehicleList.push({
                    id: veh.sqlId,
                    name: veh.properties.name,
                    plate: veh.plate,
                    regDate: veh.regDate,
                    owners: veh.owners,
                    vehType: veh.properties.vehType,
                    price: veh.properties.price,
                    parkingDate: veh.parkingDate,
                    dbInstance: veh.db
                });


                player.call('carmarket.car.buy.ans', [2, carInfo]);
                mp.events.call('vehicles.engine.toggle', player);
            } else {
                player.call('carmarket.car.buy.ans', [1]);
            }
        }, `Покупка на авторынке т/с ${info.name} (ID ${info.id} | PLATE ${info.plate})`);
    }
}
