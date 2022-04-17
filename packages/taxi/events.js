let taxi = require('./index.js');
let money = call('money');
let vehicles = call('vehicles');
let jobs = call('jobs');
let timer = call('timer');
let utils = call('utils');
let notify = call('notifications');

module.exports = {
    "init": () => {
        taxi.init();
        inited(__dirname);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;

        if (shape.isTaxiStation) {
            if (player.character.job == 2) {
                player.call('taxi.jobmenu.show', [1]);
            } else {
                player.call('taxi.jobmenu.show', [0]);
            }

            player.currentColshape = shape;
        }
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;

        if (shape.isTaxiStation) {
            player.call('taxi.jobmenu.close');
            player.currentColshape = null;
        }
    },
    "taxi.employment": (player) => {
        if (player.character.job == 2) {
            mp.events.call("jobs.leave", player);
        } else {
            if (!player.character.carLicense) return player.call('notifications.push.error', ['У вас нет прав на легковой транспорт', 'Такси']);
            if (!player.phone) return player.call('notifications.push.error', ['Вам нужно иметь мобильный телефон', 'Такси'])
            mp.events.call("jobs.set", player, 2);
            player.call('phone.app.add', ['taxi', null]);
        }
    },
    "taxi.client.order.send": (player) => {
        if (player.vehicle) return player.call('taxi.client.order.ans', [0]);
        if (player.dimension != 0) return player.call('taxi.client.order.ans', [1]);
        if (player.character.cash < taxi.getPricePerKilometer()) return player.call('taxi.client.order.ans', [2]);
        if (taxi.doesClientHaveOrders(player.id)) return player.call('taxi.client.order.ans', [3]);
        taxi.addOrder(player.id, player.position);
        player.call('taxi.client.order.ans', [4]);
    },
    "taxi.driver.orders.get": (player) => {
        let orders = taxi.getOrders();
        player.call('taxi.driver.orders.load', [orders]);
    },
    "taxi.driver.orders.take": (player, orderId) => {
        if (player.character.job != 2) return player.call('taxi.driver.orders.take.ans', [3]);;
        if (!player.vehicle) return player.call('taxi.driver.orders.take.ans', [2]);
        if (player.vehicle.properties.vehType != 0 && player.vehicle.properties.vehType != 3) return player.call('taxi.driver.orders.take.ans', [6]);
        if (!player.character.carLicense) return player.call('taxi.driver.orders.take.ans', [4]);
        if (!player.vehicle.isActiveTaxi && (player.vehicle.key != 'private' && player.vehicle.owner != player)) return player.call('taxi.driver.orders.take.ans', [2]);
        if (player.currentTaxiDriverOrder || player.taxiDriverDestination) return player.call('taxi.driver.orders.take.ans', [5]);
        let order = taxi.getOrderById(orderId);
        if (order) {
            player.currentTaxiDriverOrder = order;
            taxi.deleteOrder(orderId);

            let target = mp.players.at(player.currentTaxiDriverOrder.clientId);
            if (!target) return; // todo
            target.currentTaxiClientOrder = {
                driverId: player.id,
                name: player.name,
                model: player.vehicle.properties.name,
                plate: player.vehicle.plate
            }
            target.call('taxi.client.order.taken', [target.currentTaxiClientOrder]);
            player.call('taxi.driver.orders.take.ans', [0, order]);
        } else {
            player.call('taxi.driver.orders.take.ans', [1]);
        }
    },
    "taxi.driver.route.arrive": (player) => {
        let order = player.currentTaxiDriverOrder;
        let client = mp.players.at(order.clientId);
        if (!client) return;
        if (!player.vehicle || player.vehicle.plate != client.currentTaxiClientOrder.plate) {
            mp.events.call('taxi.driver.order.cancel', player);
            player.call('notifications.push.error', ['Заказ был принят из другого т/с, заказ отменен', 'Такси']);
            return;
        }
        // if (!client.currentTaxiClientOrder) return;
        // if (client.currentTaxiClientOrder.driverId != player.id) return;

        client.call('taxi.client.car.ready');
    },
    "playerEnterVehicle": (player, vehicle, seat) => {
        if (seat != 0 && player.currentTaxiClientOrder) {
            if (player.currentTaxiClientOrder.plate == vehicle.plate) {
                player.call('taxi.client.car.enter');
                let driver = mp.players.at(player.currentTaxiClientOrder.driverId);
                driver.call('taxi.driver.car.entered');
            }
        }
        if (seat == 0 && player.id == vehicle.taxiDriverId) {
            timer.remove(vehicle.taxiRespawnTimer);
        }
    },
    "vehicle.ready": (player, vehicle, seat) => {
        if (vehicle.key == 'job' && vehicle.owner == 2 && seat == 0) {
            if (!vehicle.isActiveTaxi) {
                player.call('taxi.rent.show', [taxi.getRentPrice()]);
            } else {
                if (vehicle.taxiDriverId != player.id) {
                    player.call('notifications.push.error', ['Транспорт уже арендован', 'Такси']);
                    player.removeFromVehicle();
                }
            }
        }
    },
    "taxi.client.app.confirm": (player, destination) => {
        destination = JSON.parse(destination);
        let price = taxi.calculatePrice(player, destination)
        if (player.character.cash < price) return player.call('taxi.client.app.confirm.ans', [1]);

        let driver = mp.players.at(player.currentTaxiClientOrder.driverId);
        player.call('taxi.client.app.confirm.ans', [0]);
        driver.call('taxi.driver.destination.confirmed', [destination, price]);

        delete player.currentTaxiClientOrder;
        delete driver.currentTaxiDriverOrder;

        player.taxiClientDestination = {
            driverId: driver.id,
            startPosition: {
                x: player.position.x,
                y: player.position.y,
                z: player.position.z
            },
            destination: destination,
            price: price
        }
        driver.taxiDriverDestination = {
            clientId: player.id,
            destination: destination,
            price: price
        }
    },
    "taxi.driver.destination.reach": (player) => {
        let driver = player;
        let client = mp.players.at(driver.taxiDriverDestination.clientId);
        let price = driver.taxiDriverDestination.price;

        client.call('taxi.client.destination.reach');

        let commission = taxi.calculateComission(driver);
        money.removeCash(client, price, function (result) {
            if (result) {
                client.call('notifications.push.success', ['Вы оплатили поездку', 'Такси']);
                jobs.addJobExp(driver, 0.05);
                try {
                    money.addMoney(driver, parseInt((1 - commission) * price), function (result) {
                        if (result) {
                            driver.call('notifications.push.success', ['Деньги зачислены на счет', 'Такси']); // возможно лишнее
                            driver.call('notifications.push.info', [`Комиссия таксопарка составила ${100 * commission}%`, 'Такси']);
                            driver.call('notifications.push.info', [`Комиссия уменьшается с увеличением навыка таксиста`, 'Такси']);
                        } else {
                            driver.call('notifications.push.error', ['Ошибка зачисления денег', 'Такси']);
                        }
                    }, `Оплата поездки в такси клиентом #${client.character.id}`);
                } catch (err) {
                    console.log(err);
                }
            } else {
                client.call('notifications.push.error', ['Вы не смогли оплатить поездку', 'Такси']);
                driver.call('notifications.push.error', ['Клиент не смог оплатить поездку', 'Такси']);
            }
        }, `Оплата поездки в такси водителю #${driver.character.id}`);
        delete driver.taxiDriverDestination;
        delete client.taxiClientDestination;
    },
    "playerQuit": (player) => {
        mp.events.call('taxi.client.order.cancel', player);
        mp.events.call('taxi.driver.order.cancel', player);
        if (player.vehicle) {
            if (player.vehicle.taxiDriverId == player.id) {
                vehicles.respawnVehicle(player.vehicle);
            }
        }
    },
    "taxi.client.order.cancel": (player) => {
        taxi.deletePlayerOrders(player);

        if (player.currentTaxiClientOrder) {
            let driver = mp.players.at(player.currentTaxiClientOrder.driverId);
            driver.call('taxi.driver.order.canceled');
            delete driver.currentTaxiDriverOrder;
            delete player.currentTaxiClientOrder;
        }
        if (player.taxiClientDestination) {
            let driver = mp.players.at(player.taxiClientDestination.driverId);
            driver.call('taxi.driver.order.canceled');
            delete driver.taxiDriverDestination;
            delete player.taxiClientDestination;
        }
    },
    "taxi.driver.order.cancel": (player) => {
        if (player.currentTaxiDriverOrder) {
            let client = mp.players.at(player.currentTaxiDriverOrder.clientId);
            client.call('taxi.client.order.canceled');
            delete player.currentTaxiDriverOrder;
            delete client.currentTaxiClientOrder;
        }
        if (player.taxiDriverDestination) {
            let client = mp.players.at(player.taxiDriverDestination.clientId);
            client.call('taxi.client.order.canceled');
            delete player.taxiDriverDestination;
            delete client.taxiClientDestination;
        }
    },
    "taxi.rent.accept": (player, accept) => {
        if (!accept || !player.vehicle) {
            player.call('notifications.push.warning', ['Вы отказались от аренды', 'Такси']);
            if (player.vehicle) player.removeFromVehicle();
            return;
        }
        let vehicle = player.vehicle;
        if (vehicle.key != 'job' || vehicle.owner != 2) {
            player.call('notifications.push.warning', ['Аренда невозможна', 'Такси']);
            return;
        }

        let price = taxi.getRentPrice();
        if (player.character.cash < price) {
            player.call('notifications.push.error', ['Недостаточно денег', 'Такси']);
            if (player.vehicle) player.removeFromVehicle();
            return;
        }

        money.removeCash(player, price, function (result) {
            if (result) {
                vehicle.isActiveTaxi = true;
                vehicle.taxiDriverId = player.id;
                player.call('notifications.push.success', ['Вы арендовали транспорт', 'Такси']);
            } else {
                player.call('notifications.push.error', ['Ошибка аренды', 'Такси']);
                if (player.vehicle) player.removeFromVehicle();
            }
        }, `Аренда такси`);

    },
    "playerExitVehicle": (player, vehicle) => {
        if (vehicle.taxiDriverId == player.id) {
            player.call('notifications.push.warning', [`У вас есть ${taxi.getRespawnTimeout() / 1000} секунд, чтобы вернуться в транспорт`, 'Такси']);
            timer.remove(vehicle.taxiRespawnTimer);
            vehicle.taxiRespawnTimer = timer.add(() => {
                try {
                    vehicles.respawnVehicle(vehicle);
                } catch (err) {
                    console.log(err);
                }
            }, taxi.getRespawnTimeout());
        }
        if (player.taxiClientDestination) {
            let dest = Object.assign({}, player.taxiClientDestination);
            mp.events.call('taxi.client.order.cancel', player);
            player.call('taxi.client.car.leave');


            let driver = mp.players.at(dest.driverId);
            if (!driver) return console.log('Нет водителя');
            let entireDist = utils.vdistSqr(dest.startPosition, dest.destination);
            let currentDist = entireDist - utils.vdistSqr({ x: player.position.x, y: player.position.y, z: player.position.z }, dest.destination);
            if (currentDist / entireDist > 0.5) {
                let sum = Math.round((entireDist / 1000) * 0.5 * taxi.getPricePerKilometer());
                if (!sum) return;
                money.moveCash(player, driver, sum, function (result) {
                    if (result) {
                        notify.warning(player, 'Вы покинули такси, с вас списана часть суммы поездки');
                        notify.warning(driver, 'Клиент покинул такси, вам начислена компенсация');
                    } else {
                        console.log('Ошибка начисления денег за компенсацию такси');
                    }
                }, `Компенсация за поездку такси`, `Компенсация за поездку такси`)
            }
        }
    },
    "vehicle.respawned": (veh) => {
        if (veh.isActiveTaxi) {
            vehicle.isActiveTaxi = null;
            vehicle.taxiDriverId = null;
        }
    }
}
