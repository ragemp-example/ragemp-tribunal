let bus = require('./index.js');
let money = call('money');
let vehicles = call('vehicles');
let notify = call('notifications');
let jobs = call('jobs');
let timer = call('timer');

module.exports = {
    "init": () => {
        bus.init();
        inited(__dirname);
    },
    "busdriver.employment": (player) => {
        if (player.character.job == 3) {
            mp.events.call("jobs.leave", player);
        } else {
            if (!player.character.passengerLicense) return notify.error(player, 'У вас нет прав на пассажирский транспорт', 'Автобусная станция');
            mp.events.call("jobs.set", player, 3);
        }
    },
    "busdriver.route.add": async (player, data) => {
        data = JSON.parse(data);
        let route = await db.Models.BusRoute.create({
            name: data.name,
            level: data.level,
            salary: data.salary
        });
        for (i = 0; i < data.points.length; i++) {
            await db.Models.BusRoutePoint.create({
                routeId: route.id,
                x: data.points[i].x,
                y: data.points[i].y,
                z: data.points[i].z,
                isStop: data.points[i].isStop
            });
        }
        notify.success(player, 'Маршрут создан', 'Route Creator');
    },
    "vehicle.ready": (player, vehicle, seat) => {
        if (vehicle.key == 'job' && vehicle.owner == 3 && seat == 0) {
            if (!vehicle.isActiveBus) {
                if (player.hasBusRent) {
                    notify.error(player, 'Вы уже арендуете автобус', 'Автобус');
                    player.removeFromVehicle();
                    return;
                }
                player.call('busdriver.rent.show', [bus.getRentPrice()]);
            } else {
                if (vehicle.busDriverId != player.id) {
                    notify.error(player, 'Транспорт уже арендован', 'Автобус');
                    player.removeFromVehicle();
                }
            }
        }
    },
    "busdriver.rent.accept": (player, accept) => {
        if (!accept || !player.vehicle) {
            player.call('busdriver.rent.ans', [4]);
            if (player.vehicle) player.removeFromVehicle();
            return;
        }
        let vehicle = player.vehicle;
        if (vehicle.key != 'job' || vehicle.owner != 3) {
            player.call('busdriver.rent.ans', [3]);
            return;
        }

        let price = bus.getRentPrice();
        if (player.character.cash < price) {
            player.call('busdriver.rent.ans', [2]);
            if (player.vehicle) player.removeFromVehicle();
            return;
        }

        money.removeCash(player, price, function (result) {
            if (result) {
                vehicle.isActiveBus = true;
                vehicle.busDriverId = player.id;
                let routes = bus.getAvailiableRoutes(player);
                player.hasBusRent = true;
                if (routes.length == 0) notify.warning(player, 'Нет доступных маршрутов', 'Автобус');
                player.call('busdriver.rent.ans', [0, routes]);

            } else {
                player.call('busdriver.rent.ans', [1]);
                if (player.vehicle) player.removeFromVehicle();
            }
        }, `Аренда автобуса`);

    },
    "busdriver.route.start": (player, routeId, price) => {
        if (!player.vehicle || !player.vehicle.isActiveBus) return player.call('busdriver.route.start.ans', [0]);
        let route = bus.getRouteById(routeId);
        player.vehicle.hasBusRoute = true;
        player.busRoute = route;
        player.busPointIndex = 0;
        player.busPoints = route.BusRoutePoints.map(function (current) {
            return {
                x: current.x,
                y: current.y,
                z: current.z,
                isStop: current.isStop
            }
        })
        let label = (price == 0) ? `~y~${player.busRoute.name} \n~g~Проезд бесплатный` : `~y~${player.busRoute.name} \n ~w~Стоимость проезда: ~g~$${price}`;
        player.vehicle.setVariable('label', label);
        player.vehicle.busPrice = price;
        player.busPointsToSave = 0;
        player.busPassengers = 0;
        player.call('busdriver.route.start.ans', [1, player.busPoints[0]]);
    },
    "busdriver.menu.closed": (player) => {
        if (player.vehicle) player.removeFromVehicle();
    },
    "playerEnterVehicle": (player, vehicle, seat) => {
        if (seat == 0 && player.id == vehicle.busDriverId) {
            timer.remove(vehicle.busRespawnTimer);
        }
        if (seat == 0 && vehicle.isActiveBus && vehicle.busDriverId != player.id) {
            player.call('notifications.push.error', ['Транспорт уже арендован', 'Автобус']);
            player.removeFromVehicle();
        }
        if (seat == 0 && vehicle.busDriverId == player.id && !vehicle.hasBusRoute) {
            let routes = bus.getAvailiableRoutes(player);
            if (routes.length == 0) notify.warning(player, 'Нет доступных маршрутов', 'Автобус');
            player.call('busdriver.menu.show', [routes]);
        }
        if (seat != 0 && vehicle.busDriverId != player.id && vehicle.hasBusRoute) {

            let driver = mp.players.at(vehicle.busDriverId);
            if (!driver || !mp.players.exists(driver)) {
                notify.error(player, 'Нет водителя');
                player.removeFromVehicle();
                return;
            }
            if (!vehicle.busPrice) return driver.busPassengers++;

            let price = vehicle.busPrice;
            if (player.character.cash < price) {
                notify.error(player, 'Недостаточно денег');
                player.removeFromVehicle();
                return;
            }
            money.moveCash(player, driver, price, function (result) {
                if (result) {
                    notify.success(driver, `+$${price} за пассажира`, `Автобус`);
                    player.busPassengers++;
                } else {
                    notify.error(player, 'Ошибка оплаты');
                    player.removeFromVehicle();
                }
            }, `Деньги за пассажира в автобусе`);
        }
    },
    "busdriver.checkpoint.entered": (player) => {
        if (!player.vehicle) return;
        if (player.vehicle.busDriverId != player.id) return;

        let bonus = bus.calculateBonus(player);
        let salary = parseInt(player.busRoute.salary * (1 + bonus));
        player.character.pay += salary * jobs.bonusPay;
        player.busPointsToSave++;
        if (player.busPointsToSave % 10 == 0) {
            player.character.save();
            jobs.addJobExp(player, 0.05);
        }
        let timeout;
        if (player.busPoints[player.busPointIndex].isStop) {
            notify.info(player, 'Ожидайте пассажиров', 'Остановка');
            timeout = bus.getStopTimeout();

            mp.players.forEachInRange(player.position, 10, (current) => {
                if (current.dimension == player.dimension && current.character) {
                    current.call(`chat.message.push`, [`!{#fff589}Автобус по маршруту !{#8ef0ff}${player.busRoute.name} !{#fff589}отправляется через ${timeout / 1000} секунд`]);
                }
            });
        } else {
            notify.success(player, 'Продолжайте движение', 'Маршрут');
            timeout = 0;
        }
        player.busPointIndex++;
        if (player.busPointIndex == player.busPoints.length) player.busPointIndex = 0;
        let point = player.busPoints[player.busPointIndex];
        player.call('busdriver.checkpoint.create', [point, timeout]);
    },
    "playerExitVehicle": (player, vehicle) => {
        if (vehicle.busDriverId == player.id && !vehicle.hasBusRoute && vehicle.isActiveBus) {
            player.call('busdriver.menu.close');
        }

        if (vehicle.busDriverId == player.id) {
            if (vehicle.busWorkdayEnded) return;
            player.call('notifications.push.warning', [`У вас есть ${bus.getRespawnTimeout() / 1000} секунд, чтобы вернуться в транспорт`, 'Автобус']);
            timer.remove(vehicle.busRespawnTimer);
            vehicle.busRespawnTimer = timer.add(() => {
                vehicles.respawnVehicle(vehicle);
                mp.events.call('busdriver.route.end', player);
            }, bus.getRespawnTimeout());
        }
    },
    "busdriver.route.end": (player) => {
        if (!player || !mp.players.exists(player)) return;
        notify.info(player, 'Рабочий день окончен');
        delete player.hasBusRent;
        if (!player.busRoute) return;
        player.call('busdriver.route.end');
        player.call(`chat.message.push`, [`!{#f3c800}Рабочий день окончен. Деньги придут на счет во время зарплаты`]);
        player.call(`chat.message.push`, [`!{#f3c800}Заработано: !{#80c102}$${player.busPointsToSave * player.busRoute.salary * jobs.bonusPay}`]);
        player.call(`chat.message.push`, [`!{#f3c800}Перевезено пассажиров: !{#009eec}${player.busPassengers}`]);
        delete player.busRoute;
        delete player.busPointIndex;
        delete player.busPoints;
        delete player.busPassengers;
        delete player.busPointsToSave;
    },
    "busdriver.workday.end": (player) => {
        if (!player || !mp.players.exists(player)) return;
        let vehicle = player.vehicle;
        if (vehicle.busDriverId !== player.id) return notify.warning(player, 'Вы не в автобусе!');
        vehicle.busWorkdayEnded = true;
        player.call('busdriver.status.set', [false]);
        vehicles.respawnVehicle(vehicle);
        mp.events.call('busdriver.route.end', player);
    },
    "playerQuit": (player) => {
        let vehicle = player.vehicle;
        if (!vehicle) return;
        if (vehicle.busDriverId == player.id) {
            vehicles.respawnVehicle(vehicle);
        }
    },
    "vehicle.respawned": (veh) => {
        if (veh.isActiveBus) {
            vehicle.isActiveBus = null;
            vehicle.busDriverId = null;
            veh.setVariable("label", null);
        }
    },
}
